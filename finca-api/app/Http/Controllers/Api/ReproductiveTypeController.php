<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReproductiveType;

class ReproductiveTypeController extends Controller
{
    public function index()
    {
        return response()->json(ReproductiveType::where('active', true)->orderBy('name')->get());
    }
}
