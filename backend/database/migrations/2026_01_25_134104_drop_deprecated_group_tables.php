<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drops deprecated group-related tables that were replaced by the student_groups system.
     * Tables are dropped in order to respect foreign key constraints.
     */
    public function up(): void
    {
        // Drop tables in order (respecting foreign key constraints)
        Schema::dropIfExists('group_join_requests');
        Schema::dropIfExists('group_invitations');
        Schema::dropIfExists('project_group_member');
        Schema::dropIfExists('project_groups');
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This will recreate the tables but data will be lost.
     * These tables are deprecated and should not be restored in production.
     */
    public function down(): void
    {
        // Recreate tables in reverse order
        Schema::create('project_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('leader_id')->constrained('users')->onDelete('cascade');
            $table->integer('max_members')->default(4);
            $table->string('group_name')->nullable();
            $table->timestamps();
            
            $table->index('project_id');
            $table->index('leader_id');
        });

        Schema::create('project_group_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('project_groups')->onDelete('cascade');
            $table->foreignId('member_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['group_id', 'member_id']);
            $table->index('group_id');
            $table->index('member_id');
        });

        Schema::create('group_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('project_groups')->onDelete('cascade');
            $table->foreignId('inviter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('invitee_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();
            
            $table->index('group_id');
            $table->index('invitee_id');
            $table->index('status');
        });

        Schema::create('group_join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('project_groups')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('review_comments')->nullable();
            $table->timestamps();

            $table->index('group_id');
            $table->index('student_id');
            $table->index('status');
        });
    }
};
