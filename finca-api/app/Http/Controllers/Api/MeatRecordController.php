<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MeatRecord;
use Illuminate\Http\Request;

class MeatRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = MeatRecord::with('animal', 'creator');
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('record_date', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('record_date', '<=', $request->date_to);
        }
        
        $records = $query->orderBy('record_date', 'desc')->paginate(20);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'record_date' => 'required|date',
            'weight_kg' => 'required|numeric|min:0',
            'grade' => 'required|in:prime,choice,select,standard,utility',
            'condition' => 'nullable|string',
            'fat_thickness_mm' => 'nullable|numeric|min:0',
            'ribeye_area_cm2' => 'nullable|numeric|min:0',
            'observation' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal no existe',
            'record_date.required' => 'La fecha es obligatoria',
            'record_date.date' => 'Ingrese una fecha válida',
            'weight_kg.required' => 'El peso es obligatorio',
            'weight_kg.numeric' => 'Ingrese un valor numérico',
            'weight_kg.min' => 'El peso no puede ser negativo',
            'grade.required' => 'Seleccione el grado',
            'grade.in' => 'Grado no válido',
            'fat_thickness_mm.numeric' => 'Ingrese un valor numérico',
            'fat_thickness_mm.min' => 'El valor no puede ser negativo',
            'ribeye_area_cm2.numeric' => 'Ingrese un valor numérico',
            'ribeye_area_cm2.min' => 'El valor no puede ser negativo',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        
        $record = MeatRecord::create($validated);
        
        return response()->json([
            'message' => 'Registro de carne creado exitosamente',
            'data' => $record
        ], 201);
    }

    public function update(Request $request, MeatRecord $meatRecord)
    {
        $validated = $request->validate([
            'animal_id' => 'sometimes|exists:animals,id',
            'record_date' => 'sometimes|date',
            'weight_kg' => 'sometimes|numeric|min:0',
            'grade' => 'sometimes|in:prime,choice,select,standard,utility',
            'condition' => 'nullable|string',
            'fat_thickness_mm' => 'nullable|numeric|min:0',
            'ribeye_area_cm2' => 'nullable|numeric|min:0',
            'observation' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal no existe',
            'record_date.date' => 'Ingrese una fecha válida',
            'weight_kg.numeric' => 'Ingrese un valor numérico',
            'weight_kg.min' => 'El peso no puede ser negativo',
            'grade.in' => 'Grado no válido',
            'fat_thickness_mm.numeric' => 'Ingrese un valor numérico',
            'fat_thickness_mm.min' => 'El valor no puede ser negativo',
            'ribeye_area_cm2.numeric' => 'Ingrese un valor numérico',
            'ribeye_area_cm2.min' => 'El valor no puede ser negativo',
        ]);
        
        $meatRecord->update($validated);
        
        return response()->json([
            'message' => 'Registro actualizado exitosamente',
            'data' => $meatRecord
        ]);
    }

    public function destroy(MeatRecord $meatRecord)
    {
        $meatRecord->delete();
        
        return response()->json(['message' => 'Registro eliminado']);
    }
}