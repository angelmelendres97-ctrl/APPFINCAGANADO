<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimalCategory;
use Illuminate\Http\Request;

class AnimalCategoryController extends Controller
{
    public function index() { return AnimalCategory::all(); }
    
    public function store(Request $request) 
    { 
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species_id' => 'nullable|exists:species,id',
            'sex_applicability' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'species_id.exists' => 'La especie no existe',
        ]);
        return AnimalCategory::create($validated); 
    }
    
    public function show(AnimalCategory $animalCategory) { return $animalCategory; }
    
    public function update(Request $request, AnimalCategory $animalCategory) 
    { 
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'species_id' => 'nullable|exists:species,id',
            'sex_applicability' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'species_id.exists' => 'La especie no existe',
        ]);
        $animalCategory->update($validated); 
        return $animalCategory; 
    }
    
    public function destroy(AnimalCategory $animalCategory) 
    { 
        $animalCategory->delete(); 
        return response()->json(['message' => 'Eliminado'], 204); 
    }
}