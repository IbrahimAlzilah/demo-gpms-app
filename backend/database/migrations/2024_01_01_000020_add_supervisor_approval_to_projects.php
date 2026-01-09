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
        Schema::table('projects', function (Blueprint $table) {
            $table->enum('supervisor_approval_status', ['pending', 'approved', 'rejected'])->nullable()->after('supervisor_id');
            $table->text('supervisor_approval_comments')->nullable()->after('supervisor_approval_status');
            $table->timestamp('supervisor_approval_at')->nullable()->after('supervisor_approval_comments');
            
            $table->index('supervisor_approval_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['supervisor_approval_status']);
            $table->dropColumn(['supervisor_approval_status', 'supervisor_approval_comments', 'supervisor_approval_at']);
        });
    }
};
