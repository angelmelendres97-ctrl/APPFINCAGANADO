<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MilkRecord;
use Illuminate\Http\Request;

class MilkRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = MilkRecord::with(['animal.status', 'creator']);
        
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

        if ($request->filled('animal_code')) {
            $query->whereHas('animal', function ($animalQuery) use ($request) {
                $animalQuery->where('internal_code', 'like', '%' . $request->animal_code . '%');
            });
        }

        if ($request->filled('liters_min')) {
            $query->where('quantity_liters', '>=', $request->liters_min);
        }

        if ($request->filled('liters_max')) {
            $query->where('quantity_liters', '<=', $request->liters_max);
        }

        if ($request->filled('animal_status')) {
            $query->whereHas('animal.status', function ($statusQuery) use ($request) {
                $statusQuery->where('name', $request->animal_status);
            });
        }
        
        $perPage = min((int) $request->input('per_page', 20), 1000);
        $records = $query->orderBy('record_date', 'desc')->paginate($perPage);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'record_date' => 'required|date',
            'quantity_liters' => 'required|numeric|min:0',
            'milking_session' => 'required|in:morning,afternoon',
            'temperature' => 'nullable|numeric',
            'mastitis_check' => 'nullable|boolean',
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
        
        $duplicate = MilkRecord::where('animal_id', $validated['animal_id'])
            ->whereDate('record_date', $validated['record_date'])
            ->where('milking_session', $validated['milking_session'])
            ->exists();

        if ($duplicate) {
            return response()->json(['message' => 'Ya existe un control para este animal, fecha y jornada'], 422);
        }

        if ($request->user()) {
            $validated['created_by'] = $request->user()->id;
        }
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
            'milking_session' => 'sometimes|in:morning,afternoon',
            'temperature' => 'nullable|numeric',
            'mastitis_check' => 'nullable|boolean',
            'observation' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal seleccionado no existe',
            'record_date.date' => 'Ingrese una fecha válida',
            'quantity_liters.numeric' => 'Ingrese un número válido',
            'quantity_liters.min' => 'La cantidad no puede ser negativa',
            'milking_session.in' => 'Seleccione un ordeño válido',
        ]);
        
        $animalId = $validated['animal_id'] ?? $milkRecord->animal_id;
        $recordDate = $validated['record_date'] ?? $milkRecord->record_date;
        $session = $validated['milking_session'] ?? $milkRecord->milking_session;

        $duplicate = MilkRecord::where('animal_id', $animalId)
            ->whereDate('record_date', $recordDate)
            ->where('milking_session', $session)
            ->where('id', '!=', $milkRecord->id)
            ->exists();

        if ($duplicate) {
            return response()->json(['message' => 'Ya existe un control para este animal, fecha y jornada'], 422);
        }

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