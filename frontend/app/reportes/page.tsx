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
import { Pencil, Trash2, Plus, Receipt, TrendingDown } from "lucide-react"
import { expenseService, type Expense } from "@/lib/services/expenses"
import { useToast } from "@/hooks/use-toast"

interface Gasto {
  id: number
  fecha: string
  categoria: string
  descripcion: string
  monto: number
  responsable: string
  observaciones: string
}

const toGasto = (expense: Expense): Gasto => ({
  id: expense.id,
  fecha: expense.expense_date,
  categoria: expense.category,
  descripcion: expense.description,
  monto: expense.amount,
  responsable: expense.responsible || "",
  observaciones: expense.observations || "",
})

const toExpensePayload = (g: Partial<Gasto>) => ({
  category: g.categoria,
  description: g.descripcion,
  amount: g.monto,
  responsible: g.responsable || null,
  observations: g.observaciones || null,
  expense_date: g.fecha,
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "categoria", label: "Categoría", render: (item: Gasto) => <StatusBadge status={item.categoria} variant="info" /> },
  { key: "descripcion", label: "Descripción", render: (item: Gasto) => <span className="font-medium">{item.descripcion}</span> },
  { key: "monto", label: "Monto", render: (item: Gasto) => <span className="font-semibold text-destructive">{formatCurrency(item.monto)}</span> },
  { key: "responsable", label: "Responsable" },
]

const defaultGasto: Partial<Gasto> = {
  fecha: new Date().toISOString().split("T")[0],
  categoria: "Alimentación",
  descripcion: "",
  monto: 0,
  responsable: "",
  observaciones: "",
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentGasto, setCurrentGasto] = useState<Partial<Gasto> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadGastos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await expenseService.list()
      setGastos((data as Expense[]).map(toGasto))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los gastos.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadGastos()
  }, [loadGastos])

  const stats = useMemo(() => {
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0)
    const alimentacion = gastos.filter((g) => g.categoria === "Alimentación").reduce((acc, g) => acc + g.monto, 0)
    const medicamentos = gastos.filter((g) => g.categoria === "Medicamentos").reduce((acc, g) => acc + g.monto, 0)
    return { totalGastos, alimentacion, medicamentos }
  }, [gastos])

  const handleCreate = () => {
    setCurrentGasto({ ...defaultGasto })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (gasto: Gasto) => {
    setCurrentGasto({ ...gasto })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (gasto: Gasto) => {
    setCurrentGasto(gasto)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentGasto?.id) {
      try {
        await expenseService.delete(currentGasto.id)
        toast({ title: "Gasto eliminado", description: "El registro ha sido eliminado." })
        await loadGastos()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el gasto.", variant: "destructive" })
      }
    }
  }, [currentGasto, loadGastos, toast])

  const handleSave = async () => {
    if (!currentGasto?.descripcion || !currentGasto?.monto) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }

    try {
      if (isEditing && currentGasto.id) {
        await expenseService.update(currentGasto.id, toExpensePayload(currentGasto))
        toast({ title: "Gasto actualizado", description: "El registro ha sido actualizado." })
      } else {
        await expenseService.create(toExpensePayload(currentGasto))
        toast({ title: "Gasto creado", description: "El nuevo registro ha sido creado." })
      }
      setDialogOpen(false)
      await loadGastos()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el gasto.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Gasto, value: string | number) => {
    setCurrentGasto((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando gastos...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control de Gastos</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gastos</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalGastos)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alimentación</p>
                <p className="text-xl font-bold">{formatCurrency(stats.alimentacion)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medicamentos</p>
                <p className="text-xl font-bold">{formatCurrency(stats.medicamentos)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Gasto
          </Button>
        </div>

        <DataTable data={gastos} columns={columns} searchPlaceholder="Buscar..." searchKeys={["descripcion", "responsable"]}
          actions={(item) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={currentGasto?.fecha || ""} onChange={(e) => updateField("fecha", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={currentGasto?.categoria || ""} onValueChange={(v) => updateField("categoria", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alimentación">Alimentación</SelectItem>
                      <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="Mano de Obra">Mano de Obra</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Input value={currentGasto?.descripcion || ""} onChange={(e) => updateField("descripcion", e.target.value)} placeholder="Descripción del gasto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto *</Label>
                  <Input type="number" value={currentGasto?.monto || ""} onChange={(e) => updateField("monto", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Responsable</Label>
                  <Input value={currentGasto?.responsable || ""} onChange={(e) => updateField("responsable", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={currentGasto?.observaciones || ""} onChange={(e) => updateField("observaciones", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Eliminar Gasto" description="¿Está seguro?" confirmLabel="Eliminar" onConfirm={confirmDelete} />
      </div>
    </AppLayout>
  )
}
