"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Check, Copy, Star, ArrowRight, Linkedin } from "lucide-react"

interface Template {
  id: string
  content: string
}

interface Webinar {
  id: string
  title: string
  description: string | null
}

interface AttendeeFlowProps {
  webinar: Webinar
  templates: Template[]
}

type Step = "welcome" | "name" | "photo" | "select" | "rate" | "copy" | "done"

export function AttendeeFlow({ webinar, templates }: AttendeeFlowProps) {
  const [step, setStep] = useState<Step>("welcome")
  const [name, setName] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [customPost, setCustomPost] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [photoInputKey, setPhotoInputKey] = useState(0)

  const previewRef = useRef<HTMLDivElement | null>(null)

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const templatePost = selectedTemplate?.content.replace(/\{\{NAME\}\}/g, name) || ""
  const personalizedPost = customPost.trim().length ? customPost : templatePost

  const uploadPhotoIfNeeded = async () => {
    if (!photoFile) return null
    if (photoUrl) return photoUrl

    setPhotoUploading(true)
    setPhotoError(null)
    try {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg"
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg"
      const filePath = `${webinar.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`

      const { error: uploadError } = await supabase.storage
        .from("attendee-photos")
        .upload(filePath, photoFile, { upsert: true, contentType: photoFile.type })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("attendee-photos").getPublicUrl(filePath)
      const publicUrl = data?.publicUrl ?? null
      setPhotoUrl(publicUrl)
      return publicUrl
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Failed to upload photo")
      return null
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleCopyAndSubmit = async () => {
    await navigator.clipboard.writeText(personalizedPost)
    setCopied(true)
    setLoading(true)

    const uploadedUrl = await uploadPhotoIfNeeded()

    // Submit to database
    await supabase.from("attendee_submissions").insert({
      webinar_id: webinar.id,
      attendee_name: name,
      photo_url: uploadedUrl,
      rating,
      selected_template_id: selectedTemplateId,
    })

    setTimeout(() => {
      setStep("done")
      setLoading(false)
    }, 1000)
  }

  const openLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true`
    window.open(linkedInUrl, "_blank")
  }

  const downloadPreview = async () => {
    if (!previewRef.current) return
    const el = previewRef.current

    try {
      setDownloadError(null)
      await uploadPhotoIfNeeded()
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        onclone: (doc) => {
          const node = doc.querySelector('[data-export="attendee-preview"]') as HTMLElement | null
          if (node) {
            node.style.backgroundColor = "#ffffff"
            node.style.color = "#111827"
            node.querySelectorAll("*").forEach((child) => {
              const el = child as HTMLElement
              if (el.style) {
                if (el.style.backgroundColor && /lab\(|oklch\(|oklab\(/i.test(el.style.backgroundColor)) {
                  el.style.backgroundColor = "#ffffff"
                }
                if (el.style.color && /lab\(|oklch\(|oklab\(/i.test(el.style.color)) {
                  el.style.color = "#111827"
                }
                if (el.style.borderColor && /lab\(|oklch\(|oklab\(/i.test(el.style.borderColor)) {
                  el.style.borderColor = "#e5e7eb"
                }
              }
            })
          }
        },
      })
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `webinar-preview-${webinar.id}.png`
      link.click()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      setDownloadError(`Failed to download image. ${msg}`)
    }
  }

  // Welcome step
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Linkedin className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Share Your Experience</CardTitle>
            <CardDescription className="text-base">
              {webinar.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {"We've prepared some LinkedIn post templates for you. Pick one, personalize it, and share your experience!"}
            </p>
            {templates.length > 0 ? (
              <Button className="w-full" size="lg" onClick={() => setStep("name")}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No post templates are available yet. Check back soon!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Name step
  if (step === "name") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{"What's your name?"}</CardTitle>
            <CardDescription>
              {"We'll personalize your post with your name"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Your name</FieldLabel>
                <Input
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </Field>
            </FieldGroup>
            <Button 
              className="w-full mt-6" 
              size="lg" 
              disabled={!name.trim()}
              onClick={() => setStep("photo")}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Photo step
  if (step === "photo") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Add your photo (optional)</CardTitle>
            <CardDescription>
              This will be used on the preview image you can download.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Upload photo</FieldLabel>
                <Input
                  key={photoInputKey}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setPhotoFile(f)
                    setPhotoUrl(null)
                    setPhotoError(null)
                  }}
                />
              </Field>
            </FieldGroup>

            {photoError ? (
              <p className="text-sm text-destructive">{photoError}</p>
            ) : null}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("select")}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                disabled={photoUploading}
                onClick={async () => {
                  if (!photoFile) {
                    setStep("select")
                    return
                  }
                  const url = await uploadPhotoIfNeeded()
                  if (url) setStep("select")
                }}
              >
                {photoUploading ? (
                  <>
                    <Spinner className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Template selection step
  if (step === "select") {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Pick a post, {name.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">
              Choose the template that resonates with you most
            </p>
          </div>

          <RadioGroup 
            value={selectedTemplateId || ""} 
            onValueChange={(val) => {
              setSelectedTemplateId(val)
              setCustomPost("")
            }}
            className="space-y-4"
          >
            <div>
              <RadioGroupItem
                value="__custom__"
                id="__custom__"
                className="peer sr-only"
              />
              <Label
                htmlFor="__custom__"
                className="flex cursor-pointer rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Write your own post
                    </span>
                    {selectedTemplateId === "__custom__" && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  {selectedTemplateId === "__custom__" ? (
                    <textarea
                      className="w-full min-h-40 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Write your LinkedIn post here..."
                      value={customPost}
                      onChange={(e) => setCustomPost(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Prefer writing your own post? Select this option.
                    </p>
                  )}
                </div>
              </Label>
            </div>

            {templates.map((template, index) => {
              const previewContent = template.content.replace(/\{\{NAME\}\}/g, name)
              return (
                <div key={template.id}>
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={template.id}
                    className="flex cursor-pointer rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Option {index + 1}
                        </span>
                        {selectedTemplateId === template.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {previewContent}
                      </p>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          <Button 
            className="w-full" 
            size="lg" 
            disabled={!selectedTemplateId || (selectedTemplateId === "__custom__" && !customPost.trim())}
            onClick={() => setStep("rate")}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Rating step
  if (step === "rate") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>How was the webinar?</CardTitle>
            <CardDescription>
              Your feedback helps us improve (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      rating && star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground hover:text-primary/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1" 
                onClick={() => setStep("copy")}
              >
                Skip
              </Button>
              <Button 
                className="flex-1" 
                disabled={!rating}
                onClick={() => setStep("copy")}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Copy step
  if (step === "copy") {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Your post is ready!</h1>
            <p className="text-muted-foreground">
              Copy it and share on LinkedIn
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div
                ref={previewRef}
                className="rounded-xl border bg-background p-6 shadow-sm"
                data-export="attendee-preview"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 font-bold">{name}</div>
                  {rating ? (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {personalizedPost}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {downloadError ? (
            <p className="text-sm text-destructive">{downloadError}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleCopyAndSubmit}
              disabled={loading}
            >
              {loading ? (
                <Spinner className="mr-2" />
              ) : copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={downloadPreview}
              disabled={loading}
            >
              Download Image
            </Button>
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => {
                handleCopyAndSubmit()
                openLinkedIn()
              }}
              disabled={loading}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Open LinkedIn
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Done step
  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Thanks, {name.split(" ")[0]}!</CardTitle>
            <CardDescription className="text-base">
              Your post has been copied. {"Don't forget to paste it on LinkedIn!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={openLinkedIn}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Open LinkedIn
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
