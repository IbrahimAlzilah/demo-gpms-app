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
        Schema::create('project_group_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('project_groups')->onDelete('cascade');
            $table->foreignId('member_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['group_id', 'member_id']);
            $table->index('group_id');
            $table->index('member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_group_member');
    }
};

