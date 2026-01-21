<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This table tracks supervisor assignment requests by the Projects Committee.
     * The committee can propose a supervisor for a project, and the supervisor
     * must approve before final assignment.
     */
    public function up(): void
    {
        Schema::create('supervisor_assignment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('supervisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users'); // Projects Committee member who created the request
            $table->foreignId('responded_by')->nullable()->constrained('users'); // Supervisor who responded
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('committee_notes')->nullable(); // Notes from committee
            $table->text('supervisor_response')->nullable(); // Response from supervisor
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('status');
            $table->index('project_id');
            $table->index('supervisor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisor_assignment_requests');
    }
};
