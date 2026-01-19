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
        if (! Schema::hasTable('students')) {
            Schema::create('students', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
                $table->string('student_id')->nullable();
                $table->string('major')->nullable();
                $table->string('academic_level')->nullable();
                $table->timestamps();

                $table->index('student_id');
            });
        }

        // Backfill from existing users table for current students
        if (Schema::hasTable('users') && Schema::hasTable('students')) {
            $studentUsers = DB::table('users')
                ->where('role', 'student')
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('students')
                        ->whereColumn('students.user_id', 'users.id');
                })
                ->get();

            foreach ($studentUsers as $user) {
                DB::table('students')->insert([
                    'user_id' => $user->id,
                    'student_id' => $user->student_id,
                    'major' => $user->department,
                    'academic_level' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

