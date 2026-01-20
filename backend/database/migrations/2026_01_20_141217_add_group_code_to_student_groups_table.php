<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // This migration is no longer needed as group_code is now included
        // in the create_student_groups_table migration (2026_01_21_000001).
        // This check ensures it only runs if the table exists but column doesn't
        // (in case this migration runs before the create table migration).
        if (Schema::hasTable('student_groups') && !Schema::hasColumn('student_groups', 'group_code')) {
            Schema::table('student_groups', function (Blueprint $table) {
                $table->string('group_code')->unique()->nullable()->after('name');
            });
        }
        // If table doesn't exist, skip silently - it will be created with group_code in the create migration
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: column is part of table creation, not this migration
    }
};
