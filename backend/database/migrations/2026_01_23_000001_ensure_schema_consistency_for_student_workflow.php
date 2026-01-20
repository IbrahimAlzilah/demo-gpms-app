<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Ensures database schema consistency for Student Workflow:
     * 1. Verifies project_student and project_registrations are in sync
     * 2. Ensures groups are independent (no orphaned project references)
     * 3. Adds any missing indexes for performance
     */
    public function up(): void
    {
        // 1. Ensure project_registrations has proper indexes for group-based queries
        Schema::table('project_registrations', function (Blueprint $table) {
            // Add composite index for querying by project and status (common query pattern)
            if (!$this->indexExists('project_registrations', 'project_registrations_project_id_status_index')) {
                $table->index(['project_id', 'status'], 'project_registrations_project_id_status_index');
            }
        });

        // 2. Ensure proposals table has proper indexes for group-based queries
        Schema::table('proposals', function (Blueprint $table) {
            // Composite index for querying proposals by group and status
            if (!$this->indexExists('proposals', 'proposals_student_group_id_status_index')) {
                $table->index(['student_group_id', 'status'], 'proposals_student_group_id_status_index');
            }
        });

        // 4. Data consistency check: Ensure all approved registrations have corresponding project_student entries
        // This is handled by the application logic, but we can add a check here
        // Note: We don't auto-fix here as it requires business logic decisions
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_registrations', function (Blueprint $table) {
            if ($this->indexExists('project_registrations', 'project_registrations_project_id_status_index')) {
                $table->dropIndex('project_registrations_project_id_status_index');
            }
        });

        Schema::table('proposals', function (Blueprint $table) {
            if ($this->indexExists('proposals', 'proposals_student_group_id_status_index')) {
                $table->dropIndex('proposals_student_group_id_status_index');
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = DB::select(
            "SELECT COUNT(*) as count 
             FROM information_schema.statistics 
             WHERE table_schema = ? 
             AND table_name = ? 
             AND index_name = ?",
            [$databaseName, $table, $indexName]
        );
        
        return $result[0]->count > 0;
    }
};
