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
            // Add new shipping method for supplier to SG warehouse
            $table->string('supplier_shipping_method')->nullable()->after('supplier_shipping_date');
            
            // Rename existing shipping_method to lk_shipping_method for CameraLK to Company
            $table->renameColumn('shipping_method', 'lk_shipping_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // Rename back to original
            $table->renameColumn('lk_shipping_method', 'shipping_method');
            
            // Drop the new column
            $table->dropColumn('supplier_shipping_method');
        });
    }
};
