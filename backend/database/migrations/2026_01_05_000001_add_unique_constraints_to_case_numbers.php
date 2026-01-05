<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add unique constraints to case number columns to prevent duplicate jobs.
     */
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // Add unique index for original_case_number (allowing nulls)
            $table->unique('original_case_number', 'jobs_original_case_number_unique');
            
            // Add unique index for clk_case_number (allowing nulls)
            $table->unique('clk_case_number', 'jobs_clk_case_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropUnique('jobs_original_case_number_unique');
            $table->dropUnique('jobs_clk_case_number_unique');
        });
    }
};
