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
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (! Schema::hasColumn('projects', 'project_committee_id')) {
                    $table->foreignId('project_committee_id')
                        ->nullable()
                        ->after('committee_id')
                        ->constrained('project_committees')
                        ->nullOnDelete();
                }

                if (! Schema::hasColumn('projects', 'discussion_committee_id')) {
                    $table->foreignId('discussion_committee_id')
                        ->nullable()
                        ->after('project_committee_id')
                        ->constrained('discussion_committees')
                        ->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (Schema::hasColumn('projects', 'discussion_committee_id')) {
                    $table->dropConstrainedForeignId('discussion_committee_id');
                }
                if (Schema::hasColumn('projects', 'project_committee_id')) {
                    $table->dropConstrainedForeignId('project_committee_id');
                }
            });
        }
    }
};

