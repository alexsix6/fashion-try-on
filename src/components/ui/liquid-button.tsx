"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidButtonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-white",
        space: "bg-transparent hover:scale-105 duration-300 transition text-purple-100 hover:text-purple-50",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "space",
      size: "xl",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        data-slot="button"
        className={cn(
          "relative",
          liquidButtonVariants({ variant, size, className })
        )}
        ref={ref}
        {...props}
      >
        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-md
            shadow-[0_0_6px_rgba(139,92,246,0.15),0_2px_6px_rgba(139,92,246,0.25),inset_3px_3px_0.5px_-3px_rgba(167,139,250,0.4),inset_-3px_-3px_0.5px_-3px_rgba(167,139,250,0.3),inset_1px_1px_1px_-0.5px_rgba(196,181,253,0.6),inset_-1px_-1px_1px_-0.5px_rgba(196,181,253,0.6),inset_0_0_6px_6px_rgba(139,92,246,0.12),inset_0_0_2px_2px_rgba(139,92,246,0.06),0_0_12px_rgba(139,92,246,0.3)]
        transition-all
        hover:shadow-[0_0_8px_rgba(139,92,246,0.25),0_2px_8px_rgba(139,92,246,0.35),inset_3px_3px_0.5px_-3.5px_rgba(167,139,250,0.5),inset_-3px_-3px_0.5px_-3.5px_rgba(167,139,250,0.4),inset_1px_1px_1px_-0.5px_rgba(196,181,253,0.7),inset_-1px_-1px_1px_-0.5px_rgba(196,181,253,0.7),inset_0_0_6px_6px_rgba(139,92,246,0.15),inset_0_0_2px_2px_rgba(139,92,246,0.08),0_0_20px_rgba(139,92,246,0.4)]" />
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md bg-gradient-to-br from-purple-500/20 to-violet-600/30 backdrop-blur-sm"
          style={{ backdropFilter: 'url("#container-glass")' }}
        />

        <div className="pointer-events-none z-10 flex items-center justify-center gap-2">
          {children}
        </div>
        <GlassFilter />
      </button>
    )
  }
)

LiquidButton.displayName = "LiquidButton"

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { LiquidButton, liquidButtonVariants }
