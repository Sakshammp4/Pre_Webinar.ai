import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AttendeeFlow } from "@/components/attendee-flow"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AttendeePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: webinar, error } = await supabase
    .from("webinars")
    .select(`
      *,
      post_templates (*)
    `)
    .eq("shareable_slug", slug)
    .single()

  if (error || !webinar) {
    notFound()
  }

  // Only show approved templates to attendees
  const approvedTemplates = webinar.post_templates.filter(
    (t: { is_approved: boolean }) => t.is_approved
  )

  return (
    <div className="min-h-screen bg-background">
      <AttendeeFlow 
        webinar={webinar} 
        templates={approvedTemplates}
      />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: webinar } = await supabase
    .from("webinars")
    .select("title, description")
    .eq("shareable_slug", slug)
    .single()

  if (!webinar) {
    return {
      title: "Webinar Not Found",
    }
  }

  return {
    title: `Share Your Experience - ${webinar.title}`,
    description: webinar.description || `Share your experience from ${webinar.title} on LinkedIn`,
  }
}
