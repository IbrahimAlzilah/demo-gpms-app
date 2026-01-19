<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure all data is migrated to profile tables before removing columns
        // This is already handled by the profile table migrations, but we'll verify
        
        Schema::table('users', function (Blueprint $table) {
            // Drop indexes first
            if (Schema::hasColumn('users', 'student_id')) {
                $table->dropIndex(['student_id']);
            }
            if (Schema::hasColumn('users', 'emp_id')) {
                $table->dropIndex(['emp_id']);
            }
            
            // Drop columns
            if (Schema::hasColumn('users', 'student_id')) {
                $table->dropColumn('student_id');
            }
            if (Schema::hasColumn('users', 'emp_id')) {
                $table->dropColumn('emp_id');
            }
            if (Schema::hasColumn('users', 'department')) {
                $table->dropColumn('department');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('student_id')->nullable()->after('role');
            $table->string('emp_id')->nullable()->after('student_id');
            $table->string('department')->nullable()->after('emp_id');
            
            $table->index('student_id');
            $table->index('emp_id');
        });
        
        // Backfill from profile tables
        DB::table('users')
            ->join('students', 'users.id', '=', 'students.user_id')
            ->update([
                'users.student_id' => DB::raw('students.student_id'),
                'users.department' => DB::raw('students.major'),
            ]);
        
        DB::table('users')
            ->join('supervisors', 'users.id', '=', 'supervisors.user_id')
            ->update([
                'users.emp_id' => DB::raw('supervisors.emp_id'),
                'users.department' => DB::raw('supervisors.department'),
            ]);
    }
};
