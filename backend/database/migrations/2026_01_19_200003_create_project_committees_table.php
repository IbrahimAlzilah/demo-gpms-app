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
        if (! Schema::hasTable('project_committees')) {
            Schema::create('project_committees', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('department')->nullable();
                $table->timestamps();

                $table->index('department');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_committees');
    }
};

