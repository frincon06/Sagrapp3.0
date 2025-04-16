"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Importar el editor de texto enriquecido de forma dinámica para evitar errores de SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

interface Lesson {
  id: string
  course_id: string
  title: string
  devotional_text: string
  sort_order: number
  is_locked: boolean
}

interface LessonFormProps {
  lesson: Lesson | null
  courseId: string
  onClose: () => void
  onSaved: () => void
}

export default function LessonForm({ lesson, courseId, onClose, onSaved }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || "")
  const [devotionalText, setDevotionalText] = useState(lesson?.devotional_text || "")
  const [isLocked, setIsLocked] = useState(lesson?.is_locked || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [preview, setPreview] = useState<string>("")
  const supabase = createClientComponentClient()

  const isEditing = !!lesson

  useEffect(() => {
    // Actualizar la vista previa cuando cambia el texto devocional
    setPreview(devotionalText)
  }, [devotionalText])

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  }

  const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "link", "image"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!title.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (isEditing) {
        // Update existing lesson
        const { error } = await supabase
          .from("lessons")
          .update({
            title,
            devotional_text: devotionalText,
            is_locked: isLocked,
          })
          .eq("id", lesson.id)

        if (error) throw error
      } else {
        // Get max order
        const { data: maxOrderData } = await supabase
          .from("lessons")
          .select("sort_order")
          .eq("course_id", courseId)
          .order("sort_order", { ascending: false })
          .limit(1)

        const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].sort_order : 0

        // Create new lesson
        const { error } = await supabase.from("lessons").insert({
          course_id: courseId,
          title,
          devotional_text: devotionalText,
          is_locked: isLocked,
          sort_order: maxOrder + 1,
        })

        if (error) throw error
      }

      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al guardar la lección")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Lección" : "Nueva Lección"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de la lección existente."
              : "Completa los detalles para crear una nueva lección."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la lección"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="devotional_text">Texto Devocional</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="border rounded-md p-1">
                  <ReactQuill
                    theme="snow"
                    value={devotionalText}
                    onChange={setDevotionalText}
                    modules={modules}
                    formats={formats}
                    placeholder="Escribe el texto devocional o guía de la lección aquí..."
                    style={{ height: "300px", marginBottom: "40px" }}
                  />
                </TabsContent>
                <TabsContent value="preview" className="border rounded-md p-4 min-h-[340px]">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: preview }} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_locked" checked={isLocked} onCheckedChange={setIsLocked} />
              <Label htmlFor="is_locked">Lección bloqueada</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
