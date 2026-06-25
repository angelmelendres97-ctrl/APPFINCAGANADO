<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('first_name')->paginate(20);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role_id' => 'nullable|exists:roles,id',
            'role_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive,suspended',
        ], [
            'first_name.required' => 'El nombre es obligatorio',
            'first_name.max' => 'El nombre no puede exceder 255 caracteres',
            'last_name.max' => 'El apellido no puede exceder 255 caracteres',
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.max' => 'El correo no puede exceder 255 caracteres',
            'email.unique' => 'Este correo ya está registrado',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'role_id.exists' => 'El rol seleccionado no existe',
            'status.in' => 'Estado no válido',
        ]);

        if (empty($validated['role_id']) && !empty($validated['role_name'])) {
            $role = \App\Models\Role::firstOrCreate(
                ['name' => $validated['role_name']],
                ['description' => $validated['role_name'], 'active' => true]
            );
            $validated['role_id'] = $role->id;
        }

        $farm = \App\Models\Farm::first();
        $validated['farm_id'] = $farm ? $farm->id : null;
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['password'] = $validated['password'] ?? 'finca123';
        unset($validated['role_name']);

        $user = User::create($validated);

        return response()->json($user->load('role'), 201);
    }

    public function show(User $user)
    {
        return $user->load('role');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'sometimes|exists:roles,id',
            'status' => 'sometimes|in:active,inactive,suspended',
        ], [
            'first_name.max' => 'El nombre no puede exceder 255 caracteres',
            'last_name.max' => 'El apellido no puede exceder 255 caracteres',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.max' => 'El correo no puede exceder 255 caracteres',
            'email.unique' => 'Este correo ya está registrado',
            'role_id.exists' => 'El rol seleccionado no existe',
            'status.in' => 'Estado no válido',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
