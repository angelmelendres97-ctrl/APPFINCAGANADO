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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, DollarSign, TrendingUp, ShoppingCart } from "lucide-react"
import { saleService, type Sale } from "@/lib/services/sales"
import { useToast } from "@/hooks/use-toast"

interface Venta {
  id: number
  fecha: string
  cliente: string
  tipo: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
  estadoPago: string
}

const toVenta = (sale: Sale): Venta => ({
  id: sale.id,
  fecha: sale.sale_date,
  cliente: sale.client_name,
  tipo: sale.sale_type === "animal" ? "Animal" : "Producto",
  descripcion: sale.description,
  cantidad: sale.quantity,
  precioUnitario: sale.unit_price,
  total: sale.total_price,
  estadoPago:
    sale.payment_status === "pending"
      ? "Pendiente"
      : sale.payment_status === "paid"
        ? "Pagado"
        : "Parcial",
})

const toSalePayload = (v: Partial<Venta>) => ({
  client_name: v.cliente,
  sale_type: (v.tipo === "Animal" ? "animal" : "product") as "animal" | "product",
  description: v.descripcion,
  quantity: v.cantidad,
  unit_price: v.precioUnitario,
  total_price: v.total,
  payment_status: (
    v.estadoPago === "Pendiente" ? "pending" : v.estadoPago === "Pagado" ? "paid" : "partial"
  ) as "pending" | "paid" | "partial",
  sale_date: v.fecha,
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "cliente", label: "Cliente", render: (item: Venta) => <span className="font-medium">{item.cliente}</span> },
  { key: "tipo", label: "Tipo", render: (item: Venta) => <StatusBadge status={item.tipo} variant="info" /> },
  { key: "descripcion", label: "Descripción" },
  { key: "cantidad", label: "Cantidad" },
  { key: "total", label: "Total", render: (item: Venta) => <span className="font-semibold">{formatCurrency(item.total)}</span> },
  { key: "estadoPago", label: "Pago", render: (item: Venta) => <StatusBadge status={item.estadoPago} /> },
]

const defaultVenta: Partial<Venta> = {
  fecha: new Date().toISOString().split("T")[0],
  cliente: "",
  tipo: "Animal",
  descripcion: "",
  cantidad: 1,
  precioUnitario: 0,
  total: 0,
  estadoPago: "Pendiente",
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentVenta, setCurrentVenta] = useState<Partial<Venta> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadVentas = useCallback(async () => {
    try {
      setLoading(true)
      const data = await saleService.list()
      setVentas((data as Sale[]).map(toVenta))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las ventas.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadVentas()
  }, [loadVentas])

  const stats = useMemo(() => {
    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0)
    const pendientes = ventas.filter((v) => v.estadoPago === "Pendiente").reduce((acc, v) => acc + v.total, 0)
    const pagadas = ventas.filter((v) => v.estadoPago === "Pagado").length
    return { totalVentas, pendientes, pagadas }
  }, [ventas])

  const handleCreate = () => {
    setCurrentVenta({ ...defaultVenta })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (venta: Venta) => {
    setCurrentVenta({ ...venta })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (venta: Venta) => {
    setCurrentVenta(venta)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentVenta?.id) {
      try {
        await saleService.delete(currentVenta.id)
        toast({ title: "Venta eliminada", description: "El registro ha sido eliminado." })
        await loadVentas()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar la venta.", variant: "destructive" })
      }
    }
  }, [currentVenta, loadVentas, toast])

  const handleSave = async () => {
    if (!currentVenta?.cliente || !currentVenta?.descripcion) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }

    const total = (currentVenta.cantidad || 0) * (currentVenta.precioUnitario || 0)

    try {
      if (isEditing && currentVenta.id) {
        await saleService.update(currentVenta.id, toSalePayload({ ...currentVenta, total }))
        toast({ title: "Venta actualizada", description: "El registro ha sido actualizado." })
      } else {
        await saleService.create(toSalePayload({ ...currentVenta, total }))
        toast({ title: "Venta creada", description: "El nuevo registro ha sido creado." })
      }
      setDialogOpen(false)
      await loadVentas()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la venta.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Venta, value: string | number) => {
    setCurrentVenta((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando ventas...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ventas</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalVentas)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Por Cobrar</p>
                <p className="text-xl font-bold">{formatCurrency(stats.pendientes)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas Pagadas</p>
                <p className="text-2xl font-bold">{stats.pagadas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Button>
        </div>

        <DataTable data={ventas} columns={columns} searchPlaceholder="Buscar cliente..." searchKeys={["cliente", "descripcion"]}
          actions={(item) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Venta" : "Nueva Venta"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={currentVenta?.fecha || ""} onChange={(e) => updateField("fecha", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={currentVenta?.tipo || ""} onValueChange={(v) => updateField("tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Animal">Animal</SelectItem>
                      <SelectItem value="Producto">Producto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Input value={currentVenta?.cliente || ""} onChange={(e) => updateField("cliente", e.target.value)} placeholder="Nombre del cliente" />
              </div>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Input value={currentVenta?.descripcion || ""} onChange={(e) => updateField("descripcion", e.target.value)} placeholder="Descripción de la venta" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input type="number" value={currentVenta?.cantidad || ""} onChange={(e) => updateField("cantidad", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Precio Unitario</Label>
                  <Input type="number" value={currentVenta?.precioUnitario || ""} onChange={(e) => updateField("precioUnitario", Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado de Pago</Label>
                <Select value={currentVenta?.estadoPago || ""} onValueChange={(v) => updateField("estadoPago", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Eliminar Venta" description="¿Está seguro?" confirmLabel="Eliminar" onConfirm={confirmDelete} />
      </div>
    </AppLayout>
  )
}
