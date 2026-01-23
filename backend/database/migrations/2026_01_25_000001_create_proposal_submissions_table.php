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
        Schema::create('proposal_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submitter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_group_id')->nullable()->constrained('student_groups')->onDelete('cascade');
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_modification'])->default('draft');
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            
            $table->index('submitter_id');
            $table->index('student_group_id');
            $table->index('status');
            $table->index('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_submissions');
    }
};
