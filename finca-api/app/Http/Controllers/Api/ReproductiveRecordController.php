<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReproductiveRecord;
use Illuminate\Http\Request;

class ReproductiveRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = ReproductiveRecord::with(['animal', 'reproductiveType', 'creator']);
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('result')) {
            $query->where('result', $request->result);
        }
        
        $records = $query->orderBy('event_date', 'desc')->paginate(20);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'reproductive_type_id' => 'required|exists:reproductive_types,id',
            'event_date' => 'required|date',
            'related_male_animal_id' => 'nullable|exists:animals,id',
            'semen_code' => 'nullable|string|max:50',
            'technician_name' => 'nullable|string|max:100',
            'expected_delivery_date' => 'nullable|date',
            'result' => 'nullable|in:pending,positive,negative,unknown,completed',
            'offspring_count' => 'nullable|integer|min:0',
            'observations' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal no existe',
            'reproductive_type_id.required' => 'Seleccione el tipo reproductivo',
            'reproductive_type_id.exists' => 'El tipo no existe',
            'event_date.required' => 'La fecha es obligatoria',
            'event_date.date' => 'Ingrese una fecha válida',
            'related_male_animal_id.exists' => 'El animal macho no existe',
            'semen_code.max' => 'El código no puede exceder 50 caracteres',
            'technician_name.max' => 'El nombre no puede exceder 100 caracteres',
            'expected_delivery_date.date' => 'Ingrese una fecha válida',
            'result.in' => 'Resultado no válido',
            'offspring_count.integer' => 'Ingrese un número entero',
            'offspring_count.min' => 'El número no puede ser negativo',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        
        $record = ReproductiveRecord::create($validated);
        
        return response()->json($record, 201);
    }

    public function update(Request $request, ReproductiveRecord $reproductiveRecord)
    {
        $validated = $request->validate([
            'animal_id' => 'sometimes|exists:animals,id',
            'reproductive_type_id' => 'sometimes|exists:reproductive_types,id',
            'event_date' => 'sometimes|date',
            'related_male_animal_id' => 'nullable|exists:animals,id',
            'semen_code' => 'nullable|string|max:50',
            'technician_name' => 'nullable|string|max:100',
            'expected_delivery_date' => 'nullable|date',
            'result' => 'nullable|in:pending,positive,negative,unknown,completed',
            'offspring_count' => 'nullable|integer|min:0',
            'observations' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal no existe',
            'reproductive_type_id.exists' => 'El tipo no existe',
            'event_date.date' => 'Ingrese una fecha válida',
            'related_male_animal_id.exists' => 'El animal macho no existe',
            'semen_code.max' => 'El código no puede exceder 50 caracteres',
            'technician_name.max' => 'El nombre no puede exceder 100 caracteres',
            'expected_delivery_date.date' => 'Ingrese una fecha válida',
            'result.in' => 'Resultado no válido',
            'offspring_count.integer' => 'Ingrese un número entero',
            'offspring_count.min' => 'El número no puede ser negativo',
        ]);
        
        $reproductiveRecord->update($validated);
        
        return response()->json($reproductiveRecord);
    }

    public function destroy(ReproductiveRecord $reproductiveRecord)
    {
        $reproductiveRecord->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
