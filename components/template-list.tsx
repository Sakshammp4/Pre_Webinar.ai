"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Textarea } from "@/components/ui/textarea"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, X, Pencil, Trash2, FileText, Save } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Template {
  id: string
  content: string
  is_approved: boolean
  created_at: string
}

interface TemplateListProps {
  templates: Template[]
  webinarId: string
}

export function TemplateList({ templates, webinarId }: TemplateListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async (id: string, approve: boolean) => {
    setLoadingId(id)
    await supabase
      .from("post_templates")
      .update({ is_approved: approve })
      .eq("id", id)
    router.refresh()
    setLoadingId(null)
  }

  const handleEdit = (template: Template) => {
    setEditingId(template.id)
    setEditContent(template.content)
  }

  const handleSaveEdit = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from("post_templates")
      .update({ content: editContent })
      .eq("id", id)
    router.refresh()
    setEditingId(null)
    setLoadingId(null)
  }

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from("post_templates")
      .delete()
      .eq("id", id)
    router.refresh()
    setLoadingId(null)
  }

  if (templates.length === 0) {
    return (
      <Empty className="mt-8">
        <EmptyMedia variant="icon">
          <FileText className="w-6 h-6" />
        </EmptyMedia>
        <EmptyTitle>No templates yet</EmptyTitle>
        <EmptyDescription>
          Generate your first batch of post templates using AI above.
        </EmptyDescription>
      </Empty>
    )
  }

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.is_approved !== b.is_approved) return a.is_approved ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates ({templates.length})</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="default">{templates.filter(t => t.is_approved).length} approved</Badge>
          <Badge variant="secondary">{templates.filter(t => !t.is_approved).length} pending</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedTemplates.map((template) => (
          <Card key={template.id} className={template.is_approved ? "border-primary/50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {template.is_approved ? (
                    <Badge variant="default">Approved</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {editingId !== template.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(template)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleApprove(template.id, !template.is_approved)}
                        disabled={loadingId === template.id}
                      >
                        {loadingId === template.id ? (
                          <Spinner />
                        ) : template.is_approved ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete template?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this template.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(template.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === template.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(template.id)}
                      disabled={loadingId === template.id}
                    >
                      {loadingId === template.id ? <Spinner className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {template.content}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
