<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add 'change_project_title' to requests.type enum.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE requests MODIFY COLUMN type ENUM('change_supervisor', 'change_group', 'change_project', 'change_project_title', 'other') NOT NULL");
    }

    /**
     * Revert to original enum.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE requests MODIFY COLUMN type ENUM('change_supervisor', 'change_group', 'change_project', 'other') NOT NULL");
    }
};
