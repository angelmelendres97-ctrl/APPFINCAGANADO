<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReproductiveRecord;
use App\Models\AnimalStatus;
use Illuminate\Http\Request;

class ReproductiveRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = ReproductiveRecord::with(['animal', 'relatedMale', 'reproductiveType', 'creator']);
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('result')) {
            $query->where('result', $request->result);
        }

        if ($request->filled('date')) {
            $query->whereDate('event_date', $request->date);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        if ($request->filled('animal_code')) {
            $query->whereHas('animal', function ($animalQuery) use ($request) {
                $animalQuery->where('internal_code', 'like', '%' . $request->animal_code . '%');
            });
        }

        if ($request->filled('reproductive_type_id')) {
            $query->where('reproductive_type_id', $request->reproductive_type_id);
        }

        if ($request->filled('responsible')) {
            $query->where('technician_name', 'like', '%' . $request->responsible . '%');
        }
        
        $perPage = min((int) $request->input('per_page', 20), 1000);
        $records = $query->orderBy('event_date', 'desc')->paginate($perPage);
        
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'reproductive_type_id' => 'required|exists:reproductive_types,id',
            'event_date' => 'required|date',
            'related_male_animal_id' => 'nullable|exists:animals,id',
            'semen_code' => 'nullable|string|max:50',
            'technician_name' => 'nullable|string|max:100',
            'expected_delivery_date' => 'nullable|date',
            'result' => 'nullable|in:pending,positive,negative,unknown,completed',
            'offspring_count' => 'nullable|integer|min:0',
            'observations' => 'nullable|string'
        ], [
            'animal_id.required' => 'Seleccione un animal',
            'animal_id.exists' => 'El animal no existe',
            'reproductive_type_id.required' => 'Seleccione el tipo reproductivo',
            'reproductive_type_id.exists' => 'El tipo no existe',
            'event_date.required' => 'La fecha es obligatoria',
            'event_date.date' => 'Ingrese una fecha válida',
            'related_male_animal_id.exists' => 'El animal macho no existe',
            'semen_code.max' => 'El código no puede exceder 50 caracteres',
            'technician_name.max' => 'El nombre no puede exceder 100 caracteres',
            'expected_delivery_date.date' => 'Ingrese una fecha válida',
            'result.in' => 'Resultado no válido',
            'offspring_count.integer' => 'Ingrese un número entero',
            'offspring_count.min' => 'El número no puede ser negativo',
        ]);
        
        if ($request->user()) {
            $validated['created_by'] = $request->user()->id;
        }
        
        $record = ReproductiveRecord::create($validated);
        
        $this->syncAnimalStatus($record);

        return response()->json($record->load(['animal', 'relatedMale', 'reproductiveType', 'creator']), 201);
    }

    public function update(Request $request, ReproductiveRecord $reproductiveRecord)
    {
        $validated = $request->validate([
            'animal_id' => 'sometimes|exists:animals,id',
            'reproductive_type_id' => 'sometimes|exists:reproductive_types,id',
            'event_date' => 'sometimes|date',
            'related_male_animal_id' => 'nullable|exists:animals,id',
            'semen_code' => 'nullable|string|max:50',
            'technician_name' => 'nullable|string|max:100',
            'expected_delivery_date' => 'nullable|date',
            'result' => 'nullable|in:pending,positive,negative,unknown,completed',
            'offspring_count' => 'nullable|integer|min:0',
            'observations' => 'nullable|string'
        ], [
            'animal_id.exists' => 'El animal no existe',
            'reproductive_type_id.exists' => 'El tipo no existe',
            'event_date.date' => 'Ingrese una fecha válida',
            'related_male_animal_id.exists' => 'El animal macho no existe',
            'semen_code.max' => 'El código no puede exceder 50 caracteres',
            'technician_name.max' => 'El nombre no puede exceder 100 caracteres',
            'expected_delivery_date.date' => 'Ingrese una fecha válida',
            'result.in' => 'Resultado no válido',
            'offspring_count.integer' => 'Ingrese un número entero',
            'offspring_count.min' => 'El número no puede ser negativo',
        ]);
        
        $reproductiveRecord->update($validated);
        $this->syncAnimalStatus($reproductiveRecord->fresh());
        
        return response()->json($reproductiveRecord->fresh()->load(['animal', 'relatedMale', 'reproductiveType', 'creator']));
    }

    public function transition(Request $request, ReproductiveRecord $reproductiveRecord)
    {
        $validated = $request->validate([
            'result' => 'required|in:positive,negative,completed,unknown',
            'observations' => 'nullable|string',
            'offspring_count' => 'nullable|integer|min:0',
        ]);

        $current = $reproductiveRecord->result ?: 'pending';
        $allowed = [
            'pending' => ['positive', 'negative'],
            'positive' => ['completed', 'negative'],
            'negative' => ['completed'],
            'completed' => [],
            'unknown' => ['positive', 'negative'],
        ];

        if (!in_array($validated['result'], $allowed[$current] ?? [], true)) {
            return response()->json(['message' => 'Transición de estado no permitida'], 422);
        }

        $reproductiveRecord->update($validated);
        $this->syncAnimalStatus($reproductiveRecord->fresh());

        return response()->json($reproductiveRecord->fresh()->load(['animal', 'relatedMale', 'reproductiveType', 'creator']));
    }

    private function syncAnimalStatus(ReproductiveRecord $record): void
    {
        $animal = $record->animal;
        if (!$animal) {
            return;
        }

        if ($record->result === 'positive') {
            $pregnantStatus = AnimalStatus::where('name', 'like', '%Preñ%')->first();
            $animal->update([
                'status_id' => $pregnantStatus?->id ?? $animal->status_id,
                'reproductive_stage' => 'active',
            ]);
            return;
        }

        if (in_array($record->result, ['negative', 'completed'], true)) {
            $activeStatus = AnimalStatus::where('name', 'Activo')->first();
            $animal->update([
                'status_id' => $activeStatus?->id ?? $animal->status_id,
                'reproductive_stage' => 'rest',
            ]);
        }
    }

    public function destroy(ReproductiveRecord $reproductiveRecord)
    {
        $reproductiveRecord->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
