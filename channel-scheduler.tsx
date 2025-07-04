"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ScheduledActivation {
  id: string
  channel: number
  date: Date
  time: string
  scheduledAt: Date
}

export default function ChannelScheduler() {
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [scheduledActivations, setScheduledActivations] = useState<ScheduledActivation[]>([])

  const handleSchedule = () => {
    if (!selectedChannel || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a channel, date, and time.",
        variant: "destructive",
      })
      return
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const scheduledDateTime = new Date(selectedDate)
    scheduledDateTime.setHours(hours, minutes, 0, 0)

    // Check if the scheduled time is in the future
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Time",
        description: "Please select a future date and time.",
        variant: "destructive",
      })
      return
    }

    const newActivation: ScheduledActivation = {
      id: Date.now().toString(),
      channel: Number.parseInt(selectedChannel),
      date: selectedDate,
      time: selectedTime,
      scheduledAt: scheduledDateTime,
    }

    setScheduledActivations((prev) =>
      [...prev, newActivation].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()),
    )

    // Reset form
    setSelectedChannel("")
    setSelectedDate(undefined)
    setSelectedTime("")

    toast({
      title: "Activation Scheduled",
      description: `Channel ${newActivation.channel} scheduled for ${format(scheduledDateTime, "PPP 'at' p")}`,
    })
  }

  const handleDelete = (id: string) => {
    setScheduledActivations((prev) => prev.filter((activation) => activation.id !== id))
    toast({
      title: "Schedule Removed",
      description: "The scheduled activation has been removed.",
    })
  }

  const formatDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const dateTime = new Date(date)
    dateTime.setHours(hours, minutes, 0, 0)
    return format(dateTime, "PPP 'at' p")
  }

  const getTimeUntilActivation = (scheduledAt: Date) => {
    const now = new Date()
    const diff = scheduledAt.getTime() - now.getTime()

    if (diff <= 0) return "Overdue"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Channel Activation</CardTitle>
          <CardDescription>Select a channel and schedule when it should be activated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel Selection */}
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((channel) => (
                    <SelectItem key={channel} value={channel.toString()}>
                      Channel {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSchedule}
            className="w-full md:w-auto"
            disabled={!selectedChannel || !selectedDate || !selectedTime}
          >
            Schedule Activation
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Activations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Activations</CardTitle>
          <CardDescription>
            {scheduledActivations.length === 0
              ? "No activations scheduled yet."
              : `${scheduledActivations.length} activation${scheduledActivations.length === 1 ? "" : "s"} scheduled.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledActivations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Scheduled Date & Time</TableHead>
                    <TableHead>Time Until Activation</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledActivations.map((activation) => (
                    <TableRow key={activation.id}>
                      <TableCell className="font-medium">Channel {activation.channel}</TableCell>
                      <TableCell>{formatDateTime(activation.date, activation.time)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            activation.scheduledAt <= new Date()
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                          )}
                        >
                          {getTimeUntilActivation(activation.scheduledAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(activation.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No scheduled activations yet.</p>
              <p className="text-sm">Schedule your first channel activation above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
