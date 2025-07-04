"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { DeviceStatus } from "../types"

export function useDeviceControl() {
  const [devices, setDevices] = useState<DeviceStatus[]>(
    Array.from({ length: 10 }, (_, i) => ({
      channel: i + 1,
      isOn: false,
      isLoading: false,
    })),
  )

  const updateDeviceStatus = useCallback((channel: number, isOn: boolean, isLoading: boolean) => {
    setDevices((prev) => prev.map((device) => (device.channel === channel ? { ...device, isOn, isLoading } : device)))
  }, [])

  const toggleDevice = useCallback(
    async (channel: number, turnOn: boolean) => {
      updateDeviceStatus(channel, devices.find((d) => d.channel === channel)?.isOn || false, true)

      try {
        const endpoint = turnOn ? `/ligar_${channel}` : `/desligar_${channel}`

        // Simulate API call
        const response = await fetch(endpoint, { method: "GET" })

        if (response.ok) {
          updateDeviceStatus(channel, turnOn, false)
          toast("Success", {
            description: `Channel ${channel} ${turnOn ? "turned on" : "turned off"} successfully.`,
          })
        } else {
          throw new Error("Failed to update device")
        }
      } catch (error) {
        updateDeviceStatus(channel, !turnOn, false)
        toast("Error", {
          description: `Failed to ${turnOn ? "turn on" : "turn off"} channel ${channel}.`,
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        })
      }
    },
    [devices, updateDeviceStatus],
  )

  return { devices, toggleDevice }
}
