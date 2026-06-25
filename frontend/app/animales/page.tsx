"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Eye, Pencil, Trash2, Plus, Download, Filter, ImageIcon, QrCode, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { animalService, type Animal } from "@/lib/services/animals"
import { lotService, type Lot } from "@/lib/services/lots"
import { breedService, type Breed } from "@/lib/services/breeds"
import { statusService, type AnimalStatus } from "@/lib/services/statuses"
import { categoryService, type AnimalCategory } from "@/lib/services/categories"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const uniqueByIdAndName = <T extends { id: number; name: string }>(items: T[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.id}-${item.name.trim().toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const getAnimalImages = (animal: AnimalWithExtras | Animal) => {
  const photoImages = animal.photos?.map((photo) => photo.file_path).filter(Boolean) || []
  if (photoImages.length > 0) return photoImages
  return animal.photo_path ? [animal.photo_path] : []
}

const exportAnimalsToExcel = (rows: AnimalWithExtras[]) => {
  const headers = ["Código", "Nombre", "Arete", "Sexo", "Raza", "Categoría", "Estado", "Lote", "Peso (kg)", "Nacimiento"]
  const body = rows.map((animal) => [animal.internal_code, animal.name || "", animal.ear_tag || "", animal.sex === "male" ? "Macho" : "Hembra", animal.breed?.name || "", animal.category?.name || "", animal.status?.name || "", animal.lot?.name || "", animal.weight_current || "", animal.birth_date || ""])
  const html = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif}th{background:#166534;color:#fff;font-weight:bold;padding:10px;border:1px solid #14532d}td{padding:8px;border:1px solid #bbf7d0}tr:nth-child(even){background:#f0fdf4}.title{background:#dcfce7;color:#14532d;font-size:20px;font-weight:bold}</style></head><body><table><tr><td class="title" colspan="${headers.length}">Reporte de Animales - Finca Ganado</td></tr><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>${body.map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`).join("")}</tr>`).join("")}</table></body></html>`
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `reporte-animales-${new Date().toISOString().slice(0, 10)}.xls`
  link.click()
  URL.revokeObjectURL(url)
}

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
  const [statuses, setStatuses] = useState<AnimalStatus[]>([])
  const [categories, setCategories] = useState<AnimalCategory[]>([])
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [qrOpen, setQrOpen] = useState(false)
  const [filters, setFilters] = useState({ search: "", sex: "all", breedId: "all", statusId: "all", lotId: "all", categoryId: "all" })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatusId, setSelectedStatusId] = useState("")
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

  const loadCatalogs = useCallback(async () => {
    try {
      const [statusesData, categoriesData] = await Promise.all([statusService.list(), categoryService.list()])
      setStatuses(uniqueByIdAndName(statusesData))
      setCategories(uniqueByIdAndName(categoriesData))
    } catch {}
  }, [])

  useEffect(() => { loadAnimales(); loadBreeds(); loadLots(); loadCatalogs() }, [loadAnimales, loadBreeds, loadLots, loadCatalogs])

  const uniqueBreeds = useMemo(() => uniqueByIdAndName(breeds), [breeds])
  const uniqueCategories = useMemo(() => uniqueByIdAndName(categories), [categories])
  const breedOptions = uniqueBreeds.map((b) => ({ value: String(b.id), label: b.name }))
  const lotOptions = lots.map((l) => ({ value: String(l.id), label: `${l.name} (${l.code})` }))
  const animalOptions = animales.map((a) => ({ value: String(a.id), label: `${a.internal_code} - ${a.name || "Sin nombre"}` }))

  const filteredAnimales = useMemo(() => animales.filter((animal) => {
    const text = filters.search.trim().toLowerCase()
    const matchesText = !text || [animal.internal_code, animal.name, animal.ear_tag, animal.breed?.name, animal.lot?.name, animal.status?.name, animal.category?.name]
      .some((value) => String(value || "").toLowerCase().includes(text))
    return matchesText
      && (filters.sex === "all" || animal.sex === filters.sex)
      && (filters.breedId === "all" || String(animal.breed_id) === filters.breedId)
      && (filters.statusId === "all" || String(animal.status_id) === filters.statusId)
      && (filters.lotId === "all" || String(animal.lot_id) === filters.lotId)
      && (filters.categoryId === "all" || String(animal.category_id) === filters.categoryId)
  }), [animales, filters])

  const animalProfileUrl = currentAnimal?.id && typeof window !== "undefined"
    ? `${window.location.origin}/animales?animal=${currentAnimal.id}`
    : ""
  const qrImageUrl = animalProfileUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(animalProfileUrl)}` : ""

  useEffect(() => {
    if (typeof window === "undefined" || viewDialogOpen) return

    const animalId = Number(new URLSearchParams(window.location.search).get("animal"))
    if (!animalId) return

    const openAnimalFromUrl = async () => {
      const animal = animales.find((item) => item.id === animalId)
      try {
        const detailed = animal ? await animalService.get(animal.id) : await animalService.get(animalId)
        setCurrentAnimal({ ...detailed, imagenes: getAnimalImages(detailed) })
      } catch {
        if (animal) setCurrentAnimal({ ...animal, imagenes: getAnimalImages(animal) })
      } finally {
        setViewDialogOpen(true)
      }
    }

    openAnimalFromUrl()
  }, [animales, viewDialogOpen])

  const handleCreate = () => {
    setCurrentAnimal({ ...defaultAnimal })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (animal: AnimalWithExtras) => {
    setCurrentAnimal({ ...animal, imagenes: getAnimalImages(animal) })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleView = async (animal: AnimalWithExtras) => {
    try {
      const detailed = await animalService.get(animal.id)
      setCurrentAnimal({ ...detailed, imagenes: getAnimalImages(detailed) })
    } catch {
      setCurrentAnimal(animal)
    }
    setViewDialogOpen(true)
  }


  const handleStatusChange = (animal: AnimalWithExtras) => {
    setCurrentAnimal(animal)
    setSelectedStatusId(animal.status_id ? String(animal.status_id) : "")
    setStatusDialogOpen(true)
  }

  const saveStatusChange = async () => {
    if (!currentAnimal?.id || !selectedStatusId) {
      toast({ title: "Error", description: "Seleccione un estado válido.", variant: "destructive" })
      return
    }

    try {
      await animalService.updateStatus(currentAnimal.id, Number(selectedStatusId))
      toast({ title: "Estado actualizado", description: "El estado del animal se actualizó correctamente." })
      setStatusDialogOpen(false)
      loadAnimales()
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado del animal.", variant: "destructive" })
    }
  }

  const handleImagesChange = (images: string[]) => {
    updateField("imagenes", images)
    toast({
      title: images.length > 0 ? "Imágenes cargadas" : "Imágenes eliminadas",
      description: images.length > 0
        ? `${images.length} imagen${images.length === 1 ? "" : "es"} lista${images.length === 1 ? "" : "s"} para guardar.`
        : "No hay imágenes seleccionadas para este animal.",
    })
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
        lot_id: currentAnimal.lot_id,
        mother_id: currentAnimal.mother_id,
        father_id: currentAnimal.father_id,
        photo_path: currentAnimal.imagenes?.[0] || currentAnimal.photo_path,
        images: currentAnimal.imagenes || [],
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

        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Filtros del listado</h2>
              <p className="text-sm text-muted-foreground">Busca y combina opciones por sexo, raza, estado, lote y categoría.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setFiltersOpen((value) => !value)}>
                <Filter className="h-4 w-4" /> Filtros
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => exportAnimalsToExcel(filteredAnimales)}>
                <Download className="h-4 w-4" /> Exportar
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo Animal
              </Button>
            </div>
          </div>
          {filtersOpen && (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Input placeholder="Código, nombre, arete..." value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
              <Select value={filters.sex} onValueChange={(value) => setFilters((prev) => ({ ...prev, sex: value }))}><SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los sexos</SelectItem><SelectItem value="female">Hembras</SelectItem><SelectItem value="male">Machos</SelectItem></SelectContent></Select>
              <Select value={filters.breedId} onValueChange={(value) => setFilters((prev) => ({ ...prev, breedId: value }))}><SelectTrigger><SelectValue placeholder="Raza" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las razas</SelectItem>{uniqueBreeds.map((breed) => <SelectItem key={breed.id} value={String(breed.id)}>{breed.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.statusId} onValueChange={(value) => setFilters((prev) => ({ ...prev, statusId: value }))}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem>{statuses.map((status) => <SelectItem key={status.id} value={String(status.id)}>{status.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.lotId} onValueChange={(value) => setFilters((prev) => ({ ...prev, lotId: value }))}><SelectTrigger><SelectValue placeholder="Lote" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los lotes</SelectItem>{lots.map((lot) => <SelectItem key={lot.id} value={String(lot.id)}>{lot.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.categoryId} onValueChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}><SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las categorías</SelectItem>{uniqueCategories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select>
            </div>
          )}
        </div>

        <DataTable
          data={filteredAnimales}
          columns={columns}
          searchPlaceholder="Buscar animal por código o nombre..."
          searchKeys={["internal_code", "name", "ear_tag"]}
          actions={(item) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(item)} title="Cambiar estado">
                <RefreshCw className="h-4 w-4" />
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
            <Tabs defaultValue="general" className="py-4">
              <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="imagenes">Imágenes</TabsTrigger><TabsTrigger value="paternidad">Paternidad</TabsTrigger></TabsList>
              <TabsContent value="imagenes" className="space-y-3 pt-4">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Imágenes del Animal
                </Label>
                <ImageUpload
                  images={currentAnimal?.imagenes || []}
                  onChange={handleImagesChange}
                  maxImages={5}
                />
              </TabsContent>
              <TabsContent value="general" className="space-y-6 pt-4">
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
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={currentAnimal?.category_id ? String(currentAnimal.category_id) : ""}
                    onValueChange={(value) => updateField("category_id", Number(value))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
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
              </TabsContent>
              <TabsContent value="paternidad" className="grid gap-4 pt-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Madre</Label><SearchableSelect options={animalOptions.filter((a) => a.value !== String(currentAnimal?.id || ""))} value={currentAnimal?.mother_id ? String(currentAnimal.mother_id) : ""} onValueChange={(value) => updateField("mother_id", Number(value))} placeholder="Seleccionar madre..." searchPlaceholder="Buscar animal..." emptyMessage="No se encontró el animal." /></div>
                <div className="space-y-2"><Label>Padre</Label><SearchableSelect options={animalOptions.filter((a) => a.value !== String(currentAnimal?.id || ""))} value={currentAnimal?.father_id ? String(currentAnimal.father_id) : ""} onValueChange={(value) => updateField("father_id", Number(value))} placeholder="Seleccionar padre..." searchPlaceholder="Buscar animal..." emptyMessage="No se encontró el animal." /></div>
              </TabsContent>
            </Tabs>

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
            <DialogHeader><DialogTitle className="flex items-center justify-between">Detalle del Animal <Button variant="outline" size="icon" onClick={() => setQrOpen(true)} title="Generar código QR"><QrCode className="h-4 w-4" /></Button></DialogTitle></DialogHeader>
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
                <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                  <div><p className="text-sm text-muted-foreground">Madre</p><p className="font-medium">{currentAnimal.mother ? `${currentAnimal.mother.internal_code} - ${currentAnimal.mother.name || "Sin nombre"}` : "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Padre</p><p className="font-medium">{currentAnimal.father ? `${currentAnimal.father.internal_code} - ${currentAnimal.father.name || "Sin nombre"}` : "-"}</p></div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-semibold">Ficha integral</p>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div><span className="text-muted-foreground">Alimentación:</span> {((currentAnimal as AnimalWithExtras & { feedingRecords?: unknown[] }).feedingRecords?.length || 0)} registros</div>
                    <div><span className="text-muted-foreground">Producción de leche:</span> {((currentAnimal as AnimalWithExtras & { milkRecords?: unknown[] }).milkRecords?.length || 0)} registros</div>
                    <div><span className="text-muted-foreground">Sanidad:</span> {((currentAnimal as AnimalWithExtras & { healthRecords?: unknown[] }).healthRecords?.length || 0)} registros</div>
                    <div><span className="text-muted-foreground">Reproducción:</span> {((currentAnimal as AnimalWithExtras & { reproductiveRecords?: unknown[] }).reproductiveRecords?.length || 0)} registros</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">La ficha se abre automáticamente al acceder desde el enlace del código QR y concentra los datos generales y relaciones asociadas del animal.</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Cambiar estado del animal</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Seleccione el nuevo estado para {currentAnimal?.internal_code}.</p>
              <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado..." /></SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => <SelectItem key={status.id} value={String(status.id)}>{status.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveStatusChange}>Guardar estado</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader><DialogTitle>Código QR de la ficha</DialogTitle></DialogHeader>
            {qrImageUrl && <img src={qrImageUrl} alt="Código QR del animal" className="mx-auto rounded-lg border bg-white p-3" />}
            <p className="break-all text-xs text-muted-foreground">{animalProfileUrl}</p>
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
