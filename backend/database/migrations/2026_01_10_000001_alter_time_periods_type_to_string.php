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
        Schema::table('time_periods', function (Blueprint $table) {
            // Change type column from enum to string for better DB compatibility
            $table->string('type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('time_periods', function (Blueprint $table) {
            // Revert to enum (original values)
            $table->enum('type', [
                'proposal_submission',
                'project_registration',
                'document_submission',
                'supervisor_evaluation',
                'committee_evaluation',
                'final_discussion',
                'general'
            ])->change();
        });
    }
};
