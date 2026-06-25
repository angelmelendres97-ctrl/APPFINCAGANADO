<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Breed;
use Illuminate\Http\Request;

class BreedController extends Controller
{
    public function index() { return Breed::query()->selectRaw('MIN(id) as id, MIN(name) as name, MIN(species_id) as species_id')->groupByRaw('LOWER(TRIM(name))')->orderBy('name')->get(); }
    
    public function store(Request $request) 
    { 
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species_id' => 'required|exists:species,id'
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'species_id.required' => 'Seleccione una especie',
            'species_id.exists' => 'La especie no existe',
        ]);
        return Breed::create($validated); 
    }
    
    public function show(Breed $breed) { return $breed; }
    
    public function update(Request $request, Breed $breed) 
    { 
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'species_id' => 'sometimes|exists:species,id'
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'species_id.exists' => 'La especie no existe',
        ]);
        $breed->update($validated); 
        return $breed; 
    }
    
    public function destroy(Breed $breed) 
    { 
        $breed->delete(); 
        return response()->json(['message' => 'Eliminado'], 204); 
    }
}