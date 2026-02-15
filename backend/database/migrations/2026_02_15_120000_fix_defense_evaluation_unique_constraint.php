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
        Schema::table('defense_evaluations', function (Blueprint $table) {
            // Drop existing unique index if it exists (using array syntax for index name generation or explicit name)
            // We'll try to drop the one that might be wrong or the correct one to be sure
            $table->dropUnique('unique_evaluation'); 
        });

        Schema::table('defense_evaluations', function (Blueprint $table) {
            // Re-add the correct unique constraint including evaluator_id
            $table->unique(['project_id', 'student_id', 'evaluator_id', 'defense_stage'], 'unique_evaluation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
