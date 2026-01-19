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
        if (! Schema::hasTable('project_time_period')) {
            Schema::create('project_time_period', function (Blueprint $table) {
                $table->id();
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->foreignId('time_period_id')->constrained('time_periods')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['project_id', 'time_period_id']);
                $table->index('project_id');
                $table->index('time_period_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_time_period');
    }
};

