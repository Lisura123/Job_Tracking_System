<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_number',
        'name',
        'contact_number',
    ];

    /**
     * Get the jobs for the customer.
     */
    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }
}
