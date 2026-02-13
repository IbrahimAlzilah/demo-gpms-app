<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Stores defense date/time per project per stage (FD1/FD2).
     */
    public function up(): void
    {
        Schema::create('project_defense_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('defense_stage', 10); // FD1 or FD2
            $table->dateTime('scheduled_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'defense_stage']);
            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_defense_schedules');
    }
};
