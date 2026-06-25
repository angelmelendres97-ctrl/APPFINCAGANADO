<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['animal', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sale_type')) {
            $query->where('sale_type', $request->sale_type);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('sale_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('sale_date', '<=', $request->date_to);
        }

        return $query->orderBy('sale_date', 'desc')->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'nullable|exists:animals,id',
            'client_name' => 'required|string|max:255',
            'sale_type' => 'required|in:animal,product',
            'description' => 'nullable|string',
            'quantity' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'payment_status' => 'required|in:pending,paid,partial',
            'sale_date' => 'required|date',
        ], [
            'animal_id.exists' => 'El animal seleccionado no existe',
            'client_name.required' => 'El nombre del cliente es obligatorio',
            'client_name.max' => 'El nombre no puede exceder 255 caracteres',
            'sale_type.required' => 'Seleccione el tipo de venta',
            'sale_type.in' => 'Tipo de venta no válido',
            'quantity.required' => 'La cantidad es obligatoria',
            'quantity.numeric' => 'Ingrese un número válido',
            'quantity.min' => 'La cantidad no puede ser negativa',
            'unit_price.required' => 'El precio unitario es obligatorio',
            'unit_price.numeric' => 'Ingrese un número válido',
            'unit_price.min' => 'El precio no puede ser negativo',
            'payment_status.required' => 'Seleccione el estado de pago',
            'payment_status.in' => 'Estado de pago no válido',
            'sale_date.required' => 'La fecha de venta es obligatoria',
            'sale_date.date' => 'Ingrese una fecha válida',
        ]);

        $validated['total_price'] = $validated['quantity'] * $validated['unit_price'];

        $farm = \App\Models\Farm::first();
        $validated['farm_id'] = $farm ? $farm->id : null;
        $validated['created_by'] = $request->user()->id;

        $sale = Sale::create($validated);

        return response()->json($sale, 201);
    }

    public function show(Sale $sale)
    {
        return $sale->load(['animal', 'creator']);
    }

    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'animal_id' => 'nullable|exists:animals,id',
            'client_name' => 'sometimes|string|max:255',
            'sale_type' => 'sometimes|in:animal,product',
            'description' => 'nullable|string',
            'quantity' => 'sometimes|numeric|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
            'payment_status' => 'sometimes|in:pending,paid,partial',
            'sale_date' => 'sometimes|date',
        ], [
            'animal_id.exists' => 'El animal seleccionado no existe',
            'client_name.max' => 'El nombre no puede exceder 255 caracteres',
            'sale_type.in' => 'Tipo de venta no válido',
            'quantity.numeric' => 'Ingrese un número válido',
            'quantity.min' => 'La cantidad no puede ser negativa',
            'unit_price.numeric' => 'Ingrese un número válido',
            'unit_price.min' => 'El precio no puede ser negativo',
            'payment_status.in' => 'Estado de pago no válido',
            'sale_date.date' => 'Ingrese una fecha válida',
        ]);

        if (isset($validated['quantity']) || isset($validated['unit_price'])) {
            $quantity = $validated['quantity'] ?? $sale->quantity;
            $unitPrice = $validated['unit_price'] ?? $sale->unit_price;
            $validated['total_price'] = $quantity * $unitPrice;
        }

        $sale->update($validated);

        return response()->json($sale);
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();

        return response()->json(['message' => 'Venta eliminada']);
    }
}
