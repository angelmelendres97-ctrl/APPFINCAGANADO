<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventType;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['animal', 'lot', 'eventType']);
        
        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }
        
        if ($request->filled('lot_id')) {
            $query->where('lot_id', $request->lot_id);
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        
        $events = $query->orderBy('event_date')->paginate(20);
        
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'farm_id' => 'nullable|exists:farms,id',
            'animal_id' => 'nullable|exists:animals,id',
            'lot_id' => 'nullable|exists:lots,id',
            'event_type_id' => 'required|exists:event_types,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'start_time' => 'nullable',
            'end_time' => 'nullable',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'reminder_date' => 'nullable|date'
        ], [
            'farm_id.exists' => 'La finca no existe',
            'animal_id.exists' => 'El animal no existe',
            'lot_id.exists' => 'El potrero no existe',
            'event_type_id.required' => 'Seleccione el tipo de evento',
            'event_type_id.exists' => 'El tipo de evento no existe',
            'title.required' => 'El título es obligatorio',
            'title.max' => 'El título no puede exceder 200 caracteres',
            'event_date.required' => 'La fecha del evento es obligatoria',
            'event_date.date' => 'Ingrese una fecha válida',
            'priority.required' => 'Seleccione la prioridad',
            'priority.in' => 'Prioridad no válida',
            'status.required' => 'Seleccione el estado',
            'status.in' => 'Estado no válido',
            'reminder_date.date' => 'Ingrese una fecha válida',
        ]);
        
        if (empty($validated['farm_id'])) {
            $farm = \App\Models\Farm::first();
            $validated['farm_id'] = $farm ? $farm->id : null;
        }
        $validated['created_by'] = $request->user()->id;
        
        $event = Event::create($validated);
        
        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'farm_id' => 'sometimes|exists:farms,id',
            'animal_id' => 'nullable|exists:animals,id',
            'lot_id' => 'nullable|exists:lots,id',
            'event_type_id' => 'sometimes|exists:event_types,id',
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'event_date' => 'sometimes|date',
            'start_time' => 'nullable',
            'end_time' => 'nullable',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled',
            'reminder_date' => 'nullable|date'
        ], [
            'farm_id.exists' => 'La finca no existe',
            'animal_id.exists' => 'El animal no existe',
            'lot_id.exists' => 'El potrero no existe',
            'event_type_id.exists' => 'El tipo de evento no existe',
            'title.max' => 'El título no puede exceder 200 caracteres',
            'event_date.date' => 'Ingrese una fecha válida',
            'priority.in' => 'Prioridad no válida',
            'status.in' => 'Estado no válido',
            'reminder_date.date' => 'Ingrese una fecha válida',
        ]);
        
        $event->update($validated);
        
        $event->updated_by = $request->user()->id;
        $event->save();
        
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Evento eliminado']);
    }
}
