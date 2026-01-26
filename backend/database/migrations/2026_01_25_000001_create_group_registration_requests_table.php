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
        Schema::create('group_registration_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_group_id')->constrained('student_groups')->onDelete('cascade');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('review_comments')->nullable();
            $table->foreignId('approved_project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->timestamps();
            
            $table->index('student_group_id');
            $table->index('status');
            $table->index('submitted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_registration_requests');
    }
};
