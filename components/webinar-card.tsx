"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link as LinkIcon, Users, FileText, ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"

interface WebinarCardProps {
  webinar: {
    id: string
    title: string
    description: string | null
    shareable_slug: string
    created_at: string
    post_templates: { count: number }[]
    attendee_submissions: { count: number }[]
  }
}

export function WebinarCard({ webinar }: WebinarCardProps) {
  const [copied, setCopied] = useState(false)
  const templateCount = webinar.post_templates[0]?.count || 0
  const submissionCount = webinar.attendee_submissions[0]?.count || 0
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/w/${webinar.shareable_slug}`
    : `/w/${webinar.shareable_slug}`

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{webinar.title}</CardTitle>
            {webinar.description && (
              <CardDescription className="line-clamp-2">
                {webinar.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{templateCount} templates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{submissionCount} submissions</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={copyShareLink}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Link
              </>
            )}
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/${webinar.id}`}>
              Manage
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
