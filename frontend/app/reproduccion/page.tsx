"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, Heart, Baby } from "lucide-react"
import {
  reproductiveRecordService,
  reproductiveTypeService,
  type ReproductiveRecord,
  type ReproductiveType,
} from "@/lib/services/reproductive-records"
import { animalService, type Animal } from "@/lib/services/animals"
import { useToast } from "@/hooks/use-toast"

interface Reproduccion {
  id: number
  animalId: number
  tipo: string
  fecha: string
  estado: string
  observaciones: string
}

const toReproduccion = (record: ReproductiveRecord, reproTypes: ReproductiveType[]): Reproduccion => {
  const reproType = reproTypes.find((t) => t.id === record.reproductive_type_id)
  const tipoMap: Record<string, string> = {
    "Mating": "Monta",
    "Insemination": "Inseminación",
    "Pregnancy": "Gestación",
    "Birth": "Parto",
  }
  const tipo = reproType ? (tipoMap[reproType.name] || reproType.name) : "Inseminación"
  const resultMap: Record<string, string> = {
    pending: "Pendiente",
    positive: "Exitoso",
    negative: "Fallido",
    completed: "Exitoso",
    unknown: "Pendiente",
  }
  return {
    id: record.id,
    animalId: record.animal_id,
    tipo,
    fecha: record.event_date,
    estado: record.result ? (resultMap[record.result] || "Pendiente") : "Pendiente",
    observaciones: record.observations || "",
  }
}

const toReproRecordPayload = (r: Partial<Reproduccion>, reproTypes: ReproductiveType[]) => {
  const tipoReverseMap: Record<string, string> = {
    "Monta": "Mating",
    "Inseminación": "Insemination",
    "Gestación": "Pregnancy",
    "Parto": "Birth",
  }
  const reproType = reproTypes.find(
    (t) => t.name === (tipoReverseMap[r.tipo || ""] || r.tipo)
  )
  const resultReverseMap: Record<string, string> = {
    "Pendiente": "pending",
    "Confirmado": "pending",
    "Exitoso": "positive",
    "Fallido": "negative",
  }
  return {
    animal_id: r.animalId,
    reproductive_type_id: reproType?.id || 1,
    event_date: r.fecha,
    result: r.estado ? resultReverseMap[r.estado] || "pending" : "pending",
    observations: r.observaciones || null,
  }
}

const columns = [
  {
    key: "animalId",
    label: "Animal",
    render: (item: Reproduccion & { animalInfo?: string }) => (
      <span className="font-medium text-primary">{item.animalInfo || `#${item.animalId}`}</span>
    ),
  },
  { key: "fecha", label: "Fecha" },
  {
    key: "tipo",
    label: "Tipo",
    render: (item: Reproduccion) => (
      <StatusBadge
        status={item.tipo}
        variant={
          item.tipo === "Parto" ? "success" : item.tipo === "Gestación" ? "info" : "default"
        }
      />
    ),
  },
  {
    key: "estado",
    label: "Estado",
    render: (item: Reproduccion) => <StatusBadge status={item.estado} />,
  },
  { key: "observaciones", label: "Observaciones" },
]

const defaultRegistro: Partial<Reproduccion> = {
  animalId: 0,
  tipo: "Inseminación",
  fecha: new Date().toISOString().split("T")[0],
  estado: "Pendiente",
  observaciones: "",
}

export default function ReproduccionPage() {
  const [registros, setRegistros] = useState<Reproduccion[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [reproTypes, setReproTypes] = useState<ReproductiveType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Partial<Reproduccion> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recordsData, animalsData, typesData] = await Promise.all([
        reproductiveRecordService.list(),
        animalService.list(),
        reproductiveTypeService.list(),
      ])
      const reproTypeList = typesData as ReproductiveType[]
      setReproTypes(reproTypeList)
      setAnimals((animalsData as Animal[]).filter((a) => a.sex === "female"))
      const mapped = (recordsData as ReproductiveRecord[]).map((r) => {
        const repro = toReproduccion(r, reproTypeList)
        const animal = (animalsData as Animal[]).find((a) => a.id === r.animal_id)
        return { ...repro, animalInfo: animal ? `${animal.internal_code} ${animal.name}` : `#${r.animal_id}` }
      })
      setRegistros(mapped)
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los registros.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const gestaciones = registros.filter((r) => r.tipo === "Gestación" && r.estado === "Exitoso").length
    const partos = registros.filter((r) => r.tipo === "Parto" && r.estado === "Exitoso").length
    const pendientes = registros.filter((r) => r.estado === "Pendiente").length
    return { gestaciones, partos, pendientes }
  }, [registros])

  const handleCreate = () => {
    setCurrentRegistro({ ...defaultRegistro })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (registro: Reproduccion) => {
    setCurrentRegistro({ ...registro })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (registro: Reproduccion) => {
    setCurrentRegistro(registro)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentRegistro?.id) {
      try {
        await reproductiveRecordService.delete(currentRegistro.id)
        toast({ title: "Registro eliminado", description: "El registro ha sido eliminado." })
        await loadData()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" })
      }
    }
  }, [currentRegistro, loadData, toast])

  const handleSave = async () => {
    if (!currentRegistro?.animalId || !currentRegistro?.tipo) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }

    try {
      if (isEditing && currentRegistro.id) {
        await reproductiveRecordService.update(currentRegistro.id, toReproRecordPayload(currentRegistro, reproTypes))
        toast({ title: "Registro actualizado", description: "El registro ha sido actualizado." })
      } else {
        await reproductiveRecordService.create(toReproRecordPayload(currentRegistro, reproTypes))
        toast({ title: "Registro creado", description: "El nuevo registro ha sido creado." })
      }
      setDialogOpen(false)
      await loadData()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Reproduccion, value: string) => {
    setCurrentRegistro((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const hembras = animals

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando registros...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control de Reproducción</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-pink-100 p-3 text-pink-600">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gestaciones Activas</p>
                <p className="text-2xl font-bold">{stats.gestaciones}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <Baby className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partos Exitosos</p>
                <p className="text-2xl font-bold">{stats.partos}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pendientes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>

        <DataTable
          data={registros}
          columns={columns}
          searchPlaceholder="Buscar..."
          searchKeys={["observaciones"]}
          actions={(item) => (
            <>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Registro" : "Nuevo Registro"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Animal *</Label>
                <Select value={currentRegistro?.animalId ? String(currentRegistro.animalId) : ""} onValueChange={(v) => updateField("animalId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {hembras.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.internal_code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={currentRegistro?.tipo || ""} onValueChange={(v) => updateField("tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monta">Monta</SelectItem>
                      <SelectItem value="Inseminación">Inseminación</SelectItem>
                      <SelectItem value="Gestación">Gestación</SelectItem>
                      <SelectItem value="Parto">Parto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={currentRegistro?.fecha || ""} onChange={(e) => updateField("fecha", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={currentRegistro?.estado || ""} onValueChange={(v) => updateField("estado", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Exitoso">Exitoso</SelectItem>
                    <SelectItem value="Fallido">Fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={currentRegistro?.observaciones || ""} onChange={(e) => updateField("observaciones", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Registro"
          description="¿Está seguro que desea eliminar este registro?"
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
