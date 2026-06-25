"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
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
import { Pencil, Trash2, Plus, Calendar } from "lucide-react"
import { eventService, eventTypeService, type Event, type EventType } from "@/lib/services/events"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface Evento {
  id: number
  titulo: string
  tipo: string
  fecha: string
  prioridad: string
  estado: string
  descripcion: string
}

const toEvento = (event: Event, eventTypes: EventType[]): Evento => {
  const eventType = eventTypes.find((t) => t.id === event.event_type_id)
  return {
    id: event.id,
    titulo: event.title,
    tipo: eventType?.name || "Otro",
    fecha: event.event_date,
    prioridad: event.priority,
    estado: event.status,
    descripcion: event.description || "",
  }
}

const toEventPayload = (e: Partial<Evento>, eventTypes: EventType[]) => {
  const eventType = eventTypes.find((t) => t.name === e.tipo)
  return {
    title: e.titulo,
    event_type_id: eventType?.id || 1,
    event_date: e.fecha,
    priority: e.prioridad || "medium",
    status: e.estado || "scheduled",
    description: e.descripcion || null,
  }
}

const columns = [
  { key: "titulo", label: "Título", render: (item: Evento) => <span className="font-medium">{item.titulo}</span> },
  { key: "tipo", label: "Tipo", render: (item: Evento) => <StatusBadge status={item.tipo} variant="info" /> },
  { key: "fecha", label: "Fecha", render: (item: Evento) => new Date(item.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) },
]

const defaultEvento: Partial<Evento> = {
  titulo: "",
  tipo: "Control",
  fecha: new Date().toISOString().split("T")[0],
  prioridad: "medium",
  estado: "scheduled",
  descripcion: "",
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentEvento, setCurrentEvento] = useState<Partial<Evento> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadEventos = useCallback(async () => {
    try {
      setLoading(true)
      const [eventsData, typesData] = await Promise.all([
        eventService.list(),
        eventTypeService.list(),
      ])
      const typeList = unwrapList<EventType>(typesData)
      setEventTypes(typeList)
      setEventos(unwrapList<Event>(eventsData).map((e) => toEvento(e, typeList)))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los eventos.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadEventos()
  }, [loadEventos])

  const handleCreate = () => {
    setCurrentEvento({ ...defaultEvento })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (evento: Evento) => {
    setCurrentEvento({ ...evento })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (evento: Evento) => {
    setCurrentEvento(evento)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentEvento?.id) {
      try {
        await eventService.delete(currentEvento.id)
        toast({ title: "Evento eliminado", description: "El evento ha sido eliminado." })
        await loadEventos()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el evento.", variant: "destructive" })
      }
    }
  }, [currentEvento, loadEventos, toast])

  const handleSave = async () => {
    if (!currentEvento?.titulo) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }

    try {
      if (isEditing && currentEvento.id) {
        await eventService.update(currentEvento.id, toEventPayload(currentEvento, eventTypes) as any)
        toast({ title: "Evento actualizado", description: "El evento ha sido actualizado." })
      } else {
        await eventService.create(toEventPayload(currentEvento, eventTypes) as any)
        toast({ title: "Evento creado", description: "El nuevo evento ha sido creado." })
      }
      setDialogOpen(false)
      await loadEventos()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el evento.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Evento, value: string) => {
    setCurrentEvento((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando eventos...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calendario de Eventos</h1>

        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>

        <DataTable data={eventos} columns={columns} searchPlaceholder="Buscar evento..." searchKeys={["titulo", "tipo"]}
          actions={(item) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Evento" : "Nuevo Evento"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={currentEvento?.titulo || ""} onChange={(e) => updateField("titulo", e.target.value)} placeholder="Título del evento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={currentEvento?.tipo || ""} onValueChange={(v) => updateField("tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sanidad">Sanidad</SelectItem>
                      <SelectItem value="Control">Control</SelectItem>
                      <SelectItem value="Reproducción">Reproducción</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={currentEvento?.fecha || ""} onChange={(e) => updateField("fecha", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Eliminar Evento" description="¿Está seguro?" confirmLabel="Eliminar" onConfirm={confirmDelete} />
      </div>
    </AppLayout>
  )
}
