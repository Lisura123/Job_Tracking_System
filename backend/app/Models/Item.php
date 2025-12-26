<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'name',
        'serial_number',
    ];

    /**
     * Get the job that owns the item.
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
