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
        Schema::table('grades', function (Blueprint $table) {
            // Add FD1 and FD2 specific final grades
            $table->decimal('fd1_final_grade', 5, 2)->nullable()->after('final_grade');
            $table->decimal('fd2_final_grade', 5, 2)->nullable()->after('fd1_final_grade');
            
            // Add approval and published flags for each stage
            $table->boolean('fd1_approved')->default(false)->after('is_approved');
            $table->boolean('fd2_approved')->default(false)->after('fd1_approved');
            $table->boolean('fd1_published')->default(false)->after('fd2_approved');
            $table->boolean('fd2_published')->default(false)->after('fd1_published');
            
            // Add indexes
            $table->index('fd1_approved');
            $table->index('fd2_approved');
            $table->index('fd1_published');
            $table->index('fd2_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex(['fd1_approved']);
            $table->dropIndex(['fd2_approved']);
            $table->dropIndex(['fd1_published']);
            $table->dropIndex(['fd2_published']);
            
            $table->dropColumn([
                'fd1_final_grade',
                'fd2_final_grade',
                'fd1_approved',
                'fd2_approved',
                'fd1_published',
                'fd2_published',
            ]);
        });
    }
};
