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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['proposal', 'chapters', 'final_report', 'code', 'presentation', 'other']);
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->bigInteger('file_size');
            $table->string('mime_type');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->enum('review_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('review_comments')->nullable();
            $table->timestamps();
            
            $table->index('project_id');
            $table->index('submitted_by');
            $table->index('type');
            $table->index('review_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

