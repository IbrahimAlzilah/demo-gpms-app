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
        Schema::create('committee_assignment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['assigned', 'removed', 'redistributed']);
            $table->json('committee_member_ids'); // Current committee members after action
            $table->json('previous_committee_member_ids')->nullable(); // Previous members (for redistribution)
            $table->enum('defense_stage', ['FD1', 'FD2']);
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for queries
            $table->index('project_id');
            $table->index('defense_stage');
            $table->index('performed_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_assignment_histories');
    }
};
