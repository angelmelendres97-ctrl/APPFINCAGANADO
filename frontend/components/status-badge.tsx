import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  // Animal states
  Activo: "success",
  Seco: "default",
  Preñado: "info",
  "En Crecimiento": "warning",
  Vendido: "default",
  Muerto: "danger",
  // Sex
  Hembra: "success",
  Macho: "info",
  // Payments
  Pagado: "success",
  Pendiente: "warning",
  Parcial: "info",
  // Stock
  Disponible: "success",
  "Bajo Stock": "warning",
  Agotado: "danger",
  // Generic
  Inactivo: "default",
  Mantenimiento: "warning",
  // Mastitis
  Sí: "danger",
  No: "success",
  // Reproduction
  Confirmado: "success",
  Exitoso: "success",
  Fallido: "danger",
  // Alerts
  Alta: "danger",
  Media: "warning",
  Baja: "info",
}

const variantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const computedVariant = variant || statusVariants[status] || "default"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[computedVariant],
        className
      )}
    >
      {status}
    </span>
  )
}
