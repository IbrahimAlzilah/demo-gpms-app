<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Enums\TimePeriodType;
use App\Models\Document;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use App\Services\TimeWindowService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    /**
     * Upload a document
     */
    public function upload(
        Project $project,
        UploadedFile $file,
        string $type,
        User $submitter,
        ?int $chapterNumber = null
    ): Document
    {
        // Ensure project is approved and in progress for a registered group
        if ($project->status !== ProjectStatus::IN_PROGRESS) {
            throw new \Exception('Documents can only be submitted for projects that are approved and in progress.');
        }

        if (!$project->assigned_group_id) {
            throw new \Exception('Documents can only be submitted for registered project groups.');
        }

        // Enforce period-based and sequential rules
        if ($type === 'chapters') {
            if ($chapterNumber === null) {
                throw new \Exception('Chapter number is required for chapter documents.');
            }

            if ($chapterNumber < 1 || $chapterNumber > 6) {
                throw new \Exception('Chapter number must be between 1 and 6.');
            }

            $this->ensureChapterWindowIsActive($chapterNumber, $submitter);
            $this->ensureChapterSequenceIsValid($project, $chapterNumber);
        } else {
            $this->ensureFinalDocumentsWindowIsActive($submitter);
        }

        // Sanitize filename to prevent issues with special characters and Arabic characters
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);

        // Replace special characters and Arabic characters with underscores
        $sanitized = preg_replace('/[^\w\s-]/u', '_', $nameWithoutExt);
        $sanitized = preg_replace('/\s+/u', '_', $sanitized);
        $sanitized = preg_replace('/_+/u', '_', $sanitized);
        $sanitized = trim($sanitized, '_');

        // If sanitized name is empty, use a default
        if (empty($sanitized)) {
            $sanitized = 'document';
        }

        // Limit length to 200 characters
        $sanitized = mb_substr($sanitized, 0, 200);

        $fileName = time() . '_' . $sanitized . ($extension ? '.' . $extension : '');
        $filePath = $file->storeAs('documents', $fileName, 'documents');

        return Document::create([
            'type' => $type,
            'chapter_number' => $chapterNumber,
            'project_id' => $project->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'submitted_by' => $submitter->id,
            'review_status' => 'pending',
        ]);
    }

    /**
     * Ensure the correct chapter submission window is active for the requested chapter.
     */
    protected function ensureChapterWindowIsActive(int $chapterNumber, User $user): void
    {
        /** @var \App\Services\TimeWindowService $timeWindowService */
        $timeWindowService = app(TimeWindowService::class);

        $windowType = $chapterNumber <= 3
            ? TimePeriodType::CHAPTER_SUBMISSION_PHASE_1
            : TimePeriodType::CHAPTER_SUBMISSION_PHASE_2;

        $result = $timeWindowService->canPerformAction($windowType, $user);

        if (!($result['allowed'] ?? false)) {
            $message = $result['message'] ?? 'Chapter submission is not allowed at this time.';
            throw new \Exception($message);
        }
    }

    /**
     * Ensure the final project documents submission window is active.
     */
    protected function ensureFinalDocumentsWindowIsActive(User $user): void
    {
        /** @var \App\Services\TimeWindowService $timeWindowService */
        $timeWindowService = app(TimeWindowService::class);

        $result = $timeWindowService->canPerformAction(TimePeriodType::FINAL_PROJECT_DOCUMENT_SUBMISSION, $user);

        if (!($result['allowed'] ?? false)) {
            $message = $result['message'] ?? 'Final project documents can only be submitted during the final documents submission period.';
            throw new \Exception($message);
        }
    }

    /**
     * Enforce sequential chapter submission and defense-completion rules.
     */
    protected function ensureChapterSequenceIsValid(Project $project, int $chapterNumber): void
    {
        // Prevent multiple pending submissions for the same chapter
        $hasPendingForChapter = $project->documents()
            ->where('type', 'chapters')
            ->where('chapter_number', $chapterNumber)
            ->where('review_status', 'pending')
            ->exists();

        if ($hasPendingForChapter) {
            throw new \Exception('You already have a pending submission for this chapter. Please wait for supervisor review.');
        }

        // Enforce previous chapter approval for chapters 2–6
        if ($chapterNumber > 1) {
            $previousChapter = $chapterNumber - 1;

            $previousApproved = $project->documents()
                ->where('type', 'chapters')
                ->where('chapter_number', $previousChapter)
                ->where('review_status', 'approved')
                ->exists();

            if (!$previousApproved) {
                throw new \Exception("You must wait until Chapter {$previousChapter} is approved before submitting Chapter {$chapterNumber}.");
            }
        }

        // Phase 2 chapters (4–6) additionally require Final Defense – 1 to be completed
        if ($chapterNumber >= 4 && !$this->isFinalDefensePhaseOneCompleted($project)) {
            throw new \Exception('Phase 2 chapters can only be submitted after Final Defense – 1 is completed.');
        }
    }

    /**
     * Determine if Final Defense – 1 is completed for the project.
     *
     * For now, we treat \"completed\" as: every student assigned to the project
     * has a grade with a calculated final_grade that has been approved.
     */
    protected function isFinalDefensePhaseOneCompleted(Project $project): bool
    {
        $students = $project->students()->pluck('users.id');

        if ($students->isEmpty()) {
            return false;
        }

        $grades = $project->grades()
            ->whereIn('student_id', $students)
            ->get()
            ->keyBy('student_id');

        foreach ($students as $studentId) {
            /** @var Grade|null $grade */
            $grade = $grades->get($studentId);

            if (!$grade || !$grade->final_grade || !$grade->is_approved) {
                return false;
            }
        }

        return true;
    }

    /**
     * Delete a document
     */
    public function delete(Document $document): bool
    {
        // Delete file from storage
        if (Storage::disk('documents')->exists($document->file_path)) {
            Storage::disk('documents')->delete($document->file_path);
        }

        return $document->delete();
    }

    /**
     * Review a document
     */
    public function review(Document $document, User $reviewer, string $status, ?string $comments = null): Document
    {
        if (!in_array($status, ['approved', 'rejected'])) {
            throw new \Exception('Invalid review status');
        }

        $document->update([
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_status' => $status,
            'review_comments' => $comments,
        ]);

        return $document->fresh();
    }
}

