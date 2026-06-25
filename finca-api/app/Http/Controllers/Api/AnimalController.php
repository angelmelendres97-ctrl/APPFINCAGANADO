<?php

namespace App\Http\Controllers\Api;

use App\Models\Animal;
use App\Models\AnimalPhoto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AnimalController extends Controller
{
    public function index(Request $request)
    {
        $query = Animal::with(['breed', 'lot', 'status', 'category', 'mother', 'father', 'photos']);
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('internal_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('ear_tag', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('sex')) {
            $query->where('sex', $request->sex);
        }
        
        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }
        
        if ($request->filled('lot_id')) {
            $query->where('lot_id', $request->lot_id);
        }
        
        $perPage = min((int) $request->input('per_page', 15), 1000);
        return $query->orderBy('internal_code')->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'internal_code' => 'required|string|max:50|unique:animals,internal_code',
            'name' => 'nullable|string|max:255',
            'ear_tag' => 'nullable|string|max:50',
            'sex' => 'required|in:male,female',
            'birth_date' => 'nullable|date',
            'weight_current' => 'nullable|numeric|min:0',
            'breed_id' => 'nullable|exists:breeds,id',
            'category_id' => 'nullable|exists:animal_categories,id',
            'status_id' => 'nullable|exists:animal_statuses,id',
            'lot_id' => 'nullable|exists:lots,id',
            'mother_id' => 'nullable|exists:animals,id',
            'father_id' => 'nullable|exists:animals,id',
            'photo_path' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
        ], [
            'internal_code.required' => 'El código interno es obligatorio',
            'internal_code.unique' => 'El código interno ya existe',
            'internal_code.max' => 'El código no puede tener más de 50 caracteres',
            'sex.required' => 'El género es obligatorio',
            'sex.in' => 'Seleccione macho o hembra',
            'ear_tag.max' => 'La etiqueta no puede tener más de 50 caracteres',
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'birth_date.date' => 'Ingrese una fecha válida',
            'weight_current.numeric' => 'Ingrese un peso válido',
            'weight_current.min' => 'El peso no puede ser negativo',
            'breed_id.exists' => 'La raza seleccionada no existe',
            'category_id.exists' => 'La categoría seleccionada no existe',
            'status_id.exists' => 'El estado seleccionado no existe',
            'lot_id.exists' => 'El potrero seleccionado no existe',
            'mother_id.exists' => 'La madre seleccionada no existe',
            'father_id.exists' => 'El padre seleccionado no existe',
        ]);

        $farm = \App\Models\Farm::first();
        $validated['farm_id'] = $farm ? $farm->id : null;
        $validated['active'] = true;

        if ($request->user()) {
            $validated['created_by'] = $request->user()->id;
        }

        $images = $validated['images'] ?? [];
        unset($validated['images']);
        $validated['photo_path'] = $this->storePhotoIfDataUrl($images[0] ?? ($validated['photo_path'] ?? null));

        $animal = Animal::create($validated);
        $this->syncPhotos($animal, $images);

        return $animal->load(['breed', 'lot', 'status', 'category', 'mother', 'father', 'photos']);
    }

    public function show(Animal $animal)
    {
        return $animal->load(['breed', 'lot', 'status', 'category', 'mother', 'father', 'breed.species', 'photos', 'milkRecords', 'healthRecords', 'feedingRecords', 'reproductiveRecords']);
    }

    public function update(Request $request, Animal $animal)
    {
        $validated = $request->validate([
            'farm_id' => 'sometimes|exists:farms,id',
            'internal_code' => 'sometimes|string|max:50|unique:animals,internal_code,' . $animal->id,
            'name' => 'nullable|string|max:255',
            'ear_tag' => 'nullable|string|max:50',
            'sex' => 'sometimes|in:male,female',
            'birth_date' => 'nullable|date',
            'weight_current' => 'nullable|numeric|min:0',
            'breed_id' => 'nullable|exists:breeds,id',
            'category_id' => 'nullable|exists:animal_categories,id',
            'status_id' => 'nullable|exists:animal_statuses,id',
            'lot_id' => 'nullable|exists:lots,id',
            'mother_id' => 'nullable|exists:animals,id',
            'father_id' => 'nullable|exists:animals,id',
            'photo_path' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
        ], [
            'internal_code.unique' => 'El código interno ya existe',
            'internal_code.max' => 'El código no puede tener más de 50 caracteres',
            'sex.in' => 'Seleccione macho o hembra',
            'ear_tag.max' => 'La etiqueta no puede tener más de 50 caracteres',
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'birth_date.date' => 'Ingrese una fecha válida',
            'weight_current.numeric' => 'Ingrese un peso válido',
            'weight_current.min' => 'El peso no puede ser negativo',
            'breed_id.exists' => 'La raza seleccionada no existe',
            'category_id.exists' => 'La categoría seleccionada no existe',
            'status_id.exists' => 'El estado seleccionado no existe',
            'lot_id.exists' => 'El potrero seleccionado no existe',
            'mother_id.exists' => 'La madre seleccionada no existe',
            'father_id.exists' => 'El padre seleccionado no existe',
        ]);

        if ($request->user()) {
            $validated['updated_by'] = $request->user()->id;
        }

        $images = $validated['images'] ?? null;
        unset($validated['images']);

        if ($images !== null) {
            $validated['photo_path'] = $this->storePhotoIfDataUrl($images[0] ?? null);
        } elseif (array_key_exists('photo_path', $validated)) {
            $validated['photo_path'] = $this->storePhotoIfDataUrl($validated['photo_path']);
        }

        $animal->update($validated);

        if ($images !== null) {
            $this->syncPhotos($animal, $images);
        }

        return $animal->fresh()->load(['breed', 'lot', 'status', 'category', 'mother', 'father', 'photos']);
    }

    private function storePhotoIfDataUrl(?string $photo): ?string
    {
        if (!$photo || !Str::startsWith($photo, 'data:image/')) {
            return $photo;
        }

        [$metadata, $content] = explode(',', $photo, 2);
        preg_match('/data:image\/(.*?);base64/', $metadata, $matches);
        $extension = $matches[1] ?? 'png';
        $fileName = 'animals/' . Str::uuid() . '.' . $extension;

        Storage::disk('public')->put($fileName, base64_decode($content));

        return Storage::url($fileName);
    }

    private function syncPhotos(Animal $animal, array $images): void
    {
        $animal->photos()->delete();

        foreach ($images as $index => $image) {
            $path = $this->storePhotoIfDataUrl($image);
            if (!$path) {
                continue;
            }

            AnimalPhoto::create([
                'animal_id' => $animal->id,
                'file_name' => basename($path),
                'file_path' => $path,
                'file_type' => 'image',
                'description' => $index === 0 ? 'Foto principal' : 'Foto adicional',
            ]);
        }
    }

    public function destroy(Animal $animal)
    {
        $animal->delete();
        return response()->json(null, 204);
    }
}