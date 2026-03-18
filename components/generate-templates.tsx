"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Sparkles } from "lucide-react"

interface GenerateTemplatesProps {
  webinarId: string
  webinar: {
    title: string
    description: string | null
    hashtags: string | null
  }
}

export function GenerateTemplates({ webinarId, webinar }: GenerateTemplatesProps) {
  const [count, setCount] = useState("5")
  const [model, setModel] = useState("openai/gpt-4o-mini")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webinarId, count: parseInt(count), model }),
      })

      const data = await response.json()

      if (!response.ok) {
        const msg =
          typeof data?.details === "string" && data.details.length
            ? `${data.error || "Failed to generate templates"}: ${data.details}`
            : data.error || "Failed to generate templates"
        throw new Error(msg)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Generate Post Templates
        </CardTitle>
        <CardDescription>
          Use AI to generate LinkedIn post templates for your attendees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">AI Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (Fast & Affordable)</SelectItem>
                <SelectItem value="openai/gpt-4o">GPT-4o (Premium)</SelectItem>
                <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="google/gemini-pro-1.5">Gemini Pro 1.5</SelectItem>
                <SelectItem value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</SelectItem>
                <SelectItem value="meta-llama/llama-3.2-3b-instruct">Llama 3.2 3B (Fast)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of templates</label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Templates
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
