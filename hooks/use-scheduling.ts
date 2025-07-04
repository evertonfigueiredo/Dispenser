"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { ScheduledCommand } from "../types"

export function useScheduling() {
  const [scheduledCommands, setScheduledCommands] = useState<ScheduledCommand[]>([])

  const addScheduledCommand = useCallback(
    (channel: number, date: Date, time: string) => {
      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const scheduledDateTime = new Date(date)
      scheduledDateTime.setHours(hours, minutes, 0, 0)
      
      // Check if scheduling in the past
      if (scheduledDateTime <= new Date()) {
        toast("Invalid Time", {
          description: "Não é possível agendar a ativação no passado.",
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        })
        return false
      }

      // Check for duplicate scheduling
      const isDuplicate = scheduledCommands.some(
        (cmd) => cmd.channel === channel && cmd.scheduledAt.getTime() === scheduledDateTime.getTime(),
      )

      if (isDuplicate) {
        toast("Duplicate Schedule", {
          description: `Channel ${channel} is already scheduled for this date and time.`,
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        })
        return false
      }

      const newCommand: ScheduledCommand = {
        id: Date.now().toString(),
        channel,
        date,
        time,
        scheduledAt: scheduledDateTime,
      }

      setScheduledCommands((prev) =>
        [...prev, newCommand].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()),
      )

      toast("Schedule Added", {
          description: `Channel ${channel} scheduled for activation.`,
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        })

      return true
    },
    [scheduledCommands],
  )

  const removeScheduledCommand = useCallback((id: string) => {
    setScheduledCommands((prev) => prev.filter((cmd) => cmd.id !== id))
    toast(
      "Schedule Removed", {
      description: "Scheduled command has been removed.",
      action: {
        label: "Close",
        onClick: () => console.log("Close"),
      },
    })
  }, [])

  return {
    scheduledCommands,
    addScheduledCommand,
    removeScheduledCommand,
  }
}
