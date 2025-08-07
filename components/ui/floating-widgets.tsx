"use client"

import { useState } from "react"
import { Clock } from "./clock"
import { Calendar } from "./calendar"
import { CalendarDays, Clock as ClockIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

type WidgetType = 'clock' | 'calendar' | null

export function FloatingWidgets() {
  const [activeWidget, setActiveWidget] = useState<WidgetType>('clock')
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleWidget = (widget: WidgetType) => {
    if (activeWidget === widget) {
      setIsExpanded(!isExpanded)
    } else {
      setActiveWidget(widget)
      setIsExpanded(true)
    }
  }

  const closeWidget = () => {
    setIsExpanded(false)
  }

  return (
    <div className="fixed top-4 right-2 sm:top-6 sm:right-6 z-50">
      {/* Floating widget container */}
      <div className="flex items-start gap-3 sm:gap-6">
        {/* Expanded widget */}
        {isExpanded && activeWidget && (
          <div className="animate-in slide-in-from-right-4 sm:slide-in-from-left-4 duration-500 ease-out relative">
            <div className="transform transition-all duration-300 scale-75 sm:scale-100 origin-top-right">
              {activeWidget === 'clock' && <Clock />}
              {activeWidget === 'calendar' && <Calendar />}
            </div>
            
            {/* Close button */}
            <button
              onClick={closeWidget}
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-red-500/80 hover:bg-red-500 backdrop-blur-md border border-red-300/20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 z-10 touch-manipulation"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        )}

        {/* Widget toggle buttons */}
        <div className="flex flex-col gap-2 sm:gap-3 transition-all duration-300">
          {/* Clock button */}
          <button
            onClick={() => toggleWidget('clock')}
            className={cn(
              "w-10 h-10 sm:w-14 sm:h-14 backdrop-blur-md border rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg touch-manipulation",
              activeWidget === 'clock' && isExpanded
                ? "bg-purple-500/80 border-purple-300/40 shadow-purple-500/25"
                : "bg-black/60 border-white/20 hover:bg-white/10"
            )}
          >
            <ClockIcon className={cn(
              "w-4 h-4 sm:w-6 sm:h-6 transition-colors",
              activeWidget === 'clock' && isExpanded ? "text-white" : "text-white/80"
            )} />
          </button>

          {/* Calendar button */}
          <button
            onClick={() => toggleWidget('calendar')}
            className={cn(
              "w-10 h-10 sm:w-14 sm:h-14 backdrop-blur-md border rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg touch-manipulation",
              activeWidget === 'calendar' && isExpanded
                ? "bg-blue-500/80 border-blue-300/40 shadow-blue-500/25"
                : "bg-black/60 border-white/20 hover:bg-white/10"
            )}
          >
            <CalendarDays className={cn(
              "w-4 h-4 sm:w-6 sm:h-6 transition-colors",
              activeWidget === 'calendar' && isExpanded ? "text-white" : "text-white/80"
            )} />
          </button>
        </div>

        {/* Sparkle effects - positioned around the button area - Hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute top-0 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="hidden sm:block absolute bottom-2 right-0 w-1 h-1 bg-pink-400 rounded-full animate-pulse animation-delay-1000" />
        <div className="hidden sm:block absolute top-8 -right-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animation-delay-500" />
        
        {/* Floating glow effect around the buttons */}
        <div className="absolute top-0 right-0 w-12 h-24 sm:w-20 sm:h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl sm:rounded-3xl blur-2xl -z-10 animate-pulse" />
      </div>
    </div>
  )
}
