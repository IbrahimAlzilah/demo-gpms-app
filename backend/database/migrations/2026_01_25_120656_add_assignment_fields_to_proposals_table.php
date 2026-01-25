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
            $table->foreignId('assigned_to_group_id')->nullable()->after('project_id')->constrained('student_groups')->onDelete('set null');
            $table->enum('assignment_type', ['direct', 'request'])->nullable()->after('assigned_to_group_id');
            $table->timestamp('assigned_at')->nullable()->after('assignment_type');

            $table->index('assigned_to_group_id');
            $table->index('assignment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropForeign(['assigned_to_group_id']);
            $table->dropIndex(['assigned_to_group_id']);
            $table->dropColumn(['assigned_to_group_id', 'assignment_type', 'assigned_at']);
        });
    }
};
