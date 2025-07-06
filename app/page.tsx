"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Navigation } from "../components/navigation"
import { DeviceBlock } from "../components/device-block"

interface Device {
  channel: number
  isOn: boolean
  isLoading: boolean
}

export default function DeviceControlPage() {
  const [devices, setDevices] = useState<Device[]>(
    Array.from({ length: 1 }, (_, i) => ({ channel: i + 1, isOn: false, isLoading: false }))
  )
  const [ready, setReady] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    const socket = new WebSocket("ws://192.168.1.11:4000")
    ws.current = socket

    socket.onopen = () => {
      // console.log("🟢 WebSocket conectado")
    }

    socket.onmessage = (event) => {
      // console.log("🔄 WS data:", event.data)
      try {
        const data = JSON.parse(event.data) // ex: { estado1: "ligado", estado2: "desligado" }
        // console.log("Estado do ESP:", data)
        setDevices((prev) =>
          prev.map((device) => {
            const key = `estado`
            if (data.hasOwnProperty(key)) {
              return { ...device, isOn: data[key] === "ligado", isLoading: false }
            }
            return device
          })
        )

        setReady(true)
      } catch (err) {
        console.error("Erro ao interpretar status:", err)
      }
    }

    socket.onerror = () => console.error("❌ WebSocket erro")
    socket.onclose = () => {
      // console.warn("⚠️ WS desconectado. Tentando reconectar...")
      setTimeout(connectWebSocket, 3000)
    }
  }

  useEffect(() => {
    connectWebSocket()
  }, [])

  const toggleDevice = (channel: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setDevices((prev) =>
        prev.map((device) =>
          device.channel === channel ? { ...device, isLoading: true } : device
        )
      )

      const current = devices.find((d) => d.channel === channel)
      if (!current) return
      const comando = current.isOn ? `desligar` : `ligar`
      // console.log("🔼 Enviando comando:", comando)
      ws.current.send(comando)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Controle de Dispositivos
          </h1>
          <p className="text-muted-foreground">
            Controle seus dispositivos ligando ou desligando canais em tempo real.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Visão Geral do Status dos Canais</CardTitle>
            <CardDescription>
              {devices.filter((d) => d.isOn).length} de {devices.length} canais estão
              atualmente ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {devices.map((device) => (
                <div
                  key={device.channel}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    device.isOn
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  )}
                >
                  Ch{device.channel}: {device.isOn ? "ON" : "OFF"}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!ready ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-ping h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></div>
                    <div className="animate-ping h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></div>
                    <div className="animate-ping h-2.5 w-2.5 rounded-full bg-gray-500"></div>
                  </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {devices.map((device) => (
              <DeviceBlock
                key={device.channel}
                device={device}
                onToggle={toggleDevice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
