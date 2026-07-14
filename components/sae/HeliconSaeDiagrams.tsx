"use client"
import { useEffect, useState } from "react"
import { ParallelStreamsCard } from "./ParallelStreamsCard"
import { BlockRelationship } from "./UnderTheHood"
import { Colors } from "./types"

// The two SAE diagrams used in the Helicon blog post, rendered live (instead of
// static PNGs) so they match the Streaming Asynchronous Execution doc. Theme
// detection mirrors TransactionLifecycle: the mobile toggle mutates the DOM
// class directly, so we watch <html> rather than relying only on next-themes.
export function HeliconSaeDiagrams() {
  const [mounted, setMounted] = useState(false)
  const [domTheme, setDomTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    setMounted(true)
    setDomTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  useEffect(() => {
    if (!mounted) return
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          setDomTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [mounted])

  const isDark = !mounted || domTheme === "dark"

  const colors: Colors = {
    bg: "bg-transparent",
    text: isDark ? "text-white" : "text-black",
    textMuted: isDark ? "text-white/50" : "text-black/50",
    textFaint: isDark ? "text-white/20" : "text-black/20",
    border: isDark ? "border-white/10" : "border-black/10",
    borderStrong: isDark ? "border-white/30" : "border-black/30",
    blockBg: isDark ? "bg-white/5" : "bg-black/5",
    blockBgStrong: isDark ? "bg-white/10" : "bg-black/10",
    blockSolid: isDark ? "bg-white" : "bg-black",
    blockFaint: isDark ? "bg-white/20" : "bg-black/20",
    stroke: isDark ? "#ffffff" : "#000000",
  }

  return (
    <div className="my-8 flex flex-col gap-10">
      <div className="overflow-x-auto">
        <ParallelStreamsCard colors={colors} />
      </div>
      <div className="overflow-x-auto">
        <BlockRelationship colors={colors} />
      </div>
    </div>
  )
}
