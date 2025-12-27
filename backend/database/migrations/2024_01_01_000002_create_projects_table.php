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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected', 'in_progress', 'completed', 'available_for_registration'])->default('draft');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('max_students')->default(4);
            $table->integer('current_students')->default(0);
            $table->string('specialization')->nullable();
            $table->json('keywords')->nullable();
            $table->string('committee_id')->nullable();
            $table->timestamps();
            
            $table->index('supervisor_id');
            $table->index('status');
            $table->index('committee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

