"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function TogglePage() {
  const [isOn, setIsOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const socket = new WebSocket("ws://192.168.1.11:4000");
    ws.current = socket;

    socket.onopen = () => {
      console.log("🟢 Conectado ao WebSocket");
    };

    socket.onmessage = (event) => {
      console.log("🔄 Mensagem recebida do WebSocket:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.estado === "ligado") setIsOn(true);
        else if (data.estado === "desligado") setIsOn(false);

        setReady(true);
        setDisabled(false);
      } catch (err) {
        console.error("Erro ao interpretar JSON do WebSocket:", err);
      }
    };

    socket.onerror = () => console.error("Erro no WebSocket");
    socket.onclose = () => {
      console.warn("WebSocket desconectado. Tentando reconectar...");
      setTimeout(connectWebSocket, 3000);
    };
  };

  useEffect(() => {
    connectWebSocket();
  }, []);

  const handleToggle = (checked: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const comando = checked ? "ligar" : "desligar";
      console.log("🔼 Enviando comando via WS:", comando);
      ws.current.send(comando);
      setDisabled(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Controle em Tempo Real</h1>

      {!ready ? (
        <p className="text-gray-500 animate-pulse">Conectando...</p>
      ) : (
        <div className="flex items-center space-x-2">
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
          <span>{isOn ? "Ligado" : "Desligado"}</span>
        </div>
      )}
    </div>
  );
}
