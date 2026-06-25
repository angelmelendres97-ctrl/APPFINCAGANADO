"use client"

import * as React from "react"
import { X, ImagePlus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [message, setMessage] = React.useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, maxImages - images.length)

    if (validFiles.length === 0) {
      setMessage("Seleccione archivos de imagen válidos.")
      return
    }

    Promise.all(
      validFiles.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      }))
    ).then((newImages) => {
      onChange([...images, ...newImages])
      setMessage(`${newImages.length} imagen${newImages.length === 1 ? "" : "es"} cargada${newImages.length === 1 ? "" : "s"} en vista previa.`)
    }).catch(() => setMessage("No se pudieron cargar las imágenes seleccionadas."))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
    setMessage("Imagen eliminada de la vista previa.")
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images]
      const [removed] = newImages.splice(draggedIndex, 1)
      newImages.splice(dragOverIndex, 0, removed)
      onChange(newImages)
      setMessage("Orden de imágenes actualizado.")
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative aspect-square cursor-move rounded-lg border bg-muted overflow-hidden",
              draggedIndex === index && "opacity-50",
              dragOverIndex === index && draggedIndex !== index && "ring-2 ring-primary"
            )}
          >
            <img
              src={image}
              alt={`Imagen ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Perfil
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-5 w-5 text-white" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px]">Agregar</span>
            </div>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} imágenes. Arrastra para reordenar. La primera será la imagen de perfil.
      </p>
      {message && <p className="text-xs font-medium text-primary">{message}</p>}
    </div>
  )
}
