import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Plus, Link as LinkIcon, Users, FileText } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { WebinarCard } from "@/components/webinar-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: webinars } = await supabase
    .from("webinars")
    .select(`
      *,
      post_templates (count),
      attendee_submissions (count)
    `)
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={user.email || ""} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Webinars</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage webinar post campaigns
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="w-4 h-4 mr-2" />
              New Webinar
            </Link>
          </Button>
        </div>

        {!webinars || webinars.length === 0 ? (
          <Empty className="mt-12">
            <EmptyMedia variant="icon">
              <FileText className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>No webinars yet</EmptyTitle>
            <EmptyDescription>
              Create your first webinar to start generating LinkedIn posts for your attendees.
            </EmptyDescription>
            <Button asChild className="mt-4">
              <Link href="/dashboard/new">
                <Plus className="w-4 h-4 mr-2" />
                Create your first webinar
              </Link>
            </Button>
          </Empty>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {webinars.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
