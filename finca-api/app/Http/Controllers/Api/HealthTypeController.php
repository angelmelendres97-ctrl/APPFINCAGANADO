<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthType;

class HealthTypeController extends Controller
{
    public function index()
    {
        return response()->json(HealthType::where('active', true)->orderBy('name')->get());
    }
}
