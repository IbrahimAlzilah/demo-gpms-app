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
        Schema::create('project_meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('scheduled_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('scheduled_date');
            $table->integer('duration')->nullable()->comment('Duration in minutes');
            $table->string('location')->nullable();
            $table->text('agenda')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('project_id');
            $table->index('scheduled_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_meetings');
    }
};

