<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventType;

class EventTypeController extends Controller
{
    public function index()
    {
        return response()->json(EventType::where('active', true)->orderBy('name')->get());
    }
}
