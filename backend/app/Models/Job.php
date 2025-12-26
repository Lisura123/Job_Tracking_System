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
        'shipping_method',
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
     * Get the job's current status based on dates and confirmations.
     */
    public function getStatusAttribute(): string
    {
        // Job Completed - final received date is set and confirmed
        if ($this->final_received_date && $this->service_confirmation) {
            return 'Job Completed';
        }

        // Shipped from Singapore - shipped from Singapore but not yet received at service
        if ($this->shipped_from_singapore_date && !$this->final_received_date) {
            return 'Shipped from Singapore';
        }

        // Singapore Processing - warehouse received in Singapore or marked as SG
        if (($this->warehouse_received_date || $this->sg) && !$this->shipped_from_singapore_date) {
            return 'Singapore Processing';
        }

        // Received to Company - company received and confirmed, but not yet sent to warehouse/singapore
        if ($this->company_received_date && $this->received_confirmation && !$this->warehouse_received_date && !$this->sg) {
            return 'Received to Company';
        }

        // Shipped from CameraLK - CameraLK shipped but not yet received by company
        if ($this->lk_shipped_date && !$this->company_received_date) {
            return 'Shipped from CameraLK';
        }

        // Ongoing Job - default status when job is created or only basic info exists
        return 'Ongoing Job';
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
