"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, File, FolderOpen } from "lucide-react"

const documents = [
  { id: "1", name: "Registro sanitario 2026", type: "PDF", size: "2.4 MB", date: "2026-04-15" },
  { id: "2", name: "Certificado de vacunación", type: "PDF", size: "1.1 MB", date: "2026-03-20" },
  { id: "3", name: "Inventario abril 2026", type: "Excel", size: "856 KB", date: "2026-04-01" },
  { id: "4", name: "Reporte producción Q1", type: "PDF", size: "3.2 MB", date: "2026-04-10" },
]

export default function DocumentosPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Documentos</h1>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Subir Documento
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Documentos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <File className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.type} - {doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{doc.date}</span>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
