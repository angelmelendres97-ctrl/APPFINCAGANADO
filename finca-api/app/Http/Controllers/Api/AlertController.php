<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\AlertType;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $query = Alert::with(['animal', 'lot', 'alertType']);
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        
        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }
        
        $alerts = $query->orderBy('alert_date', 'desc')->paginate(20);
        
        return response()->json($alerts);
    }

    public function markAsRead(Alert $alert)
    {
        $alert->update([
            'is_read' => true,
            'read_at' => now()
        ]);
        
        return response()->json(['message' => 'Alerta marcada como leída']);
    }

    public function acknowledge(Alert $alert)
    {
        $alert->update(['status' => 'acknowledged']);
        return response()->json(['message' => 'Alerta reconocida']);
    }

    public function resolve(Alert $alert)
    {
        $alert->update(['status' => 'resolved']);
        return response()->json(['message' => 'Alerta resuelta']);
    }
}

class AlertTypeController extends Controller
{
    public function index()
    {
        return response()->json(AlertType::where('active', true)->get());
    }
}