"use client"

import { useEffect, useState } from "react"

interface ZipperVisualProps {
  forcedIsAnalyzing?: boolean
}

export function ZipperVisual({ forcedIsAnalyzing }: ZipperVisualProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (forcedIsAnalyzing !== undefined) {
      setIsAnalyzing(forcedIsAnalyzing)
      return
    }
    const interval = setInterval(() => {
      setIsAnalyzing((prev) => !prev)
    }, 2400)
    return () => clearInterval(interval)
  }, [forcedIsAnalyzing])

  return (
    <section className="flex items-center justify-center px-6 py-10" aria-label="Chat analysis visual">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
        <div
          className="absolute inset-3 rounded-full transition-all duration-1000"
          style={{
            background: isAnalyzing
              ? "radial-gradient(circle, rgba(254,229,0,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(254,229,0,0.04) 0%, transparent 70%)",
          }}
        />

        <svg
          viewBox="0 0 160 160"
          className="relative w-36 h-36"
          aria-hidden="true"
        >
          {/* Chat bubble body */}
          <rect
            x="24"
            y="28"
            width="88"
            height="68"
            rx="16"
            className="fill-secondary stroke-border"
            strokeWidth="1.5"
          />
          {/* Chat bubble tail */}
          <path
            d="M 40 96 L 32 112 L 56 96"
            className="fill-secondary stroke-border"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Chat lines - animated */}
          <rect
            x="38"
            y="46"
            width="48"
            height="5"
            rx="2.5"
            className="transition-all duration-700"
            style={{
              fill: isAnalyzing ? "#FEE500" : "#555555",
              opacity: isAnalyzing ? 1 : 0.5,
            }}
          />
          <rect
            x="38"
            y="57"
            width="36"
            height="5"
            rx="2.5"
            className="transition-all duration-700 delay-100"
            style={{
              fill: isAnalyzing ? "#FEE500" : "#555555",
              opacity: isAnalyzing ? 0.8 : 0.4,
            }}
          />
          <rect
            x="38"
            y="68"
            width="54"
            height="5"
            rx="2.5"
            className="transition-all duration-700 delay-200"
            style={{
              fill: isAnalyzing ? "#FEE500" : "#555555",
              opacity: isAnalyzing ? 0.6 : 0.3,
            }}
          />
          <rect
            x="38"
            y="79"
            width="28"
            height="5"
            rx="2.5"
            className="transition-all duration-700 delay-300"
            style={{
              fill: isAnalyzing ? "#FEE500" : "#555555",
              opacity: isAnalyzing ? 0.5 : 0.25,
            }}
          />

          {/* Magnifying glass - positioned over the chat bubble */}
          <g
            className="transition-transform duration-1000 ease-in-out"
            style={{
              transform: isAnalyzing
                ? "translate(4px, -4px) rotate(-5deg)"
                : "translate(0px, 0px) rotate(0deg)",
              transformOrigin: "120px 90px",
            }}
          >
            {/* Glass circle */}
            <circle
              cx="108"
              cy="58"
              r="26"
              className="transition-all duration-700"
              fill="none"
              stroke="#FEE500"
              strokeWidth="3.5"
              style={{
                filter: isAnalyzing ? "drop-shadow(0 0 6px rgba(254,229,0,0.5))" : "none",
              }}
            />
            {/* Glass fill (lens) */}
            <circle
              cx="108"
              cy="58"
              r="24"
              className="transition-all duration-700"
              style={{
                fill: isAnalyzing
                  ? "rgba(254,229,0,0.08)"
                  : "rgba(254,229,0,0.03)",
              }}
            />
            {/* Lens shine */}
            <ellipse
              cx="100"
              cy="48"
              rx="8"
              ry="5"
              fill="rgba(255,255,255,0.06)"
              className="transition-opacity duration-700"
              style={{ opacity: isAnalyzing ? 1 : 0.4 }}
            />
            {/* Handle */}
            <line
              x1="126"
              y1="78"
              x2="142"
              y2="98"
              stroke="#FEE500"
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{
                filter: isAnalyzing ? "drop-shadow(0 0 4px rgba(254,229,0,0.4))" : "none",
              }}
            />
          </g>

          {/* Scan line effect */}
          {isAnalyzing && (
            <rect
              x="30"
              y="0"
              width="76"
              height="2"
              rx="1"
              fill="#FEE500"
              opacity="0.6"
              className="animate-scan-line"
            />
          )}
        </svg>
      </div>
    </section>
  )
}
