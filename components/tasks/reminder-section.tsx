"use client"

import { useState, useEffect } from "react"
import { Bell, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTaskStore } from "@/lib/store/task-store"
import { soundManager } from "@/lib/sounds"

interface Reminder {
  id: string
  text: string
  date: string
  time: string
}

interface ReminderSectionProps {
  className?: string
}

export function ReminderSection({ className }: ReminderSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReminder, setNewReminder] = useState({ text: "", date: "", time: "09:00" })
  const { addTask } = useTaskStore()

  // Load reminders from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('task-reminders')
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('task-reminders', JSON.stringify(reminders))
  }, [reminders])

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const dueReminders = reminders.filter(reminder => {
        const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`)
        const timeDiff = reminderDateTime.getTime() - now.getTime()
        // Check if reminder is due (within 1 minute)
        return timeDiff <= 60000 && timeDiff > 0
      })

      dueReminders.forEach(async (reminder) => {
        // Play reminder sound
        soundManager.playReminderAlert()
        
        // Create task in present section
        await addTask(reminder.text, "present")
        
        // Remove the reminder
        setReminders(prev => prev.filter(r => r.id !== reminder.id))
        
        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Task Reminder', {
            body: `Time for: ${reminder.text}`,
            icon: '/favicon.ico'
          })
        }
      })
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    checkReminders() // Check immediately

    return () => clearInterval(interval)
  }, [reminders, addTask])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const addReminder = () => {
    if (newReminder.text && newReminder.date) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        text: newReminder.text,
        date: newReminder.date,
        time: newReminder.time || "09:00",
      }
      setReminders([...reminders, reminder])
      setNewReminder({ text: "", date: "", time: "09:00" })
      setShowAddForm(false)
    }
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className={cn("bg-slate-800/40 border-slate-600/30 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-medium text-white">Reminders</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-3 p-3 bg-slate-700/40 rounded-lg border border-slate-600/30">
            <Input
              placeholder="Reminder text..."
              value={newReminder.text}
              onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
              className="mb-2 bg-slate-600/50 border-slate-500/50 text-white placeholder:text-slate-400"
            />
            <div className="flex gap-2 mb-2">
              <Input
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                className="flex-1 bg-slate-600/50 border-slate-500/50 text-white"
              />
              <Input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                className="w-24 bg-slate-600/50 border-slate-500/50 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={addReminder}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600/20 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs text-white font-medium">{reminder.text}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(reminder.date)} at {reminder.time}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteReminder(reminder.id)}
                className="h-5 w-5 p-0 text-slate-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {reminders.length === 0 && !showAddForm && (
          <div className="text-center py-4 text-slate-400">
            <p className="text-xs">No reminders set</p>
            <p className="text-xs mt-1">Click + to add one</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 