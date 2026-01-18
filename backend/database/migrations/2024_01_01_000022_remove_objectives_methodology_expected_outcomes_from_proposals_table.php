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
            $table->dropColumn(['objectives', 'methodology', 'expected_outcomes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->text('objectives')->after('description');
            $table->text('methodology')->nullable()->after('objectives');
            $table->text('expected_outcomes')->nullable()->after('methodology');
        });
    }
};
