import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Users, Share2, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Vibe
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Turn Webinar Attendees into Brand Advocates
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Generate AI-powered LinkedIn post templates for your attendees. 
              Make it easy for them to share their experience and amplify your reach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">
                  Sign in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="text-muted-foreground mt-2">
              Three simple steps to turn attendees into advocates
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Generate Templates</CardTitle>
                <CardDescription>
                  Use AI to generate engaging LinkedIn post templates based on your webinar content
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. Share the Link</CardTitle>
                <CardDescription>
                  Send your unique link to attendees. They pick a template and personalize it with one click
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. Track Results</CardTitle>
                <CardDescription>
                  Monitor submissions and gather feedback to improve future webinars
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Why use Vibe?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Remove Design Paralysis</h3>
                    <p className="text-muted-foreground text-sm">
                      {"Pre-written templates mean attendees don't have to think about what to write"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered Content</h3>
                    <p className="text-muted-foreground text-sm">
                      Generate diverse, engaging posts tailored to your webinar
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Frictionless Sharing</h3>
                    <p className="text-muted-foreground text-sm">
                      One-click copy makes it effortless for attendees to share
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8">
              <div className="space-y-4">
                <div className="text-4xl font-bold">10x</div>
                <p className="text-muted-foreground">
                  More attendees share their experience when you make it easy for them
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to amplify your reach?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start turning your webinar attendees into brand advocates today.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 max-w-6xl text-center text-sm text-muted-foreground">
          <p>Built with Vibe - Turn attendees into advocates</p>
        </div>
      </footer>
    </div>
  )
}
