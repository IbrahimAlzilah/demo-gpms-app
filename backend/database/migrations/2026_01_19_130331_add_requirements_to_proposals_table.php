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
        if (Schema::hasTable('proposals') && ! Schema::hasColumn('proposals', 'requirements')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->text('requirements')->nullable()->after('description');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('proposals') && Schema::hasColumn('proposals', 'requirements')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->dropColumn('requirements');
            });
        }
    }
};
