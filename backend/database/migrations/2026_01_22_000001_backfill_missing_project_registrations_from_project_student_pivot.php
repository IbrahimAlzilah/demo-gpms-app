<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Backfills missing project_registrations records from project_student pivot table.
     * This ensures database consistency - every student in project_student should have
     * a corresponding project_registrations record.
     */
    public function up(): void
    {
        // Find all students in project_student pivot who don't have a corresponding project_registrations record
        $missingRegistrations = DB::table('project_student')
            ->leftJoin('project_registrations', function ($join) {
                $join->on('project_student.project_id', '=', 'project_registrations.project_id')
                     ->on('project_student.student_id', '=', 'project_registrations.student_id');
            })
            ->whereNull('project_registrations.id')
            ->select(
                'project_student.project_id',
                'project_student.student_id',
                'project_student.created_at as pivot_created_at',
                'project_student.updated_at as pivot_updated_at'
            )
            ->get();

        // Create missing registration records
        foreach ($missingRegistrations as $missing) {
            DB::table('project_registrations')->insert([
                'project_id' => $missing->project_id,
                'student_id' => $missing->student_id,
                'status' => 'approved',
                'submitted_at' => $missing->pivot_created_at ?? now(),
                'reviewed_at' => $missing->pivot_updated_at ?? $missing->pivot_created_at ?? now(),
                'reviewed_by' => null,
                'review_comments' => null,
                'created_at' => $missing->pivot_created_at ?? now(),
                'updated_at' => $missing->pivot_updated_at ?? now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This does not delete the backfilled records as they may be legitimate.
     * If you need to reverse this migration, you should manually identify and remove
     * the records that were created by this migration.
     */
    public function down(): void
    {
        // This migration is one-way for data consistency
        // The backfilled records should remain as they represent actual registrations
    }
};
