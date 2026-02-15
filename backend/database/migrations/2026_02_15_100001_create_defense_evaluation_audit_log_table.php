<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Audit trail for defense evaluation modifications (including post-publish edits).
     */
    public function up(): void
    {
        Schema::create('defense_evaluation_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('defense_evaluation_id')->constrained('defense_evaluations')->onDelete('cascade');
            $table->string('action', 20); // 'created', 'updated', 'deleted'
            $table->decimal('score_before', 5, 2)->nullable();
            $table->decimal('score_after', 5, 2)->nullable();
            $table->text('notes_before')->nullable();
            $table->text('notes_after')->nullable();
            $table->foreignId('modified_by')->constrained('users')->onDelete('cascade');
            $table->boolean('was_published')->default(false); // true if stage was already published when modified
            $table->timestamps();

            $table->index('defense_evaluation_id');
            $table->index(['defense_evaluation_id', 'created_at'], 'def_eval_audit_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('defense_evaluation_audit_log');
    }
};
