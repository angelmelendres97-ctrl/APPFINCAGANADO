<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $farm = Farm::first();

        if (!$farm) {
            return response()->json(['message' => 'No hay fincas configuradas'], 404);
        }

        return response()->json($farm);
    }

    public function update(Request $request)
    {
        $farm = Farm::first();

        if (!$farm) {
            return response()->json(['message' => 'No hay fincas configuradas'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ], [
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'business_name.max' => 'El nombre comercial no puede exceder 255 caracteres',
            'owner_name.max' => 'El propietario no puede exceder 255 caracteres',
            'phone.max' => 'El teléfono no puede exceder 50 caracteres',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.max' => 'El correo no puede exceder 255 caracteres',
        ]);

        $farm->update($validated);

        return response()->json($farm);
    }
}
