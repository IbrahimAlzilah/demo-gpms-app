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
        Schema::table('project_registrations', function (Blueprint $table) {
            $table->foreignId('group_registration_request_id')
                ->nullable()
                ->after('student_id')
                ->constrained('group_registration_requests')
                ->onDelete('cascade');
            
            $table->index('group_registration_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_registrations', function (Blueprint $table) {
            $table->dropForeign(['group_registration_request_id']);
            $table->dropIndex(['group_registration_request_id']);
            $table->dropColumn('group_registration_request_id');
        });
    }
};
