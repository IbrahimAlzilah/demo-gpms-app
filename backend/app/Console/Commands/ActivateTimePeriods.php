<?php

namespace App\Console\Commands;

use App\Models\TimePeriod;
use App\Models\User;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ActivateTimePeriods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'periods:activate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate time periods when their start date is reached and send notifications to students';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->startOfDay();
        $activatedCount = 0;
        $notifiedCount = 0;

        // Find periods that should be active but are not yet activated
        // Conditions:
        // 1. is_active = false (not manually activated)
        // 2. start_date <= today (start date has been reached)
        // 3. end_date >= today (period hasn't ended - end date is inclusive)
        $periodsToActivate = TimePeriod::where('is_active', false)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->get();

        foreach ($periodsToActivate as $period) {
            // Double-check that period should be active
            if (!$period->shouldBeActive()) {
                continue;
            }

            // Activate the period
            $period->update(['is_active' => true]);
            $activatedCount++;

            $this->info("Activated period: {$period->name} (Type: {$period->type})");

            // Send notifications to all students
            $students = User::role('student')->get(['id']);
            if ($students->isNotEmpty()) {
                $now = now();
                $notifications = $students->map(function ($student) use ($period, $now) {
                    return [
                        'user_id' => $student->id,
                        'message' => json_encode([
                            'key' => 'notifications.periods.activated',
                            'params' => [
                                'type' => $period->type,
                                'name' => $period->name,
                            ],
                        ]),
                        'type' => 'period_announcement',
                        'related_entity_type' => TimePeriod::class,
                        'related_entity_id' => $period->id,
                        'is_read' => false,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })->toArray();

                Notification::insert($notifications);
                $notifiedCount += count($notifications);
            }
        }

        // Also deactivate periods that have passed their end date
        // Periods are deactivated the day AFTER the end date
        $periodsToDeactivate = TimePeriod::where('is_active', true)
            ->where('end_date', '<', $today)
            ->get();

        foreach ($periodsToDeactivate as $period) {
            $period->update(['is_active' => false]);
            $this->info("Deactivated expired period: {$period->name} (Type: {$period->type})");
        }

        if ($activatedCount > 0) {
            $this->info("Activated {$activatedCount} period(s) and sent {$notifiedCount} notification(s).");
        } else {
            $this->info("No periods to activate at this time.");
        }

        return Command::SUCCESS;
    }
}
