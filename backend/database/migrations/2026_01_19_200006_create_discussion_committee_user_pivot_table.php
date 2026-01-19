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
        if (! Schema::hasTable('discussion_committee_user')) {
            Schema::create('discussion_committee_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('discussion_committee_id')->constrained('discussion_committees')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['discussion_committee_id', 'user_id']);
                $table->index('discussion_committee_id');
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discussion_committee_user');
    }
};

