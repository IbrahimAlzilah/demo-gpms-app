<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add 'canceled' status so the committee can mark a request as canceled
     * when they change or remove the project supervisor.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE supervisor_assignment_requests MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'canceled') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally move canceled back to rejected for rollback
        DB::table('supervisor_assignment_requests')->where('status', 'canceled')->update(['status' => 'rejected']);
        DB::statement("ALTER TABLE supervisor_assignment_requests MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
    }
};
