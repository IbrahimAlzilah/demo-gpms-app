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
        // First, remove any duplicate periods (keep the most recent one for each type)
        $duplicates = \DB::table('time_periods')
            ->select('type', \DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            // Keep the most recent period for each type, delete older ones
            \DB::table('time_periods')
                ->where('type', $duplicate->type)
                ->orderBy('created_at', 'desc')
                ->skip(1)
                ->delete();
        }

        Schema::table('time_periods', function (Blueprint $table) {
            // Add unique constraint on type column to prevent duplicate period types
            $table->unique('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('time_periods', function (Blueprint $table) {
            $table->dropUnique(['type']);
        });
    }
};
