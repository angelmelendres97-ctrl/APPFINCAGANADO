<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MilkRecord;
use Illuminate\Http\Request;

class MilkRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = MilkRecord::with('animal', 'creator');
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('record_date', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('record_date', '<=', $request->date_to);
        }
        
        if ($request->filled('milking_session')) {
            $query->where('milking_session', $request->milking_session);
        }
        
        $records = $query->orderBy('record_date', 'desc')->paginate(20);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'record_date' => 'required|date',
            'quantity_liters' => 'required|numeric|min:0',
            'milking_session' => 'required|in:morning,afternoon,evening,night',
            'observation' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal seleccionado no existe',
            'record_date.required' => 'La fecha es obligatoria',
            'record_date.date' => 'Ingrese una fecha válida',
            'quantity_liters.required' => 'La cantidad de leche es obligatoria',
            'quantity_liters.numeric' => 'Ingrese un número válido',
            'quantity_liters.min' => 'La cantidad no puede ser negativa',
            'milking_session.required' => 'Seleccione el ordeño',
            'milking_session.in' => 'Seleccione un ordeño válido',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        $validated['notes'] = $validated['observation'] ?? null;
        unset($validated['observation']);
        
        $record = MilkRecord::create($validated);
        
        return response()->json($record, 201);
    }

    public function update(Request $request, MilkRecord $milkRecord)
    {
        $validated = $request->validate([
            'animal_id' => 'sometimes|exists:animals,id',
            'record_date' => 'sometimes|date',
            'quantity_liters' => 'sometimes|numeric|min:0',
            'milking_session' => 'sometimes|in:morning,afternoon,evening,night',
            'observation' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal seleccionado no existe',
            'record_date.date' => 'Ingrese una fecha válida',
            'quantity_liters.numeric' => 'Ingrese un número válido',
            'quantity_liters.min' => 'La cantidad no puede ser negativa',
            'milking_session.in' => 'Seleccione un ordeño válido',
        ]);
        
        $validated['notes'] = $validated['observation'] ?? null;
        unset($validated['observation']);
        
        $milkRecord->update($validated);
        
        return response()->json($milkRecord);
    }

    public function destroy(MilkRecord $milkRecord)
    {
        $milkRecord->delete();
        
        return response()->json(['message' => 'Registro eliminado']);
    }

    public function statistics(Request $request)
    {
        $date = $request->filled('date') ? $request->date : now()->toDateString();
        
        $today = MilkRecord::whereDate('record_date', $date)
            ->selectRaw('SUM(quantity_liters) as total, COUNT(DISTINCT animal_id) as animals')
            ->first();
        
        $animalsMilking = MilkRecord::whereDate('record_date', $date)
            ->distinct('animal_id')
            ->count('animal_id');
        
        return response()->json([
            'date' => $date,
            'total_liters' => $today->total ?? 0,
            'animals_milking' => $animalsMilking,
            'average' => $animalsMilking > 0 ? round($today->total / $animalsMilking, 2) : 0
        ]);
    }
}