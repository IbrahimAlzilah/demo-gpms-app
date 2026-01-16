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
            $table->foreignId('proposed_supervisor_id')->nullable()->after('submitter_id')->constrained('users')->onDelete('set null');
            $table->json('team_members')->nullable()->after('proposed_supervisor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropForeign(['proposed_supervisor_id']);
            $table->dropColumn(['proposed_supervisor_id', 'team_members']);
        });
    }
};
