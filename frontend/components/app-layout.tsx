"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useNotifications, type Notification } from "@/lib/notifications-context"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  LayoutDashboard,
  PawPrint,
  MapPin,
  Milk,
  Heart,
  Stethoscope,
  Calendar,
  Utensils,
  FileText,
  Bell,
  FileArchive,
  Settings,
  Users,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Check,
  Trash2,
  Package,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

const navigation = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Animales", href: "/animales", icon: PawPrint },
  { name: "Potreros", href: "/potreros", icon: MapPin },
  { name: "Leche", href: "/leche", icon: Milk },
  { name: "Reproducción", href: "/reproduccion", icon: Heart },
  { name: "Sanidad", href: "/sanidad", icon: Stethoscope },
  { name: "Eventos", href: "/eventos", icon: Calendar },
  { name: "Alimentación", href: "/alimentacion", icon: Utensils },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "Reportes", href: "/reportes", icon: FileText },
  { name: "Alertas", href: "/alertas", icon: Bell },
  { name: "Documentos", href: "/documentos", icon: FileArchive },
  { name: "Configuración", href: "/configuracion", icon: Settings },
  { name: "Usuarios", href: "/usuarios", icon: Users },
]

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "success":
      return <CheckCircle className="h-4 w-4 text-primary" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()

  const { loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
  }, [isAuthenticated, pathname, router, loading])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (loading || !isAuthenticated) {
    return null
  }

  const userName = user?.full_name || user?.first_name || ""
  const userEmail = user?.email || ""
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AF"

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 transform bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FINCA</h1>
              <p className="text-xs text-white/70">Sistema de Gestión</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-white/80 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user?.full_name || user?.first_name || "Admin"}</p>
                  <p className="truncate text-xs text-white/70">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h4 className="font-semibold">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={markAllAsRead}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Marcar todas
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bell className="mb-2 h-8 w-8" />
                      <p className="text-sm">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                            !notification.read && "bg-muted/30"
                          )}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm", !notification.read && "font-medium")}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {userInitials}
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.full_name || user?.first_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracion" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
