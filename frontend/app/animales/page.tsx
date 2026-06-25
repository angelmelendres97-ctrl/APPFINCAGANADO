"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SearchableSelect } from "@/components/searchable-select"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Pencil, Trash2, Plus, Download, Filter, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { animalService, type Animal } from "@/lib/services/animals"
import { lotService, type Lot } from "@/lib/services/lots"
import { breedService, type Breed } from "@/lib/services/breeds"

interface AnimalWithExtras extends Animal {
  imagenes?: string[]
  sexo_display?: string
  raza_nombre?: string
  lote_nombre?: string
  categoria_nombre?: string
  estado_nombre?: string
}

const columns = [
  {
    key: "internal_code",
    label: "CÓDIGO",
    render: (item: AnimalWithExtras) => (
      <div className="flex items-center gap-3">
        {item.photo_path ? (
          <img src={item.photo_path} alt={item.name || ""} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {(item.name || item.internal_code).charAt(0)}
          </div>
        )}
        <span className="font-medium text-primary">{item.internal_code}</span>
      </div>
    ),
  },
  {
    key: "name",
    label: "NOMBRE",
    render: (item: AnimalWithExtras) => <span className="font-medium">{item.name || "-"}</span>,
  },
  {
    key: "sex",
    label: "SEXO",
    render: (item: AnimalWithExtras) => (
      <StatusBadge status={item.sex === "male" ? "Macho" : "Hembra"} />
    ),
  },
  {
    key: "raza_nombre",
    label: "RAZA",
    render: (item: AnimalWithExtras) => <span>{item.breed?.name || "-"}</span>,
  },
  {
    key: "lote_nombre",
    label: "LOTE",
    render: (item: AnimalWithExtras) => <span>{item.lot?.name || "-"}</span>,
  },
  {
    key: "estado_nombre",
    label: "ESTADO",
    render: (item: AnimalWithExtras) => (
      <StatusBadge status={item.status?.name || "Activo"} />
    ),
  },
]

const defaultAnimal: Partial<Animal> = {
  internal_code: "",
  name: "",
  sex: "female",
  birth_date: "",
  weight_current: 0,
  ear_tag: "",
}

export default function AnimalesPage() {
  const [animales, setAnimales] = useState<AnimalWithExtras[]>([])
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentAnimal, setCurrentAnimal] = useState<Partial<AnimalWithExtras> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadAnimales = useCallback(async () => {
    try {
      const res = await animalService.list()
      setAnimales(res.data || [])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los animales.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadBreeds = useCallback(async () => {
    try { setBreeds(await breedService.list()) } catch {}
  }, [])

  const loadLots = useCallback(async () => {
    try { setLots((await lotService.list()).data || []) } catch {}
  }, [])

  useEffect(() => { loadAnimales(); loadBreeds(); loadLots() }, [loadAnimales, loadBreeds, loadLots])

  const breedOptions = breeds.map((b) => ({ value: String(b.id), label: b.name }))
  const lotOptions = lots.map((l) => ({ value: String(l.id), label: `${l.name} (${l.code})` }))

  const handleCreate = () => {
    setCurrentAnimal({ ...defaultAnimal })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (animal: AnimalWithExtras) => {
    setCurrentAnimal({ ...animal })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleView = (animal: AnimalWithExtras) => {
    setCurrentAnimal(animal)
    setViewDialogOpen(true)
  }

  const handleDelete = (animal: AnimalWithExtras) => {
    setCurrentAnimal(animal)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (currentAnimal?.id) {
      try {
        await animalService.delete(currentAnimal.id)
        toast({ title: "Animal eliminado", description: "El registro ha sido eliminado correctamente." })
        loadAnimales()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el animal.", variant: "destructive" })
      }
    }
  }

  const handleSave = async () => {
    if (!currentAnimal?.internal_code) {
      toast({ title: "Error", description: "El código interno es obligatorio.", variant: "destructive" })
      return
    }

    try {
      const payload: Record<string, unknown> = {
        internal_code: currentAnimal.internal_code,
        name: currentAnimal.name,
        sex: currentAnimal.sex,
        ear_tag: currentAnimal.ear_tag,
        birth_date: currentAnimal.birth_date,
        weight_current: currentAnimal.weight_current,
        breed_id: currentAnimal.breed_id,
        category_id: currentAnimal.category_id,
        status_id: currentAnimal.status_id,
        lot_id: currentAnimal.lot_id,
      }
      if (isEditing && currentAnimal.id) {
        await animalService.update(currentAnimal.id, payload)
        toast({ title: "Animal actualizado", description: "El registro ha sido actualizado correctamente." })
      } else {
        await animalService.create(payload)
        toast({ title: "Animal creado", description: "El nuevo registro ha sido creado correctamente." })
      }
      setDialogOpen(false)
      loadAnimales()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el animal.", variant: "destructive" })
    }
  }

  const updateField = (field: string, value: unknown) => {
    setCurrentAnimal((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Cargando...</p></div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Control Ganadero</h1>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md" />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo Animal
            </Button>
          </div>
        </div>

        <DataTable
          data={animales}
          columns={columns}
          searchPlaceholder="Buscar animal por código o nombre..."
          searchKeys={["internal_code", "name", "breed.name", "lot.name"]}
          actions={(item) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Animal" : "Nuevo Animal"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Imágenes del Animal
                </Label>
                <ImageUpload
                  images={currentAnimal?.imagenes || []}
                  onChange={(images) => updateField("imagenes", images)}
                  maxImages={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código Interno *</Label>
                  <Input id="codigo" placeholder="FIN-XXX" value={currentAnimal?.internal_code || ""}
                    onChange={(e) => updateField("internal_code", e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areteId">Arete/ID</Label>
                  <Input id="areteId" placeholder="Número de arete" value={currentAnimal?.ear_tag || ""}
                    onChange={(e) => updateField("ear_tag", e.target.value)} className="h-11" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Nombre del animal" value={currentAnimal?.name || ""}
                    onChange={(e) => updateField("name", e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select value={currentAnimal?.sex || "female"}
                    onValueChange={(value) => updateField("sex", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Hembra</SelectItem>
                      <SelectItem value="male">Macho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="raza">Raza</Label>
                  <SearchableSelect
                    options={breedOptions}
                    value={currentAnimal?.breed_id ? String(currentAnimal.breed_id) : ""}
                    onValueChange={(value) => updateField("breed_id", Number(value))}
                    placeholder="Buscar raza..."
                    searchPlaceholder="Escriba para buscar..."
                    emptyMessage="No se encontró la raza."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={currentAnimal?.status_id ? String(currentAnimal.status_id) : ""}
                    onValueChange={(value) => updateField("status_id", Number(value))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Activo</SelectItem>
                      <SelectItem value="2">Seco</SelectItem>
                      <SelectItem value="5">Preñado</SelectItem>
                      <SelectItem value="6">En Crecimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lote">Lote Actual</Label>
                <SearchableSelect
                  options={lotOptions}
                  value={currentAnimal?.lot_id ? String(currentAnimal.lot_id) : ""}
                  onValueChange={(value) => updateField("lot_id", Number(value))}
                  placeholder="Buscar lote..."
                  searchPlaceholder="Escriba para buscar..."
                  emptyMessage="No se encontró el lote."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input id="fechaNacimiento" type="date" value={currentAnimal?.birth_date?.split("T")[0] || ""}
                    onChange={(e) => updateField("birth_date", e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input id="peso" type="number" placeholder="Peso actual" value={currentAnimal?.weight_current || ""}
                    onChange={(e) => updateField("weight_current", Number(e.target.value))} className="h-11" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">Cancelar</Button>
              <Button onClick={handleSave} className="h-11 px-6">
                {isEditing ? "Guardar Cambios" : "Guardar Animal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detalle del Animal</DialogTitle></DialogHeader>
            {currentAnimal && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {currentAnimal.photo_path ? (
                    <img src={currentAnimal.photo_path} alt={currentAnimal.name || ""} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {(currentAnimal.name || currentAnimal.internal_code || "?").charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{currentAnimal.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentAnimal.internal_code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sexo</p>
                    <StatusBadge status={currentAnimal.sex === "male" ? "Macho" : "Hembra"} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <StatusBadge status={currentAnimal.status?.name || "Activo"} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Raza</p>
                    <p className="font-medium">{currentAnimal.breed?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{currentAnimal.category?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lote</p>
                    <p className="font-medium">{currentAnimal.lot?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">{currentAnimal.weight_current ? `${currentAnimal.weight_current} kg` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Nacimiento</p>
                    <p className="font-medium">{currentAnimal.birth_date || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arete ID</p>
                    <p className="font-medium">{currentAnimal.ear_tag || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Animal"
          description={`¿Está seguro que desea eliminar a ${currentAnimal?.name}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
