"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface ShareLinkCopyProps {
  slug: string
}

export function ShareLinkCopy({ slug }: ShareLinkCopyProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/w/${slug}`
    : `/w/${slug}`

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={copyShareLink}>
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copy Link
        </>
      )}
    </Button>
  )
}
