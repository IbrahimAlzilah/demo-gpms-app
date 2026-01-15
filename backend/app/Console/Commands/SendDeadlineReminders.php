<?php

namespace App\Console\Commands;

use App\Models\TimePeriod;
use App\Models\User;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Enums\TimePeriodType;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendDeadlineReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-deadline-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send deadline reminders for active time periods';

    public function __construct(
        protected NotificationService $notificationService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminderDays = [7, 3, 1]; // Days before deadline to send reminders
        $today = Carbon::today();
        $count = 0;

        // Get all active time periods that are currently active or will be active
        $periods = TimePeriod::where('is_active', true)
            ->where('end_date', '>=', $today)
            ->get();

        foreach ($periods as $period) {
            $daysRemaining = $today->diffInDays($period->end_date, false);

            // Check if we should send a reminder for this period
            foreach ($reminderDays as $daysBefore) {
                if ($daysRemaining == $daysBefore) {
                    // Determine which users should receive this reminder based on period type
                    $users = $this->getUsersForPeriodType($period->type);

                    foreach ($users as $user) {
                        // Check if we already sent this reminder to avoid duplicates
                        $notificationType = "deadline_{$period->type}_{$daysBefore}d";

                        $existing = Notification::where('user_id', $user->id)
                            ->where('type', $notificationType)
                            ->where('related_entity_type', 'time_period')
                            ->where('related_entity_id', $period->id)
                            ->where('created_at', '>=', $today->copy()->subDays(2)) // Within last 2 days
                            ->exists();

                        if (!$existing) {
                            $periodLabel = $this->getPeriodTypeLabel($period->type);
                            $message = "موعد تسليم قريب: {$periodLabel}\n";
                            $message .= "موعد التسليم خلال {$daysBefore} " . ($daysBefore > 1 ? 'أيام' : 'يوم');

                            $this->notificationService->create(
                                $user,
                                $message,
                                $notificationType,
                                'time_period',
                                $period->id
                            );

                            $count++;
                        }
                    }
                }
            }
        }

        $this->info("Sent {$count} deadline reminder notifications.");

        return Command::SUCCESS;
    }

    /**
     * Get users who should receive reminders for a specific period type
     */
    private function getUsersForPeriodType(string $periodType): \Illuminate\Database\Eloquent\Collection
    {
        return match ($periodType) {
            TimePeriodType::PROPOSAL_SUBMISSION->value => User::whereIn('role', ['student', 'supervisor'])
                ->where('status', 'active')
                ->get(),
            TimePeriodType::PROJECT_REGISTRATION->value => User::where('role', 'student')
                ->where('status', 'active')
                ->get(),
            TimePeriodType::DOCUMENT_SUBMISSION->value => User::where('role', 'student')
                ->where('status', 'active')
                ->get(),
            TimePeriodType::SUPERVISOR_EVALUATION->value => User::where('role', 'supervisor')
                ->where('status', 'active')
                ->get(),
            TimePeriodType::COMMITTEE_EVALUATION->value,
            TimePeriodType::DISCUSSION_EVALUATION->value => User::whereIn('role', ['projects_committee', 'discussion_committee'])
                ->where('status', 'active')
                ->get(),
            TimePeriodType::GRADE_APPROVAL->value => User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->get(),
            TimePeriodType::FINAL_DISCUSSION->value => User::where('role', 'student')
                ->where('status', 'active')
                ->get(),
            default => collect([]),
        };
    }

    /**
     * Get Arabic label for period type
     */
    private function getPeriodTypeLabel(string $periodType): string
    {
        $type = TimePeriodType::tryFrom($periodType);
        return $type ? $type->label() : $periodType;
    }
}
