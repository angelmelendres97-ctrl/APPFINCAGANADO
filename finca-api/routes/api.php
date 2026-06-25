<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FarmController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\LotController;
use App\Http\Controllers\Api\AnimalCategoryController;
use App\Http\Controllers\Api\AnimalStatusController;
use App\Http\Controllers\Api\SpeciesController;
use App\Http\Controllers\Api\BreedController;
use App\Http\Controllers\Api\MilkRecordController;
use App\Http\Controllers\Api\MeatRecordController;
use App\Http\Controllers\Api\HealthRecordController;
use App\Http\Controllers\Api\ReproductiveRecordController;
use App\Http\Controllers\Api\FeedingController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    Route::apiResource('farms', FarmController::class);
    Route::apiResource('animals', AnimalController::class);
    Route::apiResource('lots', LotController::class);
    Route::apiResource('animal-categories', AnimalCategoryController::class);
    Route::apiResource('animal-statuses', AnimalStatusController::class);
    Route::apiResource('species', SpeciesController::class);
    Route::apiResource('breeds', BreedController::class);
    Route::apiResource('milk-records', MilkRecordController::class);
    Route::apiResource('meat-records', MeatRecordController::class);
    Route::apiResource('health-records', HealthRecordController::class);
    Route::apiResource('reproductive-records', ReproductiveRecordController::class);
    Route::apiResource('feeding', FeedingController::class);
    Route::apiResource('events', EventController::class);
    Route::apiResource('alerts', AlertController::class);

    Route::apiResource('sales', SaleController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('inventory-items', InventoryItemController::class);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);

    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings', [SettingsController::class, 'update']);

    Route::get('dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('health-types', [\App\Http\Controllers\Api\HealthTypeController::class, 'index']);
    Route::get('reproductive-types', [\App\Http\Controllers\Api\ReproductiveTypeController::class, 'index']);
    Route::get('event-types', [\App\Http\Controllers\Api\EventTypeController::class, 'index']);
});