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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['change_supervisor', 'change_group', 'change_project', 'other']);
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->text('reason');
            $table->enum('status', ['pending', 'supervisor_approved', 'supervisor_rejected', 'committee_approved', 'committee_rejected', 'cancelled'])->default('pending');
            $table->json('supervisor_approval')->nullable();
            $table->json('committee_approval')->nullable();
            $table->json('additional_data')->nullable();
            $table->timestamps();
            
            $table->index('student_id');
            $table->index('project_id');
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};

