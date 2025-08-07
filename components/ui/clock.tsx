"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ClockProps {
  className?: string
  timezone?: string
  label?: string
}

export function Clock({ className }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null
  }

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Create tick marks for the clock face
  const tickMarks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6) - 90 // 6 degrees per minute mark, start from top
    const isHour = i % 5 === 0
    const length = isHour ? 8 : 4
    const thickness = isHour ? 2 : 1
    const opacity = isHour ? 0.8 : 0.4

    return (
      <line
        key={i}
        x1={50 + (40 - length) * Math.cos(angle * Math.PI / 180)}
        y1={50 + (40 - length) * Math.sin(angle * Math.PI / 180)}
        x2={50 + 40 * Math.cos(angle * Math.PI / 180)}
        y2={50 + 40 * Math.sin(angle * Math.PI / 180)}
        stroke="white"
        strokeWidth={thickness}
        opacity={opacity}
      />
    )
  })

  // Calculate hand positions
  const secondAngle = (seconds * 6) - 90
  const minuteAngle = (minutes * 6 + seconds * 0.1) - 90
  const hourAngle = (hours * 30 + minutes * 0.5) - 90

  return (
    <div className={cn("relative animate-widget-slide-in animate-widget-float", className)}>
      {/* Main clock container */}
      <div className="relative w-28 h-28 bg-black/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl animate-clock-glow">
        {/* Top city label */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-medium tracking-wider">
          KOL
        </div>
        
        {/* Clock face */}
        <div className="absolute inset-2 rounded-2xl bg-black/60 backdrop-blur-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Tick marks */}
            {tickMarks}
            
            {/* Hour hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 25 * Math.cos(hourAngle * Math.PI / 180)}
              y2={50 + 25 * Math.sin(hourAngle * Math.PI / 180)}
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
            
            {/* Minute hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 35 * Math.cos(minuteAngle * Math.PI / 180)}
              y2={50 + 35 * Math.sin(minuteAngle * Math.PI / 180)}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            
            {/* Second hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 38 * Math.cos(secondAngle * Math.PI / 180)}
              y2={50 + 38 * Math.sin(secondAngle * Math.PI / 180)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeLinecap="round"
            />
            
            {/* Center dot */}
            <circle
              cx="50"
              cy="50"
              r="2"
              fill="white"
            />
          </svg>
        </div>
        
        {/* Digital time display */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="text-white text-2xl font-bold tracking-tight leading-none">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
    </div>
  )
}
