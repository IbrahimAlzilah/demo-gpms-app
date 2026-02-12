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
        Schema::create('defense_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('evaluator_id')->constrained('users')->onDelete('cascade');
            $table->enum('evaluator_role', ['supervisor', 'committee_member', 'project_committee']);
            $table->enum('defense_stage', ['fd1', 'fd2']);
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(100.00);
            $table->json('criteria')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('modified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes for performance
            $table->index(['project_id', 'defense_stage'], 'idx_project_stage');
            $table->index(['student_id', 'defense_stage'], 'idx_student_stage');
            $table->index(['evaluator_id', 'defense_stage'], 'idx_evaluator_stage');
            
            // Unique constraint: one evaluation per student per evaluator per stage
            $table->unique(['project_id', 'student_id', 'evaluator_id', 'defense_stage'], 'unique_evaluation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('defense_evaluations');
    }
};
