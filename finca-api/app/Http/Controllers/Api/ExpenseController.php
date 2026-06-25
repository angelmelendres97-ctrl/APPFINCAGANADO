<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('creator');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('responsible')) {
            $query->where('responsible', 'like', "%{$request->responsible}%");
        }

        if ($request->filled('date_from')) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        return $query->orderBy('expense_date', 'desc')->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'responsible' => 'nullable|string|max:255',
            'observations' => 'nullable|string',
            'expense_date' => 'required|date',
        ], [
            'category.required' => 'La categoría es obligatoria',
            'category.max' => 'La categoría no puede exceder 255 caracteres',
            'description.required' => 'La descripción es obligatoria',
            'amount.required' => 'El monto es obligatorio',
            'amount.numeric' => 'Ingrese un monto válido',
            'amount.min' => 'El monto no puede ser negativo',
            'responsible.max' => 'El responsable no puede exceder 255 caracteres',
            'expense_date.required' => 'La fecha del gasto es obligatoria',
            'expense_date.date' => 'Ingrese una fecha válida',
        ]);

        $farm = \App\Models\Farm::first();
        $validated['farm_id'] = $farm ? $farm->id : null;
        $validated['created_by'] = $request->user()->id;

        $expense = Expense::create($validated);

        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return $expense->load('creator');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'amount' => 'sometimes|numeric|min:0',
            'responsible' => 'nullable|string|max:255',
            'observations' => 'nullable|string',
            'expense_date' => 'sometimes|date',
        ], [
            'category.max' => 'La categoría no puede exceder 255 caracteres',
            'amount.numeric' => 'Ingrese un monto válido',
            'amount.min' => 'El monto no puede ser negativo',
            'responsible.max' => 'El responsable no puede exceder 255 caracteres',
            'expense_date.date' => 'Ingrese una fecha válida',
        ]);

        $expense->update($validated);

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json(['message' => 'Gasto eliminado']);
    }
}
