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
        Schema::create('project_meeting_attendee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('project_meetings')->onDelete('cascade');
            $table->foreignId('attendee_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['meeting_id', 'attendee_id']);
            $table->index('meeting_id');
            $table->index('attendee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_meeting_attendee');
    }
};

