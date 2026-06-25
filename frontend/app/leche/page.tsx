"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SearchableSelect } from "@/components/searchable-select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Plus, Download, ClipboardList } from "lucide-react"
import { milkRecordService, type MilkRecord } from "@/lib/services/milk-records"
import { animalService, type Animal } from "@/lib/services/animals"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface RegistroLeche {
  id: number
  animalId: number
  fecha: string
  jornada: "Mañana" | "Tarde"
  cantidad: number
  temperatura: number
  mastitis: boolean
  animalCodigo?: string
  animalNombre?: string
  animalEstado?: string
}

interface DiarioRow {
  id: number
  animal: Animal
  registrado: boolean
  registro?: RegistroLeche
}

const today = () => new Date().toISOString().split("T")[0]

const sessionToLabel = (session: string): "Mañana" | "Tarde" => session === "afternoon" ? "Tarde" : "Mañana"
const labelToSession = (label?: string) => label === "Tarde" ? "afternoon" : "morning"

const toRegistroLeche = (record: MilkRecord): RegistroLeche => ({
  id: record.id,
  animalId: record.animal_id,
  fecha: record.record_date,
  jornada: sessionToLabel(record.milking_session),
  cantidad: Number(record.quantity_liters ?? 0),
  temperatura: Number(record.temperature ?? 0),
  mastitis: record.mastitis_check ?? false,
  animalCodigo: record.animal?.internal_code,
  animalNombre: record.animal?.name,
  animalEstado: record.animal?.status?.name,
})

const toMilkRecordPayload = (r: Partial<RegistroLeche>) => ({
  animal_id: r.animalId,
  record_date: r.fecha,
  milking_session: labelToSession(r.jornada),
  quantity_liters: r.cantidad,
  temperature: r.temperatura,
  mastitis_check: r.mastitis,
})

const columns = [
  {
    key: "animalCodigo",
    label: "Animal",
    render: (item: RegistroLeche) => (
      <div>
        <p className="font-medium text-primary">{item.animalCodigo || `#${item.animalId}`}</p>
        <p className="text-xs text-muted-foreground">{item.animalNombre || "Sin nombre"}</p>
      </div>
    ),
  },
  { key: "fecha", label: "Fecha", render: (item: RegistroLeche) => item.fecha?.split("T")[0] },
  { key: "jornada", label: "Jornada", render: (item: RegistroLeche) => <StatusBadge status={item.jornada} variant="info" /> },
  { key: "cantidad", label: "Cantidad (L)", render: (item: RegistroLeche) => <span className="font-semibold">{Number(item.cantidad || 0).toFixed(2)}</span> },
  { key: "temperatura", label: "Temp. (°C)", render: (item: RegistroLeche) => Number(item.temperatura || 0).toFixed(2) },
  { key: "mastitis", label: "Mastitis", render: (item: RegistroLeche) => <StatusBadge status={item.mastitis ? "Sí" : "No"} /> },
]

const defaultRegistro: Partial<RegistroLeche> = {
  animalId: 0,
  fecha: today(),
  jornada: "Mañana",
  cantidad: 0,
  temperatura: 36.5,
  mastitis: false,
}

const exportTableToExcel = (title: string, headers: string[], rows: (string | number | boolean)[][]) => {
  const safe = (value: string | number | boolean) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
  const html = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif}th{background:#0f766e;color:#fff;padding:10px;border:1px solid #115e59}td{padding:8px;border:1px solid #99f6e4}tr:nth-child(even){background:#f0fdfa}.title{background:#ccfbf1;color:#134e4a;font-size:20px;font-weight:bold}</style></head><body><table><tr><td class="title" colspan="${headers.length}">${safe(title)}</td></tr><tr>${headers.map((h) => `<th>${safe(h)}</th>`).join("")}</tr>${rows.map((row) => `<tr>${row.map((cell) => `<td>${safe(cell)}</td>`).join("")}</tr>`).join("")}</table></body></html>`
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${today()}.xls`
  link.click()
  URL.revokeObjectURL(url)
}

export default function LechePage() {
  const [registros, setRegistros] = useState<RegistroLeche[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Partial<RegistroLeche> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [dailyDate, setDailyDate] = useState(today())
  const [dailySession, setDailySession] = useState<"Mañana" | "Tarde">("Mañana")
  const [dailyFilters, setDailyFilters] = useState({ search: "", breed: "all", category: "all", status: "all" })
  const [generalFilters, setGeneralFilters] = useState({ date: "", dateFrom: "", dateTo: "", animal: "all", code: "", session: "all", litersMin: "", litersMax: "", status: "all" })
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recordsData, animalsData] = await Promise.all([
        milkRecordService.list({ per_page: "1000" }),
        animalService.list({ per_page: "1000" }),
      ])
      const loadedAnimals = unwrapList<Animal>(animalsData)
      setAnimals(loadedAnimals)
      const mapped = unwrapList<MilkRecord>(recordsData).map(toRegistroLeche)
      const withAnimalInfo = mapped.map((r) => {
        const animal = loadedAnimals.find((a) => a.id === r.animalId)
        return { ...r, animalCodigo: r.animalCodigo || animal?.internal_code, animalNombre: r.animalNombre || animal?.name || undefined, animalEstado: r.animalEstado || animal?.status?.name }
      })
      setRegistros(withAnimalInfo)
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los registros.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  const activeFemaleAnimals = useMemo(() => animals.filter((animal) => {
    const statusName = animal.status?.name?.toLowerCase() || "activo"
    return animal.sex === "female" && animal.active !== false && statusName.includes("activo")
  }), [animals])

  const animalOptions = activeFemaleAnimals.map((a) => ({ value: String(a.id), label: `${a.internal_code} - ${a.name || "Sin nombre"}` }))
  const breeds = Array.from(new Map(activeFemaleAnimals.map((a) => [a.breed?.name || "Sin raza", a.breed?.name || "Sin raza"])).values())
  const categories = Array.from(new Map(activeFemaleAnimals.map((a) => [a.category?.name || "Sin categoría", a.category?.name || "Sin categoría"])).values())
  const statuses = Array.from(new Map(animals.map((a) => [a.status?.name || "Activo", a.status?.name || "Activo"])).values())

  const filteredRegistros = useMemo(() => registros.filter((record) => {
    const recordDate = record.fecha?.split("T")[0]
    const amount = Number(record.cantidad || 0)
    return (!generalFilters.date || recordDate === generalFilters.date)
      && (!generalFilters.dateFrom || recordDate >= generalFilters.dateFrom)
      && (!generalFilters.dateTo || recordDate <= generalFilters.dateTo)
      && (generalFilters.animal === "all" || String(record.animalId) === generalFilters.animal)
      && (!generalFilters.code || String(record.animalCodigo || "").toLowerCase().includes(generalFilters.code.toLowerCase()))
      && (generalFilters.session === "all" || record.jornada === generalFilters.session)
      && (!generalFilters.litersMin || amount >= Number(generalFilters.litersMin))
      && (!generalFilters.litersMax || amount <= Number(generalFilters.litersMax))
      && (generalFilters.status === "all" || record.animalEstado === generalFilters.status)
  }), [registros, generalFilters])

  const dailyRows = useMemo<DiarioRow[]>(() => activeFemaleAnimals.map((animal) => {
    const registro = registros.find((record) => record.animalId === animal.id && record.fecha?.split("T")[0] === dailyDate && record.jornada === dailySession)
    return { id: animal.id, animal, registrado: Boolean(registro), registro }
  }).filter((row) => {
    const text = dailyFilters.search.trim().toLowerCase()
    const controlStatus = row.registrado ? "registrado" : "pendiente"
    return (!text || [row.animal.internal_code, row.animal.name, row.animal.breed?.name, row.animal.category?.name].some((value) => String(value || "").toLowerCase().includes(text)))
      && (dailyFilters.breed === "all" || (row.animal.breed?.name || "Sin raza") === dailyFilters.breed)
      && (dailyFilters.category === "all" || (row.animal.category?.name || "Sin categoría") === dailyFilters.category)
      && (dailyFilters.status === "all" || controlStatus === dailyFilters.status)
  }), [activeFemaleAnimals, registros, dailyDate, dailySession, dailyFilters])

  const stats = useMemo(() => {
    const todayRecords = registros.filter((r) => r.fecha?.split("T")[0] === today())
    const produccionHoy = todayRecords.reduce((acc, r) => acc + Number(r.cantidad || 0), 0)
    const animalesOrdenio = new Set(todayRecords.map((r) => r.animalId)).size
    const promedio = animalesOrdenio > 0 ? produccionHoy / animalesOrdenio : 0
    return { produccionHoy, animalesOrdenio, promedio: Number.isFinite(promedio) ? promedio : 0 }
  }, [registros])

  const handleCreate = (animal?: Animal) => {
    setCurrentRegistro({ ...defaultRegistro, animalId: animal?.id || 0, fecha: dailyDate, jornada: dailySession })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (registro: RegistroLeche) => {
    setCurrentRegistro({ ...registro })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (registro: RegistroLeche) => {
    setCurrentRegistro(registro)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (!currentRegistro?.id) return
    try {
      await milkRecordService.delete(currentRegistro.id)
      toast({ title: "Registro eliminado", description: "El registro ha sido eliminado correctamente." })
      await loadData()
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" })
    }
  }, [currentRegistro, loadData, toast])

  const handleSave = async () => {
    if (!currentRegistro?.animalId || currentRegistro.cantidad === undefined || Number(currentRegistro.cantidad) < 0) {
      toast({ title: "Error", description: "Seleccione el animal e ingrese una cantidad válida.", variant: "destructive" })
      return
    }

    const duplicate = registros.find((record) => record.animalId === currentRegistro.animalId
      && record.fecha?.split("T")[0] === currentRegistro.fecha
      && record.jornada === currentRegistro.jornada
      && record.id !== currentRegistro.id)

    if (duplicate) {
      toast({ title: "Control duplicado", description: "Este animal ya tiene control registrado para la fecha y jornada seleccionadas.", variant: "destructive" })
      return
    }

    try {
      if (isEditing && currentRegistro.id) {
        await milkRecordService.update(currentRegistro.id, toMilkRecordPayload(currentRegistro))
        toast({ title: "Registro actualizado", description: "El registro ha sido actualizado correctamente." })
      } else {
        await milkRecordService.create(toMilkRecordPayload(currentRegistro))
        toast({ title: "Registro creado", description: "El nuevo registro ha sido creado correctamente." })
      }
      setDialogOpen(false)
      await loadData()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el registro. Verifique que no exista un control duplicado.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof RegistroLeche, value: string | number | boolean) => {
    setCurrentRegistro((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const exportGeneral = () => exportTableToExcel("Reporte General Leche", ["Fecha", "Jornada", "Código", "Animal", "Estado", "Litros", "Temperatura", "Mastitis"], filteredRegistros.map((r) => [r.fecha?.split("T")[0], r.jornada, r.animalCodigo || "", r.animalNombre || "", r.animalEstado || "", Number(r.cantidad || 0).toFixed(2), Number(r.temperatura || 0).toFixed(2), r.mastitis ? "Sí" : "No"]))
  const exportDiario = () => exportTableToExcel("Reporte Diario Leche", ["Fecha", "Jornada", "Código", "Animal", "Raza", "Categoría", "Estado control", "Litros"], dailyRows.map((r) => [dailyDate, dailySession, r.animal.internal_code, r.animal.name || "", r.animal.breed?.name || "", r.animal.category?.name || "", r.registrado ? "Registrado" : "Pendiente", r.registro?.cantidad ? Number(r.registro.cantidad).toFixed(2) : ""]))

  if (loading) {
    return <AppLayout><div className="flex h-48 items-center justify-center"><p className="text-muted-foreground">Cargando registros...</p></div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control de Leche</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Producción Hoy</p><p className="text-3xl font-bold text-primary">{stats.produccionHoy.toFixed(1)} L</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Animales en Ordeño</p><p className="text-3xl font-bold">{stats.animalesOrdenio}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Promedio Actual</p><p className="text-3xl font-bold">{stats.promedio > 0 ? `${stats.promedio.toFixed(1)} L` : "0 L"}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="diario" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="diario">Diario</TabsTrigger><TabsTrigger value="general">General</TabsTrigger></TabsList>

          <TabsContent value="diario" className="space-y-4">
            <div className="space-y-4 rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid flex-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  <div><Label>Fecha</Label><Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} /></div>
                  <div><Label>Jornada</Label><Select value={dailySession} onValueChange={(value) => setDailySession(value as "Mañana" | "Tarde")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Mañana">Mañana</SelectItem><SelectItem value="Tarde">Tarde</SelectItem></SelectContent></Select></div>
                  <div><Label>Buscar</Label><Input placeholder="Animal, código..." value={dailyFilters.search} onChange={(e) => setDailyFilters((prev) => ({ ...prev, search: e.target.value }))} /></div>
                  <div><Label>Raza</Label><Select value={dailyFilters.breed} onValueChange={(value) => setDailyFilters((prev) => ({ ...prev, breed: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{breeds.map((breed) => <SelectItem key={breed} value={breed}>{breed}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Categoría</Label><Select value={dailyFilters.category} onValueChange={(value) => setDailyFilters((prev) => ({ ...prev, category: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Estado control</Label><Select value={dailyFilters.status} onValueChange={(value) => setDailyFilters((prev) => ({ ...prev, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pendiente">Pendiente</SelectItem><SelectItem value="registrado">Registrado</SelectItem></SelectContent></Select></div>
                </div>
                <Button variant="outline" className="gap-2" onClick={exportDiario}><Download className="h-4 w-4" /> Exportar Diario</Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b p-3 text-sm font-semibold text-muted-foreground">
                <span>Animal</span><span>Estado</span><span>Acción</span>
              </div>
              {dailyRows.length === 0 ? <p className="p-6 text-center text-muted-foreground">No hay animales disponibles para los filtros seleccionados.</p> : dailyRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b p-3 last:border-b-0">
                  <div><p className="font-medium text-primary">{row.animal.internal_code} - {row.animal.name || "Sin nombre"}</p><p className="text-xs text-muted-foreground">{row.animal.breed?.name || "Sin raza"} · {row.animal.category?.name || "Sin categoría"}</p></div>
                  <StatusBadge status={row.registrado ? "Registrado" : "Pendiente"} variant={row.registrado ? "success" : "warning"} />
                  <Button size="sm" className="gap-2" variant={row.registrado ? "outline" : "default"} disabled={row.registrado} onClick={() => handleCreate(row.animal)}><ClipboardList className="h-4 w-4" /> Registrar control</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4 rounded-lg border bg-card p-4">
              <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                <div><Label>Fecha</Label><Input type="date" value={generalFilters.date} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, date: e.target.value }))} /></div>
                <div><Label>Desde</Label><Input type="date" value={generalFilters.dateFrom} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} /></div>
                <div><Label>Hasta</Label><Input type="date" value={generalFilters.dateTo} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, dateTo: e.target.value }))} /></div>
                <div><Label>Animal</Label><Select value={generalFilters.animal} onValueChange={(value) => setGeneralFilters((prev) => ({ ...prev, animal: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{animalOptions.map((animal) => <SelectItem key={animal.value} value={animal.value}>{animal.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Código</Label><Input value={generalFilters.code} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, code: e.target.value }))} /></div>
                <div><Label>Jornada</Label><Select value={generalFilters.session} onValueChange={(value) => setGeneralFilters((prev) => ({ ...prev, session: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="Mañana">Mañana</SelectItem><SelectItem value="Tarde">Tarde</SelectItem></SelectContent></Select></div>
                <div><Label>Litros mín.</Label><Input type="number" value={generalFilters.litersMin} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, litersMin: e.target.value }))} /></div>
                <div><Label>Litros máx.</Label><Input type="number" value={generalFilters.litersMax} onChange={(e) => setGeneralFilters((prev) => ({ ...prev, litersMax: e.target.value }))} /></div>
              </div>
              <div className="flex justify-between gap-3"><Select value={generalFilters.status} onValueChange={(value) => setGeneralFilters((prev) => ({ ...prev, status: value }))}><SelectTrigger className="max-w-xs"><SelectValue placeholder="Estado animal" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={exportGeneral}><Download className="h-4 w-4" /> Exportar General</Button><Button onClick={() => handleCreate()} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Registro</Button></div></div>
            </div>

            <DataTable data={filteredRegistros} columns={columns} searchPlaceholder="Buscar animal..." searchKeys={["animalCodigo", "animalNombre"]} actions={(item) => (<><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button></>)} emptyMessage="No hay registros de producción" />
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Registro" : "Nuevo Registro de Leche"}</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2"><Label htmlFor="animalId">Animal *</Label><SearchableSelect options={animalOptions} value={currentRegistro?.animalId ? String(currentRegistro.animalId) : ""} onValueChange={(value) => updateField("animalId", Number(value))} placeholder="Buscar animal..." searchPlaceholder="Escriba para buscar..." emptyMessage="No se encontró el animal." /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="fecha">Fecha</Label><Input id="fecha" type="date" value={currentRegistro?.fecha?.split("T")[0] || ""} onChange={(e) => updateField("fecha", e.target.value)} className="h-11" /></div><div className="space-y-2"><Label htmlFor="jornada">Jornada</Label><Select value={currentRegistro?.jornada || ""} onValueChange={(value) => updateField("jornada", value)}><SelectTrigger className="h-11"><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="Mañana">Mañana</SelectItem><SelectItem value="Tarde">Tarde</SelectItem></SelectContent></Select></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="cantidad">Cantidad (L) *</Label><Input id="cantidad" type="number" step="0.1" placeholder="0.0" value={currentRegistro?.cantidad ?? ""} onChange={(e) => updateField("cantidad", Number(e.target.value))} className="h-11" /></div><div className="space-y-2"><Label htmlFor="temperatura">Temperatura (°C)</Label><Input id="temperatura" type="number" step="0.1" placeholder="36.5" value={currentRegistro?.temperatura ?? ""} onChange={(e) => updateField("temperatura", Number(e.target.value))} className="h-11" /></div></div>
              <div className="space-y-2"><Label htmlFor="mastitis">Mastitis</Label><Select value={currentRegistro?.mastitis ? "true" : "false"} onValueChange={(value) => updateField("mastitis", value === "true")}><SelectTrigger className="h-11"><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Sí</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">Cancelar</Button><Button onClick={handleSave} className="h-11 px-6">{isEditing ? "Guardar Cambios" : "Guardar Registro"}</Button></div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Eliminar Registro" description="¿Está seguro que desea eliminar este registro de producción? Esta acción no se puede deshacer." confirmLabel="Eliminar" onConfirm={confirmDelete} />
      </div>
    </AppLayout>
  )
}
