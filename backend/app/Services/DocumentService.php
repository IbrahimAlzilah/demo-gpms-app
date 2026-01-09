<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    /**
     * Upload a document
     */
    public function upload(Project $project, UploadedFile $file, string $type, User $submitter): Document
    {
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

