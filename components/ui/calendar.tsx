"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  className?: string
}

export function Calendar({ className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Day names
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  return (
    <div className={cn("relative animate-widget-slide-in animate-calendar-bounce", className)}>
      {/* Main calendar container */}
      <div className="w-80 bg-black/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="text-center">
            <h3 className="text-white text-xl font-bold tracking-tight">
              {monthNames[month]}
            </h3>
            <p className="text-white/60 text-sm font-medium">
              {year}
            </p>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-white/60 text-sm font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "relative h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-200",
                day === null
                  ? ""
                  : isToday(day)
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-110"
                  : "text-white/80 hover:bg-white/10 hover:scale-105 cursor-pointer"
              )}
            >
              {day && (
                <>
                  {day}
                  {isToday(day) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl animate-pulse" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Current date info */}
        <div className="mt-6 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="text-center">
            <p className="text-white/60 text-xs font-medium tracking-wider mb-1">
              TODAY
            </p>
            <p className="text-white text-2xl font-bold">
              {today.getDate()}
            </p>
            <p className="text-white/80 text-sm font-medium">
              {monthNames[today.getMonth()].slice(0, 3)} {today.getFullYear()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 w-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
    </div>
  )
}
