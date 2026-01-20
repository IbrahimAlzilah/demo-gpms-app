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
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('assigned_group_id')->nullable()->constrained('student_groups')->onDelete('set null');
            $table->timestamp('reserved_at')->nullable();
            
            $table->index('assigned_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['assigned_group_id']);
            $table->dropColumn(['assigned_group_id', 'reserved_at']);
        });
    }
};
