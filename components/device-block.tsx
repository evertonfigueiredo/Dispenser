"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Power, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "../types";

interface DeviceBlockProps {
  device: DeviceStatus;
  onToggle: (channel: number, turnOn: boolean) => void;
}

export function DeviceBlock({ device, onToggle }: DeviceBlockProps) {
  const handleSwitchChange = (checked: boolean) => {
    onToggle(device.channel, checked);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        device.isOn
          ? "border-green-500 bg-green-50 dark:bg-green-950"
          : "border-gray-200"
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Canal {device.channel}</span>
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              device.isOn
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500"
            )}
          >
            <Power className="h-4 w-4" />
            {device.isOn ? "ON" : "OFF"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`switch-${device.channel}`}
            className="text-sm font-medium"
          >
            {device.isOn ? "Desligar" : "Ligar"}
          </Label>
          <div className="flex items-center gap-2">
            {device.isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id={`switch-${device.channel}`}
              checked={device.isOn}
              onCheckedChange={handleSwitchChange}
              disabled={device.isLoading}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {device.isLoading
            ? "Processando..."
            : `Canal ${device.channel} está ${
                device.isOn ? "ativo" : "inativo"
              }`} 
        </div>
      </CardContent>
    </Card>
  );
}
