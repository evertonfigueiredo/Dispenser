export interface DeviceStatus {
  channel: number
  isOn: boolean
  isLoading: boolean
}

export interface ScheduledCommand {
  id: string
  channel: number
  date: Date
  time: string
  scheduledAt: Date
}
