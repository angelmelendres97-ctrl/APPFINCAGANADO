<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Species;
use Illuminate\Http\Request;

class SpeciesController extends Controller
{
    public function index() { return Species::all(); }
    
    public function store(Request $request) 
    { 
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'scientific_name.max' => 'El nombre científico no puede exceder 255 caracteres',
        ]);
        return Species::create($validated); 
    }
    
    public function show(Species $species) { return $species; }
    
    public function update(Request $request, Species $species) 
    { 
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'scientific_name.max' => 'El nombre científico no puede exceder 255 caracteres',
        ]);
        $species->update($validated); 
        return $species; 
    }
    
    public function destroy(Species $species) 
    { 
        $species->delete(); 
        return response()->json(['message' => 'Eliminado'], 204); 
    }
}