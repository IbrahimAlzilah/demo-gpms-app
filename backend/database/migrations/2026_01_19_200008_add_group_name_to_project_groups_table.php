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
        if (Schema::hasTable('project_groups') && ! Schema::hasColumn('project_groups', 'group_name')) {
            Schema::table('project_groups', function (Blueprint $table) {
                $table->string('group_name')->nullable()->after('leader_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('project_groups') && Schema::hasColumn('project_groups', 'group_name')) {
            Schema::table('project_groups', function (Blueprint $table) {
                $table->dropColumn('group_name');
            });
        }
    }
};

