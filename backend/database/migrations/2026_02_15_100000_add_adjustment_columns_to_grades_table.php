<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add optional Project Committee adjustment per student for FD1 and FD2.
     */
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->decimal('fd1_adjustment', 5, 2)->nullable()->after('fd2_final_grade');
            $table->decimal('fd2_adjustment', 5, 2)->nullable()->after('fd1_adjustment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn(['fd1_adjustment', 'fd2_adjustment']);
        });
    }
};
