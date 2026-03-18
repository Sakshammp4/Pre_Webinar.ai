"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 8)
}

export default function NewWebinarPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError("You must be logged in to create a webinar")
      setLoading(false)
      return
    }

    const slug = generateSlug(title)

    const { data, error: insertError } = await supabase
      .from("webinars")
      .insert({
        host_id: user.id,
        title,
        description: description || null,
        hashtags: hashtags || null,
        shareable_slug: slug,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create a new webinar</CardTitle>
            <CardDescription>
              Set up your webinar details. You can generate and curate LinkedIn post templates after creation.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Webinar Title</FieldLabel>
                  <Input
                    placeholder="e.g., AI in Marketing Summit 2024"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <FieldDescription>
                    This will be shown to attendees when they visit your share link.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    placeholder="Brief description of your webinar..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>
                    Help the AI understand your webinar content for better post generation.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Default Hashtags</FieldLabel>
                  <Input
                    placeholder="e.g., #AIMarketing #Webinar #MarTech"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                  <FieldDescription>
                    These hashtags will be included in generated posts.
                  </FieldDescription>
                </Field>

                {error && <FieldError>{error}</FieldError>}
              </FieldGroup>
            </CardContent>
            <div className="px-6 pb-6">
              <Button type="submit" className="w-full" disabled={loading || !title.trim()}>
                {loading ? <Spinner className="mr-2" /> : null}
                Create Webinar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
