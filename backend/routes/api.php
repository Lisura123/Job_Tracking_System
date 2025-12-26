<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
// Route::post('/register', [AuthController::class, 'register']); // Disabled for internal use only
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Search routes (available to all authenticated users)
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/jobs/{id}', [SearchController::class, 'show']);

    // Jobs and Customers management (available to all authenticated users)
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('jobs', JobController::class)->except(['show']);

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        // User management
        Route::apiResource('users', UserController::class);
    });
});
