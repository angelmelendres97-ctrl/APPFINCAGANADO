<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feed;
use App\Models\AnimalFeedingRecord;
use App\Models\LotFeedingRecord;
use Illuminate\Http\Request;

class FeedingController extends Controller
{
    public function indexFeeds(Request $request)
    {
        $query = Feed::query();
        
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('feed_type')) {
            $query->where('feed_type', $request->feed_type);
        }
        
        $feeds = $query->orderBy('name')->paginate(20);
        
        return response()->json($feeds);
    }

    public function storeFeed(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'feed_type' => 'required|in:concentrate,forage,supplement,mineral,additive',
            'nutritional_description' => 'nullable|string',
            'measurement_unit' => 'required|string',
            'stock_quantity' => 'nullable|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'active' => 'boolean'
        ], [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 100 caracteres',
            'feed_type.required' => 'Seleccione el tipo de alimento',
            'feed_type.in' => 'Tipo de alimento no válido',
            'measurement_unit.required' => 'La unidad de medida es obligatoria',
            'stock_quantity.numeric' => 'Ingrese un valor numérico',
            'stock_quantity.min' => 'La cantidad no puede ser negativa',
            'minimum_stock.numeric' => 'Ingrese un valor numérico',
            'minimum_stock.min' => 'La cantidad mínima no puede ser negativa',
        ]);
        
        $feed = Feed::create($validated);
        
        return response()->json(['message' => 'Alimento creado', 'data' => $feed], 201);
    }

    public function animalRecords(Request $request)
    {
        $query = AnimalFeedingRecord::with(['animal', 'feed']);
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('feeding_date', '>=', $request->date_from);
        }
        
        return response()->json($query->orderBy('feeding_date', 'desc')->paginate(20));
    }

    public function storeAnimalRecord(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'feed_id' => 'required|exists:feeds,id',
            'feeding_date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'frequency' => 'nullable|in:once,daily,weekly',
            'supplied_by' => 'nullable|string',
            'observations' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal no existe',
            'feed_id.required' => 'Seleccione un alimento',
            'feed_id.exists' => 'El alimento no existe',
            'feeding_date.required' => 'La fecha es obligatoria',
            'feeding_date.date' => 'Ingrese una fecha válida',
            'quantity.required' => 'La cantidad es obligatoria',
            'quantity.numeric' => 'Ingrese un valor numérico',
            'quantity.min' => 'La cantidad no puede ser negativa',
            'unit.required' => 'La unidad es obligatoria',
            'frequency.in' => 'Frecuencia no válida',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        
        $record = AnimalFeedingRecord::create($validated);
        
        return response()->json(['message' => 'Registro creado', 'data' => $record], 201);
    }

    public function lotRecords(Request $request)
    {
        $query = LotFeedingRecord::with(['lot', 'feed']);
        
        if ($request->filled('lot_id')) {
            $query->where('lot_id', $request->lot_id);
        }
        
        return response()->json($query->orderBy('feeding_date', 'desc')->paginate(20));
    }

    public function storeLotRecord(Request $request)
    {
        $validated = $request->validate([
            'lot_id' => 'required|exists:lots,id',
            'feed_id' => 'required|exists:feeds,id',
            'feeding_date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'estimated_animals' => 'nullable|integer|min:0',
            'supplied_by' => 'nullable|string',
            'observations' => 'nullable|string'
        ], [
            'lot_id.required' => 'Seleccione un potrero',
            'lot_id.exists' => 'El potrero no existe',
            'feed_id.required' => 'Seleccione un alimento',
            'feed_id.exists' => 'El alimento no existe',
            'feeding_date.required' => 'La fecha es obligatoria',
            'feeding_date.date' => 'Ingrese una fecha válida',
            'quantity.required' => 'La cantidad es obligatoria',
            'quantity.numeric' => 'Ingrese un valor numérico',
            'quantity.min' => 'La cantidad no puede ser negativa',
            'unit.required' => 'La unidad es obligatoria',
            'estimated_animals.integer' => 'Ingrese un número entero',
            'estimated_animals.min' => 'El número no puede ser negativo',
        ]);
        
        $validated['created_by'] = $request->user()->id;
        
        $record = LotFeedingRecord::create($validated);
        
        return response()->json(['message' => 'Registro creado', 'data' => $record], 201);
    }
}