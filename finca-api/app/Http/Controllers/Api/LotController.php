<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lot;
use Illuminate\Http\Request;

class LotController extends Controller
{
    public function index(Request $request)
    {
        $query = Lot::with('animals');
        
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $lots = $query->orderBy('code')->paginate(12);
        
        return response()->json($lots);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|unique:lots,code',
            'type' => 'nullable|string',
            'status' => 'nullable|string',
            'area_size' => 'nullable|numeric|min:0',
            'area_unit' => 'nullable|string',
            'capacity' => 'nullable|integer|min:0',
            'location_description' => 'nullable|string'
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'code.unique' => 'El código ya existe',
            'area_size.numeric' => 'Ingrese un valor numérico',
            'area_size.min' => 'El área no puede ser negativa',
            'capacity.integer' => 'Ingrese un número entero',
            'capacity.min' => 'La capacidad no puede ser negativa',
        ]);
        
        if (empty($validated['farm_id'])) {
            $farm = \App\Models\Farm::first();
            $validated['farm_id'] = $farm ? $farm->id : null;
        }

        $lot = Lot::create($validated);
        
        return response()->json($lot, 201);
    }

    public function show(Lot $lot)
    {
        $lot->load('animals');
        return response()->json($lot);
    }

    public function update(Request $request, Lot $lot)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|unique:lots,code,' . $lot->id,
            'type' => 'sometimes|in:pasture,paddock,corral,stable,feeding_area',
            'status' => 'sometimes|in:active,inactive,maintenance',
            'area_size' => 'nullable|numeric|min:0',
            'capacity' => 'nullable|integer|min:0',
            'location_description' => 'nullable|string'
        ], [
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'code.unique' => 'El código ya existe',
            'type.in' => 'Tipo de lote no válido',
            'status.in' => 'Estado no válido',
            'area_size.numeric' => 'Ingrese un valor numérico',
            'area_size.min' => 'El área no puede ser negativa',
            'capacity.integer' => 'Ingrese un número entero',
            'capacity.min' => 'La capacidad no puede ser negativa',
        ]);
        
        $lot->update($validated);
        
        return response()->json($lot);
    }

    public function destroy(Lot $lot)
    {
        if ($lot->animals()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar un lote con animales'
            ], 422);
        }
        
        $lot->delete();
        
        return response()->json(['message' => 'Lote eliminado']);
    }
}