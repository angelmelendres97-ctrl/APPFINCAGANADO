"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Pencil, Trash2, Plus, MapPin, Search } from "lucide-react"
import { lotService, type Lot } from "@/lib/services/lots"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface Lote {
  id: number
  codigo: string
  nombre: string
  tipo: string
  area: number
  capacidad: number
  animales: number
  estado: string
}

const toLote = (lot: Lot): Lote => ({
  id: lot.id,
  codigo: lot.code,
  nombre: lot.name,
  tipo: lot.type === "corral" ? "Corral" : "Potrero",
  area: lot.area_size ?? 0,
  capacidad: lot.capacity,
  animales: lot.current_animals_count,
  estado: lot.status === "inactive" ? "Inactivo" : lot.status === "maintenance" ? "Mantenimiento" : "Activo",
})

const toLotPayload = (lote: Partial<Lote>) => ({
  code: lote.codigo,
  name: lote.nombre,
  type: lote.tipo === "Corral" ? "corral" : "pasture",
  area_size: lote.area,
  capacity: lote.capacidad,
  status: lote.estado === "Inactivo" ? "inactive" : lote.estado === "Mantenimiento" ? "maintenance" : "active",
})

const defaultLote: Partial<Lote> = {
  codigo: "",
  nombre: "",
  tipo: "Potrero",
  area: 0,
  capacidad: 0,
  animales: 0,
  estado: "Activo",
}

export default function PotrerosPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentLote, setCurrentLote] = useState<Partial<Lote> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadLotes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await lotService.list()
      setLotes(unwrapList<Lot>(data).map(toLote))
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los lotes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadLotes()
  }, [loadLotes])

  const filteredLotes = lotes.filter(
    (lote) =>
      lote.nombre.toLowerCase().includes(search.toLowerCase()) ||
      lote.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setCurrentLote({ ...defaultLote })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (lote: Lote) => {
    setCurrentLote({ ...lote })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (lote: Lote) => {
    setCurrentLote(lote)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentLote?.id) {
      try {
        await lotService.delete(currentLote.id)
        toast({
          title: "Lote eliminado",
          description: "El registro ha sido eliminado correctamente.",
        })
        await loadLotes()
      } catch {
        toast({
          title: "Error",
          description: "No se pudo eliminar el lote.",
          variant: "destructive",
        })
      }
    }
  }, [currentLote, loadLotes, toast])

  const handleSave = async () => {
    if (!currentLote?.nombre || !currentLote?.codigo) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentLote.id) {
        await lotService.update(currentLote.id, toLotPayload(currentLote))
        toast({
          title: "Lote actualizado",
          description: "El registro ha sido actualizado correctamente.",
        })
      } else {
        await lotService.create(toLotPayload(currentLote))
        toast({
          title: "Lote creado",
          description: "El nuevo registro ha sido creado correctamente.",
        })
      }
      setDialogOpen(false)
      await loadLotes()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el lote.",
        variant: "destructive",
      })
    }
  }

  const updateField = (field: keyof Lote, value: string | number) => {
    setCurrentLote((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando lotes...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Potreros y Lotes</h1>

        {/* Search and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          <Button onClick={handleCreate} className="gap-2 h-11">
            <Plus className="h-4 w-4" />
            Nuevo Lote
          </Button>
        </div>

        {/* Lotes Grid */}
        {filteredLotes.length === 0 ? (
          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <MapPin className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No hay lotes registrados</p>
              <p className="text-sm text-muted-foreground">
                Comienza agregando un nuevo potrero o corral
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLotes.map((lote) => (
              <Card key={lote.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{lote.codigo}</p>
                      <h3 className="text-lg font-semibold">{lote.nombre}</h3>
                    </div>
                    <StatusBadge status={lote.estado} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{lote.tipo}</span>
                    <span className="mx-1">|</span>
                    <span>{lote.area.toFixed(2)} ha</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacidad</span>
                      <span className="font-medium">
                        {lote.animales}/{lote.capacidad} animales
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min((lote.animales / lote.capacidad) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(lote)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(lote)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Lote" : "Nuevo Lote"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    placeholder="PA"
                    value={currentLote?.codigo || ""}
                    onChange={(e) => updateField("codigo", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Potrero A"
                    value={currentLote?.nombre || ""}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={currentLote?.tipo || ""}
                    onValueChange={(value) => updateField("tipo", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Potrero">Potrero</SelectItem>
                      <SelectItem value="Corral">Corral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={currentLote?.estado || ""}
                    onValueChange={(value) => updateField("estado", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Área (hectáreas)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={currentLote?.area || ""}
                    onChange={(e) => updateField("area", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad (animales)</Label>
                  <Input
                    id="capacidad"
                    type="number"
                    placeholder="0"
                    value={currentLote?.capacidad || ""}
                    onChange={(e) => updateField("capacidad", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="h-11 px-6">
                {isEditing ? "Guardar Cambios" : "Guardar Lote"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Lote"
          description={`¿Está seguro que desea eliminar ${currentLote?.nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
