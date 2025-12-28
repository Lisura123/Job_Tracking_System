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
        // Migrate valid date values from received_confirmation_by to clk_received_date
        $jobs = DB::table('jobs')
            ->whereNotNull('received_confirmation_by')
            ->whereNull('clk_received_date')
            ->get();

        foreach ($jobs as $job) {
            // Try to validate if it's a valid date
            $date = $job->received_confirmation_by;
            
            // Check if it's a valid date format (YYYY-MM-DD or similar)
            if (preg_match('/^\d{4}-\d{2}-\d{2}/', $date)) {
                DB::table('jobs')
                    ->where('id', $job->id)
                    ->update(['clk_received_date' => $date]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't reverse this data migration
    }
};
