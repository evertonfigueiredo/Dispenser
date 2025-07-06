"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, Trash2, ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation } from "../../components/navigation"
import { useScheduling } from "../../hooks/use-scheduling"
import { cn } from "@/lib/utils"
import type { ScheduledCommand } from "../../types"
import { ptBR } from "date-fns/locale"

export default function SchedulingPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [editingCommand, setEditingCommand] = useState<string | null>(null)

  const { scheduledCommands, addScheduledCommand, removeScheduledCommand } = useScheduling()

  const handleSchedule = () => {
    if (!selectedChannel || !selectedDate || !selectedTime) {
      return
    }
    
    const success = addScheduledCommand(Number.parseInt(selectedChannel), selectedDate, selectedTime)

    if (success) {
      // Reset form
      setSelectedChannel("")
      setSelectedDate(undefined)
      setSelectedTime("")
    }
  }

  const handleEdit = (command: ScheduledCommand) => {
    setSelectedChannel(command.channel.toString())
    setSelectedDate(command.date)
    setSelectedTime(command.time)
    setEditingCommand(command.id)
  }

  const handleUpdate = () => {
    if (!selectedChannel || !selectedDate || !selectedTime || !editingCommand) {
      return
    }

    // Remove the old command
    removeScheduledCommand(editingCommand)

    // Add the updated command
    const success = addScheduledCommand(Number.parseInt(selectedChannel), selectedDate, selectedTime)

    if (success) {
      // Reset form and editing state
      setSelectedChannel("")
      setSelectedDate(undefined)
      setSelectedTime("")
      setEditingCommand(null)
    }
  }

  const handleCancelEdit = () => {
    setSelectedChannel("")
    setSelectedDate(undefined)
    setSelectedTime("")
    setEditingCommand(null)
  }

  const formatDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const dateTime = new Date(date)
    dateTime.setHours(hours, minutes, 0, 0)
    return format(dateTime, "PPP 'às' p", { locale: ptBR })
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Controle de Dispositivos
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Agendar Ativação de Canal</h1>
          <p className="text-muted-foreground">
            Agende quando canais específicos devem ser ativados. Defina a data e a hora para a ativação automática.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingCommand ? "Editar Agendamento" : "Novo Agendamento"}</CardTitle>
            <CardDescription>
              {editingCommand
                ? "Modifique a ativação agendada selecionada."
                : "Selecione um canal e agende quando ele deve ser ativado."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Channel Selection */}
              <div className="space-y-2">
                <Label htmlFor="channel">Canal</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 1 }, (_, i) => i + 1).map((channel) => (
                      <SelectItem key={channel} value={channel.toString()}>
                        Canal {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Data</Label>
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
                      {selectedDate ? format(selectedDate, "PPP") : "Escolha uma data"}
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
                <Label htmlFor="time">Hora</Label>
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

            <div className="flex gap-2">
              {editingCommand ? (
                <>
                  <Button onClick={handleUpdate} disabled={!selectedChannel || !selectedDate || !selectedTime}>
                    Atualizar Agendamento
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSchedule}
                  className="w-full md:w-auto"
                  disabled={!selectedChannel || !selectedDate || !selectedTime}
                >
                  Agendar Ativação
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Ativações Agendadas</CardTitle>
            <CardDescription>
              {scheduledCommands.length === 0
                ? "Nenhuma ativação agendada ainda."
                : `${scheduledCommands.length} ativação${scheduledCommands.length === 1 ? "" : "s"} agendadas.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledCommands.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Canal</TableHead>
                      <TableHead>Data & Hora Agendada</TableHead>
                      <TableHead>Tempo Até Ativação</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledCommands.map((command) => (
                      <TableRow key={command.id}>
                        <TableCell className="font-medium">Canal {command.channel}</TableCell>
                        <TableCell>{formatDateTime(command.date, command.time)}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              command.scheduledAt <= new Date()
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                            )}
                          >
                            {getTimeUntilActivation(command.scheduledAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(command)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeScheduledCommand(command.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma ativação agendada ainda.</p>
                <p className="text-sm">Agende sua primeira ativação de canal acima.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
