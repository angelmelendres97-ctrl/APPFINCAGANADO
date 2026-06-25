"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SearchableSelect } from "@/components/searchable-select"
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
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Pencil, Trash2, Plus, Download, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { inventoryService, type InventoryItem } from "@/lib/services/inventory"
import { useToast } from "@/hooks/use-toast"

interface Inventario {
  id: number
  nombre: string
  categoria: string
  stockActual: number
  stockMinimo: number
  unidad: string
  estado: string
  precioUnitario?: number
  fechaVencimiento?: string
  proveedor?: string
}

const toInventario = (item: InventoryItem): Inventario => {
  const estado = item.stock_current === 0
    ? "Agotado"
    : item.stock_current < item.stock_minimum
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
    precioUnitario: item.unit_price ?? undefined,
    fechaVencimiento: item.expiry_date ?? undefined,
    proveedor: item.supplier ?? undefined,
  }
}

const toInventoryPayload = (item: Partial<Inventario>) => ({
  name: item.nombre,
  category: item.categoria,
  stock_current: item.stockActual,
  stock_minimum: item.stockMinimo,
  unit: item.unidad,
  unit_price: item.precioUnitario ?? null,
  expiry_date: item.fechaVencimiento || null,
  supplier: item.proveedor || null,
})

const columns = [
  {
    key: "nombre",
    label: "PRODUCTO",
    render: (item: Inventario) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{item.nombre}</p>
          <p className="text-xs text-muted-foreground">{item.categoria}</p>
        </div>
      </div>
    ),
  },
  {
    key: "stockActual",
    label: "STOCK",
    render: (item: Inventario) => (
      <div className="text-right">
        <p className="font-semibold">{item.stockActual}</p>
        <p className="text-xs text-muted-foreground">{item.unidad}</p>
      </div>
    ),
  },
  {
    key: "stockMinimo",
    label: "MÍNIMO",
    render: (item: Inventario) => (
      <span className="text-muted-foreground">{item.stockMinimo} {item.unidad}</span>
    ),
  },
  {
    key: "precioUnitario",
    label: "PRECIO",
    render: (item: Inventario) => (
      <span className="font-medium">
        {item.precioUnitario ? `$${item.precioUnitario.toLocaleString()}` : "-"}
      </span>
    ),
  },
  {
    key: "estado",
    label: "ESTADO",
    render: (item: Inventario) => <StatusBadge status={item.estado} />,
  },
]

const defaultItem: Partial<Inventario> = {
  nombre: "",
  categoria: "Insumos",
  stockActual: 0,
  stockMinimo: 0,
  unidad: "",
  estado: "Disponible",
  precioUnitario: 0,
  fechaVencimiento: "",
  proveedor: "",
}

const categoriaOptions = [
  { value: "Derivados Lácteos", label: "Derivados Lácteos" },
  { value: "Alimentos", label: "Alimentos" },
  { value: "Medicamentos", label: "Medicamentos" },
  { value: "Insumos", label: "Insumos" },
  { value: "Herramientas", label: "Herramientas" },
  { value: "Productos", label: "Productos" },
]

const unidadOptions = [
  { value: "Kg", label: "Kilogramos (Kg)" },
  { value: "Litros", label: "Litros" },
  { value: "Unidades", label: "Unidades" },
  { value: "Bultos", label: "Bultos" },
  { value: "Pacas", label: "Pacas" },
  { value: "Dosis", label: "Dosis" },
  { value: "Frascos", label: "Frascos" },
  { value: "Pares", label: "Pares" },
]

export default function InventarioPage() {
  const [items, setItems] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<Inventario> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const { toast } = useToast()

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const data = await inventoryService.list()
      setItems((data as InventoryItem[]).map(toInventario))
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Stats
  const totalItems = items.length
  const disponibles = items.filter((i) => i.estado === "Disponible").length
  const bajoStock = items.filter((i) => i.estado === "Bajo Stock").length
  const agotados = items.filter((i) => i.estado === "Agotado").length
  const valorTotal = items.reduce((acc, i) => acc + (i.precioUnitario || 0) * i.stockActual, 0)

  // Filter by category
  const filteredItems = activeTab === "todos"
    ? items
    : activeTab === "lacteos"
      ? items.filter((i) => i.categoria === "Derivados Lácteos")
      : activeTab === "medicamentos"
        ? items.filter((i) => i.categoria === "Medicamentos")
        : activeTab === "alimentos"
          ? items.filter((i) => i.categoria === "Alimentos")
          : items.filter((i) => i.categoria === "Insumos" || i.categoria === "Herramientas")

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

  const handleView = (item: Inventario) => {
    setCurrentItem(item)
    setViewDialogOpen(true)
  }

  const handleDelete = (item: Inventario) => {
    setCurrentItem(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentItem?.id) {
      try {
        await inventoryService.delete(currentItem.id)
        toast({
          title: "Producto eliminado",
          description: "El registro ha sido eliminado correctamente.",
        })
        await loadItems()
      } catch {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto.",
          variant: "destructive",
        })
      }
    }
  }, [currentItem, loadItems, toast])

  const calculateEstado = (stockActual: number, stockMinimo: number): string => {
    if (stockActual === 0) return "Agotado"
    if (stockActual < stockMinimo) return "Bajo Stock"
    return "Disponible"
  }

  const handleSave = async () => {
    if (!currentItem?.nombre || !currentItem?.unidad) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentItem.id) {
        await inventoryService.update(currentItem.id, toInventoryPayload(currentItem))
        toast({
          title: "Producto actualizado",
          description: "El registro ha sido actualizado correctamente.",
        })
      } else {
        await inventoryService.create(toInventoryPayload(currentItem))
        toast({
          title: "Producto creado",
          description: "El nuevo registro ha sido creado correctamente.",
        })
      }
      setDialogOpen(false)
      await loadItems()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto.",
        variant: "destructive",
      })
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestión de derivados lácteos e insumos</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{disponibles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bajo Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{bajoStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agotados</p>
                  <p className="text-2xl font-bold text-red-600">{agotados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total Inventario</p>
                <p className="text-2xl font-bold text-primary">${valorTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Actions */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="lacteos">Lácteos</TabsTrigger>
              <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
              <TabsTrigger value="alimentos">Alimentos</TabsTrigger>
              <TabsTrigger value="otros">Otros</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredItems}
          columns={columns}
          searchPlaceholder="Buscar producto..."
          searchKeys={["nombre", "categoria", "proveedor"]}
          actions={(item) => (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleView(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre del producto"
                    value={currentItem?.nombre || ""}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <SearchableSelect
                    options={categoriaOptions}
                    value={currentItem?.categoria || ""}
                    onValueChange={(value) => updateField("categoria", value)}
                    placeholder="Seleccionar categoría..."
                    searchPlaceholder="Buscar categoría..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockActual">Stock Actual *</Label>
                  <Input
                    id="stockActual"
                    type="number"
                    placeholder="0"
                    value={currentItem?.stockActual || ""}
                    onChange={(e) => updateField("stockActual", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    placeholder="0"
                    value={currentItem?.stockMinimo || ""}
                    onChange={(e) => updateField("stockMinimo", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidad">Unidad *</Label>
                  <SearchableSelect
                    options={unidadOptions}
                    value={currentItem?.unidad || ""}
                    onValueChange={(value) => updateField("unidad", value)}
                    placeholder="Seleccionar unidad..."
                    searchPlaceholder="Buscar unidad..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precioUnitario">Precio Unitario</Label>
                  <Input
                    id="precioUnitario"
                    type="number"
                    placeholder="0"
                    value={currentItem?.precioUnitario || ""}
                    onChange={(e) => updateField("precioUnitario", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                  <Input
                    id="fechaVencimiento"
                    type="date"
                    value={currentItem?.fechaVencimiento || ""}
                    onChange={(e) => updateField("fechaVencimiento", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  placeholder="Nombre del proveedor"
                  value={currentItem?.proveedor || ""}
                  onChange={(e) => updateField("proveedor", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="h-11 px-6">
                {isEditing ? "Guardar Cambios" : "Guardar Producto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalle del Producto</DialogTitle>
            </DialogHeader>
            {currentItem && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{currentItem.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{currentItem.categoria}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                    <p className="text-lg font-bold">{currentItem.stockActual} {currentItem.unidad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                    <p className="font-medium">{currentItem.stockMinimo} {currentItem.unidad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <StatusBadge status={currentItem.estado || ""} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio Unitario</p>
                    <p className="font-medium">
                      {currentItem.precioUnitario ? `$${currentItem.precioUnitario.toLocaleString()}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Vencimiento</p>
                    <p className="font-medium">{currentItem.fechaVencimiento || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proveedor</p>
                    <p className="font-medium">{currentItem.proveedor || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Valor en Inventario</p>
                    <p className="text-lg font-bold text-primary">
                      ${((currentItem.precioUnitario || 0) * (currentItem.stockActual || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Producto"
          description={`¿Está seguro que desea eliminar ${currentItem?.nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
