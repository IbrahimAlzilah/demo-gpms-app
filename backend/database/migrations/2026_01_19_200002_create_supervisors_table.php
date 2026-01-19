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
        if (! Schema::hasTable('supervisors')) {
            Schema::create('supervisors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
                $table->string('emp_id')->nullable();
                $table->string('department')->nullable();
                $table->timestamps();

                $table->index('emp_id');
            });
        }

        // Backfill from existing users table for current supervisors
        if (Schema::hasTable('users') && Schema::hasTable('supervisors')) {
            $supervisorUsers = DB::table('users')
                ->where('role', 'supervisor')
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('supervisors')
                        ->whereColumn('supervisors.user_id', 'users.id');
                })
                ->get();

            foreach ($supervisorUsers as $user) {
                DB::table('supervisors')->insert([
                    'user_id' => $user->id,
                    'emp_id' => $user->emp_id,
                    'department' => $user->department,
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
        Schema::dropIfExists('supervisors');
    }
};

