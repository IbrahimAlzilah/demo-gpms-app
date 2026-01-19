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
        Schema::table('users', function (Blueprint $table) {
            // Add username column (unique, nullable initially for backfill)
            $table->string('username')->nullable()->unique()->after('email');
        });

        // Backfill usernames from profile tables
        // Students: username = student_id from students table
        DB::table('users')
            ->join('students', 'users.id', '=', 'students.user_id')
            ->whereNotNull('students.student_id')
            ->update([
                'users.username' => DB::raw('students.student_id')
            ]);

        // Staff/committees: username = emp_id from supervisors table
        DB::table('users')
            ->join('supervisors', 'users.id', '=', 'supervisors.user_id')
            ->whereNotNull('supervisors.emp_id')
            ->update([
                'users.username' => DB::raw('supervisors.emp_id')
            ]);

        // Admin users: set username to 'admin' for first admin, 'admin2', 'admin3', etc. for others
        $adminUsers = DB::table('users')
            ->where('role', 'admin')
            ->whereNull('username')
            ->orderBy('id')
            ->get();

        foreach ($adminUsers as $index => $admin) {
            $username = $index === 0 ? 'admin' : 'admin' . ($index + 1);
            DB::table('users')
                ->where('id', $admin->id)
                ->update(['username' => $username]);
        }

        // For any remaining users without username (shouldn't happen, but safety fallback)
        DB::table('users')
            ->whereNull('username')
            ->update([
                'username' => DB::raw("CONCAT('user_', id)")
            ]);

        // Make username non-nullable now that all users have it
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
        });

        // Make email nullable (keep unique index - MySQL allows multiple NULLs)
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restore email to non-nullable
            $table->string('email')->nullable(false)->change();
            
            // Drop username column
            $table->dropColumn('username');
        });
    }
};
