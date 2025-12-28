<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_number',
        'customer_id',
        'company_name',
        'original_case_number',
        'clk_case_number',
        'lk_shipped_date',
        'lk_shipping_method',
        'supplier_shipping_method',
        'company_received_date',
        'supplier_shipping_date',
        'warehouse_received_date',
        'received_confirmation_by',
        'sg',
        'sg_received_by_name',
        'shipped_from_singapore_date',
        'final_received_date',
        'final_received_by_name',
        'clk_received_by_name',
        'received_confirmation',
        'service_confirmation',
    ];

    protected $casts = [
        'lk_shipped_date' => 'date',
        'company_received_date' => 'date',
        'supplier_shipping_date' => 'date',
        'warehouse_received_date' => 'date',
        'shipped_from_singapore_date' => 'date',
        'final_received_date' => 'date',
        'received_confirmation' => 'boolean',
        'service_confirmation' => 'boolean',
        'sg' => 'boolean',
    ];

    protected $appends = ['status'];

    /**
     * Get the job's current status based on the most recently updated date.
     * Status flow (priority order based on workflow):
     * 1. Ongoing Job - default, no any date field updated
     * 2. Shipped from CameraLK - CameraLK Shipped Date (lk_shipped_date)
     * 3. Received to Company - Company Received Date (company_received_date)
     * 4. Supplier Shipped - Supplier Shipping Date (supplier_shipping_date)
     * 5. Received to Singapore - Warehouse Received Date Singapore (warehouse_received_date)
     * 6. Received by CameraLK Representative - Received Confirmation by CameraLK Representative Date (clk_received_by_name)
     * 7. Shipping Arranged from Singapore - Shipping Arranged from Singapore Date (shipped_from_singapore_date)
     * 8. Job Completed - Service CameraLK Received Date (final_received_date)
     */
    public function getStatusAttribute(): string
    {
        // Collect all dates with their corresponding statuses and priority
        $statuses = [];

        if ($this->lk_shipped_date) {
            $statuses[] = ['date' => $this->lk_shipped_date, 'status' => 'Shipped from CameraLK', 'priority' => 2];
        }

        if ($this->company_received_date) {
            $statuses[] = ['date' => $this->company_received_date, 'status' => 'Received to Company', 'priority' => 3];
        }

        if ($this->supplier_shipping_date) {
            $statuses[] = ['date' => $this->supplier_shipping_date, 'status' => 'Supplier Shipped', 'priority' => 4];
        }

        if ($this->warehouse_received_date) {
            $statuses[] = ['date' => $this->warehouse_received_date, 'status' => 'Received to Singapore', 'priority' => 5];
        }

        if ($this->clk_received_by_name) {
            $statuses[] = ['date' => $this->clk_received_by_name, 'status' => 'Received by CameraLK Representative', 'priority' => 6];
        }

        if ($this->shipped_from_singapore_date) {
            $statuses[] = ['date' => $this->shipped_from_singapore_date, 'status' => 'Shipping Arranged from Singapore', 'priority' => 7];
        }

        if ($this->final_received_date) {
            $statuses[] = ['date' => $this->final_received_date, 'status' => 'Job Completed', 'priority' => 8];
        }

        // If no dates are set, return default status
        if (empty($statuses)) {
            return 'Ongoing Job';
        }

        // Find the status with the highest priority (most advanced in workflow)
        usort($statuses, function($a, $b) {
            return $b['priority'] - $a['priority'];
        });

        return $statuses[0]['status'];
    }

    /**
     * Get the customer that owns the job.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the items for the job.
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    /**
     * Get the tracking details for the job.
     */
    public function trackingDetails(): HasOne
    {
        return $this->hasOne(TrackingDetail::class);
    }
}
