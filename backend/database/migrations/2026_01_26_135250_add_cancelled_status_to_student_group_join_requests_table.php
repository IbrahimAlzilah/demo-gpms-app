<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL doesn't support directly modifying enum columns, so we use raw SQL
        DB::statement("ALTER TABLE `student_group_join_requests` MODIFY COLUMN `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'cancelled' from enum (but first update any cancelled records to rejected)
        DB::statement("UPDATE `student_group_join_requests` SET `status` = 'rejected' WHERE `status` = 'cancelled'");
        DB::statement("ALTER TABLE `student_group_join_requests` MODIFY COLUMN `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
