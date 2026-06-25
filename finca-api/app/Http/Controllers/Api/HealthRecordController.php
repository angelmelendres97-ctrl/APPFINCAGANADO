<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthRecord;
use Illuminate\Http\Request;

class HealthRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = HealthRecord::with('animal', 'healthType', 'creator');
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('health_type_id')) {
            $query->where('health_type_id', $request->health_type_id);
        }
        
        $records = $query->orderBy('record_date', 'desc')->paginate(20);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'health_type_id' => 'required|exists:health_types,id',
            'record_date' => 'required|date',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'medication' => 'nullable|string',
            'dosage' => 'nullable|string',
            'veterinarian' => 'nullable|string|max:200',
            'next_appointment' => 'nullable|date',
            'observations' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal seleccionado no existe',
            'health_type_id.required' => 'Seleccione el tipo de salud',
            'health_type_id.exists' => 'El tipo de salud no existe',
            'record_date.required' => 'La fecha es obligatoria',
            'record_date.date' => 'Ingrese una fecha válida',
            'veterinarian.max' => 'El nombre no puede exceder 200 caracteres',
            'next_appointment.date' => 'Ingrese una fecha válida',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        $validated['medication_name'] = $validated['medication'] ?? ($validated['treatment'] ?? null);
        $validated['veterinarian_name'] = $validated['veterinarian'] ?? null;
        $validated['next_due_date'] = $validated['next_appointment'] ?? null;
        $validated['notes'] = $validated['observations'] ?? null;
        unset($validated['treatment'], $validated['medication'], $validated['veterinarian'], $validated['next_appointment'], $validated['observations']);
        
        $record = HealthRecord::create($validated);
        
        return response()->json($record, 201);
    }

    public function update(Request $request, HealthRecord $healthRecord)
    {
        $validated = $request->validate([
            'animal_id' => 'sometimes|exists:animals,id',
            'health_type_id' => 'sometimes|exists:health_types,id',
            'record_date' => 'sometimes|date',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'medication' => 'nullable|string',
            'dosage' => 'nullable|string',
            'veterinarian' => 'nullable|string|max:200',
            'next_appointment' => 'nullable|date',
            'observations' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal seleccionado no existe',
            'health_type_id.exists' => 'El tipo de salud no existe',
            'record_date.date' => 'Ingrese una fecha válida',
            'veterinarian.max' => 'El nombre no puede exceder 200 caracteres',
            'next_appointment.date' => 'Ingrese una fecha válida',
        ]);
        
        if (isset($validated['medication']) || isset($validated['treatment'])) {
            $validated['medication_name'] = $validated['medication'] ?? $validated['treatment'];
        }
        if (isset($validated['veterinarian'])) {
            $validated['veterinarian_name'] = $validated['veterinarian'];
        }
        if (isset($validated['next_appointment'])) {
            $validated['next_due_date'] = $validated['next_appointment'];
        }
        if (isset($validated['observations'])) {
            $validated['notes'] = $validated['observations'];
        }
        unset($validated['treatment'], $validated['medication'], $validated['veterinarian'], $validated['next_appointment'], $validated['observations']);
        
        $healthRecord->update($validated);
        
        return response()->json($healthRecord);
    }

    public function destroy(HealthRecord $healthRecord)
    {
        $healthRecord->delete();
        return response()->json(['message' => 'Registro eliminado']);
    }
}
