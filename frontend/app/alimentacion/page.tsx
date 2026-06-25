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
import { Pencil, Trash2, Plus, Package, AlertTriangle } from "lucide-react"
import { inventoryService, type InventoryItem } from "@/lib/services/inventory"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface Inventario {
  id: number
  nombre: string
  categoria: string
  stockActual: number
  stockMinimo: number
  unidad: string
  estado: string
}

const toInventario = (item: InventoryItem): Inventario => {
  const estado = item.stock_current === 0
    ? "Agotado"
    : item.stock_current <= item.stock_minimum
      ? "Bajo Stock"
      : "Disponible"
  return {
    id: item.id,
    nombre: item.name,
    categoria: item.category,
    stockActual: item.stock_current,
    stockMinimo: item.stock_minimum,
    unidad: item.unit,
    estado,
  }
}

const toInventoryPayload = (item: Partial<Inventario>) => ({
  name: item.nombre,
  category: item.categoria,
  stock_current: item.stockActual,
  stock_minimum: item.stockMinimo,
  unit: item.unidad,
})

const columns = [
  { key: "nombre", label: "Producto", render: (item: Inventario) => <span className="font-medium">{item.nombre}</span> },
  { key: "categoria", label: "Categoría", render: (item: Inventario) => <StatusBadge status={item.categoria} variant="info" /> },
  { key: "stockActual", label: "Stock Actual", render: (item: Inventario) => <span className="font-semibold">{item.stockActual}</span> },
  { key: "stockMinimo", label: "Stock Mínimo" },
  { key: "unidad", label: "Unidad" },
  { key: "estado", label: "Estado", render: (item: Inventario) => <StatusBadge status={item.estado} /> },
]

const defaultItem: Partial<Inventario> = {
  nombre: "",
  categoria: "Insumos",
  stockActual: 0,
  stockMinimo: 0,
  unidad: "",
  estado: "Disponible",
}

export default function InventarioPage() {
  const [items, setItems] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<Inventario> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const data = await inventoryService.list()
      setItems(unwrapList<InventoryItem>(data).map(toInventario))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los productos.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const stats = useMemo(() => {
    const total = items.length
    const bajoStock = items.filter((i) => i.estado === "Bajo Stock").length
    const agotados = items.filter((i) => i.estado === "Agotado").length
    return { total, bajoStock, agotados }
  }, [items])

  const handleCreate = () => {
    setCurrentItem({ ...defaultItem })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (item: Inventario) => {
    setCurrentItem({ ...item })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (item: Inventario) => {
    setCurrentItem(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentItem?.id) {
      try {
        await inventoryService.delete(currentItem.id)
        toast({ title: "Producto eliminado", description: "El producto ha sido eliminado." })
        await loadItems()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" })
      }
    }
  }, [currentItem, loadItems, toast])

  const handleSave = async () => {
    if (!currentItem?.nombre) {
      toast({ title: "Error", description: "Complete los campos obligatorios.", variant: "destructive" })
      return
    }

    try {
      if (isEditing && currentItem.id) {
        await inventoryService.update(currentItem.id, toInventoryPayload(currentItem))
        toast({ title: "Producto actualizado", description: "El producto ha sido actualizado." })
      } else {
        await inventoryService.create(toInventoryPayload(currentItem))
        toast({ title: "Producto creado", description: "El nuevo producto ha sido creado." })
      }
      setDialogOpen(false)
      await loadItems()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el producto.", variant: "destructive" })
    }
  }

  const updateField = (field: keyof Inventario, value: string | number) => {
    setCurrentItem((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Inventario</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bajo Stock</p>
                <p className="text-2xl font-bold">{stats.bajoStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agotados</p>
                <p className="text-2xl font-bold">{stats.agotados}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <DataTable
          data={items}
          columns={columns}
          searchPlaceholder="Buscar producto..."
          searchKeys={["nombre", "categoria"]}
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
              <DialogTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={currentItem?.nombre || ""} onChange={(e) => updateField("nombre", e.target.value)} placeholder="Nombre del producto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={currentItem?.categoria || ""} onValueChange={(v) => updateField("categoria", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insumos">Insumos</SelectItem>
                      <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="Alimentos">Alimentos</SelectItem>
                      <SelectItem value="Herramientas">Herramientas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Input value={currentItem?.unidad || ""} onChange={(e) => updateField("unidad", e.target.value)} placeholder="Ej: Kg, L, Unidades" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Actual</Label>
                  <Input type="number" value={currentItem?.stockActual || ""} onChange={(e) => updateField("stockActual", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Mínimo</Label>
                  <Input type="number" value={currentItem?.stockMinimo || ""} onChange={(e) => updateField("stockMinimo", Number(e.target.value))} />
                </div>
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
          title="Eliminar Producto"
          description="¿Está seguro que desea eliminar este producto?"
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
