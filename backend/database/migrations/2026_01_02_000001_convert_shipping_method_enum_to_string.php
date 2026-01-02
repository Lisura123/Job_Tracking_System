<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Convert lk_shipping_method from ENUM to VARCHAR to allow any shipping method value.
     */
    public function up(): void
    {
        // Use raw SQL to alter the column from ENUM to VARCHAR
        DB::statement('ALTER TABLE jobs MODIFY lk_shipping_method VARCHAR(255) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert back to ENUM (will lose data that doesn't match the enum values)
        DB::statement("ALTER TABLE jobs MODIFY lk_shipping_method ENUM('Gomaz', 'Direct', 'By hand') NULL");
    }
};
