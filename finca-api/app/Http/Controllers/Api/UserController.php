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
