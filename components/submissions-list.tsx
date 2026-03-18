"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users } from "lucide-react"

interface Template {
  id: string
  content: string
}

interface Submission {
  id: string
  attendee_name: string
  photo_url: string | null
  rating: number | null
  selected_template_id: string | null
  created_at: string
}

interface SubmissionsListProps {
  submissions: Submission[]
  templates: Template[]
}

export function SubmissionsList({ submissions, templates }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <Empty className="mt-8">
        <EmptyMedia variant="icon">
          <Users className="w-6 h-6" />
        </EmptyMedia>
        <EmptyTitle>No submissions yet</EmptyTitle>
        <EmptyDescription>
          Share your webinar link with attendees to start collecting submissions.
        </EmptyDescription>
      </Empty>
    )
  }

  const getTemplatePreview = (templateId: string | null) => {
    if (!templateId) return null
    const template = templates.find(t => t.id === templateId)
    return template?.content.slice(0, 100) + "..."
  }

  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Submissions ({submissions.length})</h3>
        <div className="text-sm text-muted-foreground">
          Avg rating: {submissions.filter(s => s.rating).length > 0 
            ? (submissions.reduce((acc, s) => acc + (s.rating || 0), 0) / submissions.filter(s => s.rating).length).toFixed(1)
            : "N/A"
          }
        </div>
      </div>

      <div className="grid gap-4">
        {sortedSubmissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  {submission.photo_url ? (
                    <AvatarImage src={submission.photo_url} alt={submission.attendee_name} />
                  ) : null}
                  <AvatarFallback>
                    {submission.attendee_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{submission.attendee_name}</h4>
                    {submission.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < submission.rating! 
                                ? "fill-primary text-primary" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(submission.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {submission.selected_template_id && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      Selected: {getTemplatePreview(submission.selected_template_id)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
