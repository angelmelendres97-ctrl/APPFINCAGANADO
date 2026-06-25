"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SearchableSelect } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Plus, Heart, Baby, ArrowRightCircle } from "lucide-react"
import { reproductiveRecordService, reproductiveTypeService, type ReproductiveRecord, type ReproductiveType } from "@/lib/services/reproductive-records"
import { animalService, type Animal } from "@/lib/services/animals"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface Reproduccion {
  id: number
  animalId: number
  machoId?: number | null
  tipo: string
  fecha: string
  estado: string
  responsable: string
  semen: string
  partoEstimado: string
  crias: number
  observaciones: string
  animalInfo?: string
  animalCodigo?: string
  resultado?: string | null
}

const resultLabels: Record<string, string> = {
  pending: "Inseminación o Monta",
  positive: "Gestación",
  negative: "Fallido",
  completed: "Finalizado",
  unknown: "Pendiente",
}

const toReproduccion = (record: ReproductiveRecord): Reproduccion => ({
  id: record.id,
  animalId: record.animal_id,
  machoId: record.related_male_animal_id,
  tipo: record.reproductive_type?.name || "Insemination",
  fecha: record.event_date,
  estado: resultLabels[record.result || "pending"] || "Pendiente",
  responsable: record.technician_name || "",
  semen: record.semen_code || "",
  partoEstimado: record.expected_delivery_date || "",
  crias: record.offspring_count || 0,
  observaciones: record.observations || "",
  animalInfo: record.animal ? `${record.animal.internal_code} - ${record.animal.name || "Sin nombre"}` : `#${record.animal_id}`,
  animalCodigo: record.animal?.internal_code,
  resultado: record.result || "pending",
})

const toPayload = (r: Partial<Reproduccion>, reproTypes: ReproductiveType[]) => ({
  animal_id: r.animalId,
  reproductive_type_id: reproTypes.find((type) => type.name === r.tipo)?.id || reproTypes[0]?.id,
  event_date: r.fecha,
  related_male_animal_id: r.tipo === "Mating" ? r.machoId || null : null,
  semen_code: r.tipo === "Insemination" ? r.semen || null : null,
  technician_name: r.responsable || null,
  expected_delivery_date: r.partoEstimado || null,
  result: r.resultado || "pending",
  offspring_count: r.crias || 0,
  observations: r.observaciones || null,
})

const defaultRegistro: Partial<Reproduccion> = {
  animalId: 0,
  machoId: null,
  tipo: "Insemination",
  fecha: new Date().toISOString().split("T")[0],
  estado: "Inseminación o Monta",
  resultado: "pending",
  responsable: "",
  semen: "",
  partoEstimado: "",
  crias: 0,
  observaciones: "",
}

const columns = [
  { key: "animalInfo", label: "Animal", render: (item: Reproduccion) => <span className="font-medium text-primary">{item.animalInfo}</span> },
  { key: "fecha", label: "Fecha" },
  { key: "tipo", label: "Tipo", render: (item: Reproduccion) => <StatusBadge status={item.tipo === "Mating" ? "Monta natural" : "Inseminación artificial"} variant="info" /> },
  { key: "estado", label: "Estado", render: (item: Reproduccion) => <StatusBadge status={item.estado} /> },
  { key: "responsable", label: "Responsable" },
  { key: "observaciones", label: "Observaciones" },
]

export default function ReproduccionPage() {
  const [registros, setRegistros] = useState<Reproduccion[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [reproTypes, setReproTypes] = useState<ReproductiveType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Partial<Reproduccion> | null>(null)
  const [transitionResult, setTransitionResult] = useState("")
  const [filters, setFilters] = useState({ search: "", animal: "all", code: "", type: "all", state: "all", date: "", dateFrom: "", dateTo: "", responsible: "", result: "all" })
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recordsData, animalsData, typesData] = await Promise.all([
        reproductiveRecordService.list({ per_page: "1000" }),
        animalService.list({ per_page: "1000" }),
        reproductiveTypeService.list(),
      ])
      setReproTypes(unwrapList<ReproductiveType>(typesData))
      setAnimals(unwrapList<Animal>(animalsData))
      setRegistros(unwrapList<ReproductiveRecord>(recordsData).map(toReproduccion))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los registros.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  const hembras = animals.filter((animal) => animal.sex === "female")
  const machos = animals.filter((animal) => animal.sex === "male")
  const femaleOptions = hembras.map((animal) => ({ value: String(animal.id), label: `${animal.internal_code} - ${animal.name || "Sin nombre"}` }))
  const maleOptions = machos.map((animal) => ({ value: String(animal.id), label: `${animal.internal_code} - ${animal.name || "Sin nombre"}` }))
  const typeOptions = reproTypes.map((type) => ({ value: type.name, label: type.name === "Mating" ? "Monta natural" : type.name === "Insemination" ? "Inseminación artificial" : type.name }))

  const filteredRegistros = useMemo(() => registros.filter((record) => {
    const text = filters.search.toLowerCase()
    return (!text || [record.animalInfo, record.observaciones, record.responsable].some((value) => String(value || "").toLowerCase().includes(text)))
      && (filters.animal === "all" || String(record.animalId) === filters.animal)
      && (!filters.code || String(record.animalCodigo || "").toLowerCase().includes(filters.code.toLowerCase()))
      && (filters.type === "all" || record.tipo === filters.type)
      && (filters.state === "all" || record.estado === filters.state)
      && (!filters.date || record.fecha === filters.date)
      && (!filters.dateFrom || record.fecha >= filters.dateFrom)
      && (!filters.dateTo || record.fecha <= filters.dateTo)
      && (!filters.responsible || record.responsable.toLowerCase().includes(filters.responsible.toLowerCase()))
      && (filters.result === "all" || record.resultado === filters.result)
  }), [registros, filters])

  const stats = useMemo(() => ({
    gestaciones: registros.filter((r) => r.resultado === "positive").length,
    partos: registros.filter((r) => r.resultado === "completed" && r.crias > 0).length,
    pendientes: registros.filter((r) => r.resultado === "pending").length,
  }), [registros])

  const handleCreate = () => { setCurrentRegistro({ ...defaultRegistro }); setIsEditing(false); setDialogOpen(true) }
  const handleEdit = (registro: Reproduccion) => { setCurrentRegistro({ ...registro }); setIsEditing(true); setDialogOpen(true) }
  const handleDelete = (registro: Reproduccion) => { setCurrentRegistro(registro); setDeleteDialogOpen(true) }

  const handleTransition = (registro: Reproduccion) => {
    setCurrentRegistro(registro)
    const next = registro.resultado === "positive" ? "completed" : registro.resultado === "negative" ? "completed" : "positive"
    setTransitionResult(next)
    setTransitionDialogOpen(true)
  }

  const saveTransition = async () => {
    if (!currentRegistro?.id || !transitionResult) return
    try {
      await reproductiveRecordService.transition(currentRegistro.id, { result: transitionResult, observations: currentRegistro.observaciones, offspring_count: currentRegistro.crias })
      toast({ title: "Estado actualizado", description: "El flujo reproductivo se actualizó correctamente." })
      setTransitionDialogOpen(false)
      await loadData()
    } catch {
      toast({ title: "Error", description: "La transición seleccionada no es válida.", variant: "destructive" })
    }
  }

  const confirmDelete = useCallback(async () => {
    if (!currentRegistro?.id) return
    try { await reproductiveRecordService.delete(currentRegistro.id); toast({ title: "Registro eliminado", description: "El registro ha sido eliminado." }); await loadData() }
    catch { toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" }) }
  }, [currentRegistro, loadData, toast])

  const handleSave = async () => {
    if (!currentRegistro?.animalId || !currentRegistro?.tipo) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }
    try {
      if (isEditing && currentRegistro.id) {
        await reproductiveRecordService.update(currentRegistro.id, toPayload(currentRegistro, reproTypes))
      } else {
        await reproductiveRecordService.create(toPayload(currentRegistro, reproTypes))
      }
      toast({ title: "Registro guardado", description: "La información reproductiva se guardó correctamente." })
      setDialogOpen(false)
      await loadData()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Reproduccion, value: string | number | null) => setCurrentRegistro((prev) => (prev ? { ...prev, [field]: value } : prev))

  if (loading) return <AppLayout><div className="flex h-48 items-center justify-center"><p className="text-muted-foreground">Cargando registros...</p></div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control de Reproducción</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="flex items-center gap-4 p-4"><div className="rounded-full bg-pink-100 p-3 text-pink-600"><Heart className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Gestaciones Activas</p><p className="text-2xl font-bold">{stats.gestaciones}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4"><div className="rounded-full bg-green-100 p-3 text-green-600"><Baby className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Partos / Finalizados</p><p className="text-2xl font-bold">{stats.partos}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4"><div className="rounded-full bg-amber-100 p-3 text-amber-600"><Heart className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Pendientes</p><p className="text-2xl font-bold">{stats.pendientes}</p></div></CardContent></Card>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <Input placeholder="Buscar registros..." value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
            <SearchableSelect options={[{ value: "all", label: "Todos los animales" }, ...femaleOptions]} value={filters.animal} onValueChange={(value) => setFilters((prev) => ({ ...prev, animal: value }))} placeholder="Animal" searchPlaceholder="Buscar animal..." emptyMessage="Sin animales" />
            <Input placeholder="Código animal" value={filters.code} onChange={(e) => setFilters((prev) => ({ ...prev, code: e.target.value }))} />
            <SearchableSelect options={[{ value: "all", label: "Todos los tipos" }, ...typeOptions]} value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))} placeholder="Tipo" searchPlaceholder="Buscar tipo..." emptyMessage="Sin tipos" />
            <SearchableSelect options={[{ value: "all", label: "Todos los estados" }, ...Object.values(resultLabels).map((label) => ({ value: label, label }))]} value={filters.state} onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value }))} placeholder="Estado" searchPlaceholder="Buscar estado..." emptyMessage="Sin estados" />
            <Input type="date" value={filters.date} onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))} />
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} />
            <Input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} />
            <Input placeholder="Responsable" value={filters.responsible} onChange={(e) => setFilters((prev) => ({ ...prev, responsible: e.target.value }))} />
            <SearchableSelect options={[{ value: "all", label: "Todos los resultados" }, { value: "pending", label: "Pendiente" }, { value: "positive", label: "Gestación" }, { value: "negative", label: "Fallido" }, { value: "completed", label: "Finalizado" }]} value={filters.result} onValueChange={(value) => setFilters((prev) => ({ ...prev, result: value }))} placeholder="Resultado" searchPlaceholder="Buscar resultado..." emptyMessage="Sin resultados" />
          </div>
          <div className="flex justify-end"><Button onClick={handleCreate} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Registro</Button></div>
        </div>

        <DataTable data={filteredRegistros} columns={columns} searchPlaceholder="Buscar..." searchKeys={["observaciones", "responsable", "animalInfo"]} actions={(item) => (<><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTransition(item)}><ArrowRightCircle className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button></>)} />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Registro" : "Nuevo Registro"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Animal hembra *</Label><SearchableSelect options={femaleOptions} value={currentRegistro?.animalId ? String(currentRegistro.animalId) : ""} onValueChange={(v) => updateField("animalId", Number(v))} placeholder="Seleccionar hembra..." searchPlaceholder="Buscar animal..." emptyMessage="No se encontró el animal." /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tipo *</Label><SearchableSelect options={typeOptions} value={currentRegistro?.tipo || ""} onValueChange={(v) => updateField("tipo", v)} placeholder="Tipo..." searchPlaceholder="Buscar tipo..." emptyMessage="Sin tipos" /></div><div className="space-y-2"><Label>Fecha</Label><Input type="date" value={currentRegistro?.fecha || ""} onChange={(e) => updateField("fecha", e.target.value)} /></div></div>
              {currentRegistro?.tipo === "Mating" && <div className="space-y-2"><Label>Toro / macho</Label><SearchableSelect options={maleOptions} value={currentRegistro?.machoId ? String(currentRegistro.machoId) : ""} onValueChange={(v) => updateField("machoId", Number(v))} placeholder="Seleccionar macho..." searchPlaceholder="Buscar macho..." emptyMessage="No se encontró el macho." /></div>}
              {currentRegistro?.tipo === "Insemination" && <div className="space-y-2"><Label>Código de semen / pajilla</Label><Input value={currentRegistro?.semen || ""} onChange={(e) => updateField("semen", e.target.value)} /></div>}
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Responsable</Label><Input value={currentRegistro?.responsable || ""} onChange={(e) => updateField("responsable", e.target.value)} /></div><div className="space-y-2"><Label>Parto estimado</Label><Input type="date" value={currentRegistro?.partoEstimado || ""} onChange={(e) => updateField("partoEstimado", e.target.value)} /></div></div>
              <div className="space-y-2"><Label>Observaciones</Label><Textarea value={currentRegistro?.observaciones || ""} onChange={(e) => updateField("observaciones", e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></div>
          </DialogContent>
        </Dialog>

        <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
          <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Cambiar estado reproductivo</DialogTitle></DialogHeader><div className="space-y-4 py-2"><SearchableSelect options={[{ value: "positive", label: "Gestación" }, { value: "negative", label: "Fallido" }, { value: "completed", label: "Finalizado / Parto" }]} value={transitionResult} onValueChange={setTransitionResult} placeholder="Nuevo estado" searchPlaceholder="Buscar estado..." emptyMessage="Sin estados" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTransitionDialogOpen(false)}>Cancelar</Button><Button onClick={saveTransition}>Guardar estado</Button></div></div></DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Eliminar Registro" description="¿Está seguro que desea eliminar este registro?" confirmLabel="Eliminar" onConfirm={confirmDelete} />
      </div>
    </AppLayout>
  )
}
