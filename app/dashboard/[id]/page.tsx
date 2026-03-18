import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, ExternalLink, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateTemplates } from "@/components/generate-templates"
import { TemplateList } from "@/components/template-list"
import { SubmissionsList } from "@/components/submissions-list"
import { ShareLinkCopy } from "@/components/share-link-copy"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WebinarManagePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: webinar, error } = await supabase
    .from("webinars")
    .select(`
      *,
      post_templates (*),
      attendee_submissions (*)
    `)
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (error || !webinar) {
    notFound()
  }

  const approvedCount = webinar.post_templates.filter((t: { is_approved: boolean }) => t.is_approved).length
  const submissionCount = webinar.attendee_submissions.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{webinar.title}</h1>
              {webinar.description && (
                <p className="text-muted-foreground mt-1">{webinar.description}</p>
              )}
              {webinar.hashtags && (
                <p className="text-sm text-muted-foreground mt-2">{webinar.hashtags}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShareLinkCopy slug={webinar.shareable_slug} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/w/${webinar.shareable_slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Preview
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{webinar.post_templates.length}</div>
                <p className="text-xs text-muted-foreground">Total Templates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{submissionCount}</div>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {approvedCount > 0 ? Math.round((submissionCount / approvedCount) * 100) / 100 : 0}
                </div>
                <p className="text-xs text-muted-foreground">Submissions/Template</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Post Templates</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions
                {submissionCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{submissionCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <GenerateTemplates webinarId={webinar.id} webinar={webinar} />
              <TemplateList 
                templates={webinar.post_templates} 
                webinarId={webinar.id}
              />
            </TabsContent>

            <TabsContent value="submissions">
              <SubmissionsList 
                submissions={webinar.attendee_submissions}
                templates={webinar.post_templates}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
