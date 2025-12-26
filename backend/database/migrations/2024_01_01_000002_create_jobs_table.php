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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('original_case_number')->nullable();
            $table->string('clk_case_number')->nullable();
            $table->date('lk_shipped_date')->nullable();
            $table->enum('shipping_method', ['Gomaz', 'Direct', 'By hand'])->nullable();
            $table->date('company_received_date')->nullable();
            $table->date('supplier_shipping_date')->nullable();
            $table->date('warehouse_received_date')->nullable();
            $table->string('received_confirmation_by')->nullable();
            $table->date('shipped_from_singapore_date')->nullable();
            $table->date('final_received_date')->nullable();
            $table->string('received_by_person_name')->nullable();
            $table->boolean('received_confirmation')->default(false);
            $table->timestamps();
            
            $table->index('job_number');
            $table->index('customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
