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
        Schema::table('jobs', function (Blueprint $table) {
            // Add separate fields for each "Received by Name"
            $table->string('sg_received_by_name')->nullable()->after('sg');
            $table->string('clk_received_by_name')->nullable()->after('received_confirmation');
            
            // Rename the existing received_by_person_name to final_received_by_name for clarity
            $table->renameColumn('received_by_person_name', 'final_received_by_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['sg_received_by_name', 'clk_received_by_name']);
            $table->renameColumn('final_received_by_name', 'received_by_person_name');
        });
    }
};
