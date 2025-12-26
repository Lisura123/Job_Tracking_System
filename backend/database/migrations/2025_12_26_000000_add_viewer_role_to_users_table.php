<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add a new 'viewer' role to the existing enum column
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','viewer') DEFAULT 'user'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to the original enum definition
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user','admin') DEFAULT 'user'");
    }
};
