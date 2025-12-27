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
        Schema::create('time_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['proposal_submission', 'project_registration', 'document_submission', 'supervisor_evaluation', 'committee_evaluation', 'final_discussion', 'general']);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->string('academic_year')->nullable();
            $table->string('semester')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('type');
            $table->index('is_active');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_periods');
    }
};

