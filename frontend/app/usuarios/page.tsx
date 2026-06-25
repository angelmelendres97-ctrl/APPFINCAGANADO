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
import { Pencil, Trash2, Plus, Search, Users } from "lucide-react"
import { userService, type User } from "@/lib/services/users"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  estado: string
}

const toUsuario = (user: User): Usuario => ({
  id: user.id,
  nombre: `${user.first_name} ${user.last_name}`.trim(),
  email: user.email,
  rol: user.role?.name || "Operario",
  estado: user.status,
})

const toUserPayload = (u: Partial<Usuario>) => {
  const nameParts = (u.nombre || "").split(" ")
  return {
    first_name: nameParts[0] || "",
    last_name: nameParts.slice(1).join(" ") || "",
    email: u.email,
    status: u.estado,
    role: { name: u.rol || "Operario" },
  }
}

const rolColors: Record<string, "danger" | "success" | "default"> = {
  Administrador: "danger",
  Veterinario: "success",
  Operario: "default",
}

const defaultUsuario: Partial<Usuario> = {
  nombre: "",
  email: "",
  rol: "Operario",
  estado: "Activo",
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentUsuario, setCurrentUsuario] = useState<Partial<Usuario> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      const data = await userService.list()
      setUsuarios((data as User[]).map(toUsuario))
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadUsuarios()
  }, [loadUsuarios])

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setCurrentUsuario({ ...defaultUsuario })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario({ ...usuario })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (usuario: Usuario) => {
    setCurrentUsuario(usuario)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentUsuario?.id) {
      try {
        await userService.delete(currentUsuario.id)
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente.",
        })
        await loadUsuarios()
      } catch {
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario.",
          variant: "destructive",
        })
      }
    }
  }, [currentUsuario, loadUsuarios, toast])

  const handleSave = async () => {
    if (!currentUsuario?.nombre || !currentUsuario?.email) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentUsuario.id) {
        await userService.update(currentUsuario.id, toUserPayload(currentUsuario))
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado correctamente.",
        })
      } else {
        await userService.create(toUserPayload(currentUsuario) as any)
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado correctamente.",
        })
      }
      setDialogOpen(false)
      await loadUsuarios()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el usuario.",
        variant: "destructive",
      })
    }
  }

  const updateField = (field: keyof Usuario, value: string) => {
    setCurrentUsuario((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

        {/* Search and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Users Grid */}
        {filteredUsuarios.length === 0 ? (
          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No hay usuarios registrados</p>
              <p className="text-sm text-muted-foreground">
                Comienza agregando un nuevo usuario
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsuarios.map((usuario) => (
              <Card key={usuario.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {usuario.nombre
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{usuario.nombre}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {usuario.email}
                      </p>
                      <div className="mt-2">
                        <StatusBadge
                          status={usuario.rol}
                          variant={rolColors[usuario.rol]}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(usuario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(usuario)}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Nombre del usuario"
                  value={currentUsuario?.nombre || ""}
                  onChange={(e) => updateField("nombre", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={currentUsuario?.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    value={currentUsuario?.rol || ""}
                    onValueChange={(value) => updateField("rol", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Veterinario">Veterinario</SelectItem>
                      <SelectItem value="Operario">Operario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={currentUsuario?.estado || ""}
                    onValueChange={(value) => updateField("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {isEditing ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Usuario"
          description={`¿Está seguro que desea eliminar a ${currentUsuario?.nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
