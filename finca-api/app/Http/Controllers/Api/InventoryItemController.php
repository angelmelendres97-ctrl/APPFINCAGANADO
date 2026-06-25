<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with('creator');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'out_of_stock':
                    $query->where('stock_current', 0);
                    break;
                case 'low_stock':
                    $query->where('stock_current', '>', 0)
                          ->whereRaw('stock_current <= stock_minimum');
                    break;
                case 'available':
                    $query->whereRaw('stock_current > stock_minimum');
                    break;
            }
        }

        $items = $query->orderBy('name')->paginate(20);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'stock_current' => 'required|integer|min:0',
            'stock_minimum' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'unit_price' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'supplier' => 'nullable|string|max:255',
        ], [
            'name.required' => 'El nombre del producto es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'category.required' => 'La categoría es obligatoria',
            'category.max' => 'La categoría no puede exceder 255 caracteres',
            'stock_current.required' => 'El stock actual es obligatorio',
            'stock_current.integer' => 'Ingrese un número entero',
            'stock_current.min' => 'El stock no puede ser negativo',
            'stock_minimum.required' => 'El stock mínimo es obligatorio',
            'stock_minimum.integer' => 'Ingrese un número entero',
            'stock_minimum.min' => 'El stock mínimo no puede ser negativo',
            'unit.required' => 'La unidad de medida es obligatoria',
            'unit.max' => 'La unidad no puede exceder 50 caracteres',
            'unit_price.numeric' => 'Ingrese un precio válido',
            'unit_price.min' => 'El precio no puede ser negativo',
            'expiry_date.date' => 'Ingrese una fecha válida',
            'supplier.max' => 'El proveedor no puede exceder 255 caracteres',
        ]);

        $farm = \App\Models\Farm::first();
        $validated['farm_id'] = $farm ? $farm->id : null;
        $validated['created_by'] = $request->user()->id;

        $item = InventoryItem::create($validated);

        return response()->json($item, 201);
    }

    public function show(InventoryItem $inventoryItem)
    {
        return $inventoryItem->load('creator');
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'stock_current' => 'sometimes|integer|min:0',
            'stock_minimum' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string|max:50',
            'unit_price' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'supplier' => 'nullable|string|max:255',
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'category.max' => 'La categoría no puede exceder 255 caracteres',
            'stock_current.integer' => 'Ingrese un número entero',
            'stock_current.min' => 'El stock no puede ser negativo',
            'stock_minimum.integer' => 'Ingrese un número entero',
            'stock_minimum.min' => 'El stock mínimo no puede ser negativo',
            'unit.max' => 'La unidad no puede exceder 50 caracteres',
            'unit_price.numeric' => 'Ingrese un precio válido',
            'unit_price.min' => 'El precio no puede ser negativo',
            'expiry_date.date' => 'Ingrese una fecha válida',
            'supplier.max' => 'El proveedor no puede exceder 255 caracteres',
        ]);

        $inventoryItem->update($validated);

        return response()->json($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }
}
