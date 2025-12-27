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
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->text('objectives');
            $table->text('methodology')->nullable();
            $table->text('expected_outcomes')->nullable();
            $table->foreignId('submitter_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'requires_modification'])->default('pending_review');
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->timestamps();
            
            $table->index('submitter_id');
            $table->index('status');
            $table->index('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};

