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
        Schema::table('defense_approvals', function (Blueprint $table) {
            $table->timestamp('evaluations_ready_notified_at')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('defense_approvals', function (Blueprint $table) {
            $table->dropColumn('evaluations_ready_notified_at');
        });
    }
};
