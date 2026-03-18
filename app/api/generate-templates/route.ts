import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const templateSchema = z.object({
  templates: z.array(z.string())
})

const systemInstruction =
  "You are an expert B2B LinkedIn copywriter and social media strategist. Your task is to write highly engaging, authentic LinkedIn post templates from the perspective of a webinar attendee. The attendee has just finished a highly valuable session and wants to share their key takeaways with their professional network. Your tone must be professional yet conversational, enthusiastic, and insightful. Avoid overly corporate jargon, spammy emojis, or sounding like a robotic advertisement. The posts must sound like a real person wrote them to share genuine value with their connections. Do not include placeholders for images; focus entirely on the text."

function stripThinkBlocks(input: string) {
  return input.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
}

function extractFirstJsonObject(input: string) {
  const cleaned = stripThinkBlocks(input)
  const start = cleaned.indexOf("{")
  if (start === -1) return null

  let depth = 0
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (ch === "{") depth++
    if (ch === "}") depth--
    if (depth === 0) {
      return cleaned.slice(start, i + 1)
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const { webinarId, count = 5, model = "openai/gpt-4o-mini" } = await req.json()
    const safeCount = Math.min(10, Math.max(1, Number.isFinite(count) ? count : 5))
    
    const supabase = await createClient()
    
    // Get user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get webinar details
    const { data: webinar, error: webinarError } = await supabase
      .from("webinars")
      .select("*")
      .eq("id", webinarId)
      .eq("host_id", user.id)
      .single()

    if (webinarError || !webinar) {
      return Response.json({ error: "Webinar not found" }, { status: 404 })
    }

    const hashtags = webinar.hashtags ?? ""
    const description = webinar.description ?? ""

    const userPrompt = `Generate exactly ${safeCount} distinct LinkedIn post variations based on the following webinar details provided by the host.

Webinar Information:
- Title: ${webinar.title}
- Description & Takeaways: ${description}
- Required Hashtags: ${hashtags}

Rules for the Posts:
1. Write from the first-person perspective ('I', 'my') of an attendee who just finished this exact webinar.
2. Each variation must have a different hook (opening line) to grab attention.
3. Each variation must highlight a slightly different aspect of the provided description.
4. Include all the required hashtags naturally at the end of the post.
5. Keep the formatting clean with proper spacing.

CRITICAL OUTPUT FORMAT:
- Output must start with '{' as the first character.
- Respond with STRICT valid JSON and NOTHING ELSE.
- No preamble, no explanation, no markdown, no code fences.
- Return ONLY: {"templates": ["...", "..."]}
Example:
{"templates": ["Post text 1...", "Post text 2..."]}`

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 },
      )
    }

    // Call OpenRouter (OpenAI-compatible)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 180_000)

    const payload = {
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_TITLE || "Webinar Template Generator",
      },
      body: JSON.stringify(payload),
    }).finally(() => clearTimeout(timeout))

    if (!response.ok) {
      const errorText = await response.text()
      return Response.json(
        { error: "OpenRouter request failed", details: errorText },
        { status: 502 },
      )
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ""

    if (!text) {
      return Response.json(
        { error: "OpenRouter returned empty response" },
        { status: 502 },
      )
    }

    const jsonText = extractFirstJsonObject(text)
    if (!jsonText) {
      return Response.json(
        {
          error:
            "LLM returned non-JSON output. Please try again. If the issue persists, reduce template count or adjust the webinar description.",
        },
        { status: 502 },
      )
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      return Response.json(
        {
          error:
            "LLM returned non-JSON output. Please try again. If the issue persists, reduce template count or adjust the webinar description.",
        },
        { status: 502 },
      )
    }

    const validated = templateSchema.safeParse(parsed)
    if (!validated.success) {
      return Response.json(
        { error: "LLM returned invalid JSON shape" },
        { status: 502 },
      )
    }

    // Save templates to database
    const templatesToInsert = validated.data.templates.map((content) => ({
      webinar_id: webinarId,
      content,
      is_approved: false,
    }))

    const { data: insertedTemplates, error: insertError } = await supabase
      .from("post_templates")
      .insert(templatesToInsert)
      .select()

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ templates: insertedTemplates })
  } catch (error) {
    console.error("Error generating templates:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
