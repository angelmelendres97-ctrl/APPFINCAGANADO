<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimalStatus;
use Illuminate\Http\Request;

class AnimalStatusController extends Controller
{
    public function index() { return AnimalStatus::all(); }
    
    public function store(Request $request) 
    { 
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
        ]);
        return AnimalStatus::create($validated); 
    }
    
    public function show(AnimalStatus $animalStatus) { return $animalStatus; }
    
    public function update(Request $request, AnimalStatus $animalStatus) 
    { 
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255'
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
        ]);
        $animalStatus->update($validated); 
        return $animalStatus; 
    }
    
    public function destroy(AnimalStatus $animalStatus) 
    { 
        $animalStatus->delete(); 
        return response()->json(['message' => 'Eliminado'], 204); 
    }
}