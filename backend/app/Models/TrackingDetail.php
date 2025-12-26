<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackingDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'shipping_agent_name',
        'tracking_number',
    ];

    /**
     * Get the job that owns the tracking details.
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
