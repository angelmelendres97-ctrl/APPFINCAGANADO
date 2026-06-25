<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    public function index()
    {
        return Farm::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'country' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'logo_path' => 'nullable|string|max:255',
            'active' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre de la finca es obligatorio',
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'business_name.max' => 'El nombre comercial no puede exceder 255 caracteres',
            'owner_name.max' => 'El nombre del propietario no puede exceder 255 caracteres',
            'tax_id.max' => 'El RFC/tax ID no puede exceder 50 caracteres',
            'phone.max' => 'El teléfono no puede exceder 50 caracteres',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.max' => 'El correo no puede exceder 255 caracteres',
            'country.max' => 'El país no puede exceder 100 caracteres',
            'province.max' => 'El estado/provincia no puede exceder 100 caracteres',
            'city.max' => 'La ciudad no puede exceder 100 caracteres',
            'latitude.numeric' => 'Ingrese una latitud válida',
            'longitude.numeric' => 'Ingrese una longitud válida',
            'logo_path.max' => 'La ruta del logo no puede exceder 255 caracteres',
        ]);

        return Farm::create($validated);
    }

    public function show(Farm $farm)
    {
        return $farm;
    }

    public function update(Request $request, Farm $farm)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'country' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'logo_path' => 'nullable|string|max:255',
            'active' => 'nullable|boolean',
        ], [
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'business_name.max' => 'El nombre comercial no puede exceder 255 caracteres',
            'owner_name.max' => 'El nombre del propietario no puede exceder 255 caracteres',
            'tax_id.max' => 'El RFC/tax ID no puede exceder 50 caracteres',
            'phone.max' => 'El teléfono no puede exceder 50 caracteres',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.max' => 'El correo no puede exceder 255 caracteres',
            'country.max' => 'El país no puede exceder 100 caracteres',
            'province.max' => 'El estado/provincia no puede exceder 100 caracteres',
            'city.max' => 'La ciudad no puede exceder 100 caracteres',
            'latitude.numeric' => 'Ingrese una latitud válida',
            'longitude.numeric' => 'Ingrese una longitud válida',
            'logo_path.max' => 'La ruta del logo no puede exceder 255 caracteres',
        ]);

        $farm->update($validated);
        return $farm;
    }

    public function destroy(Farm $farm)
    {
        $farm->delete();
        return response()->json(null, 204);
    }
}