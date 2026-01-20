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
        Schema::table('proposals', function (Blueprint $table) {
            $table->foreignId('student_group_id')->nullable()->after('submitter_id')->constrained('student_groups')->onDelete('set null');
            $table->foreignId('target_project_id')->nullable()->after('student_group_id')->constrained('projects')->onDelete('set null');
            
            $table->index('student_group_id');
            $table->index('target_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropForeign(['student_group_id']);
            $table->dropForeign(['target_project_id']);
            $table->dropColumn(['student_group_id', 'target_project_id']);
        });
    }
};
