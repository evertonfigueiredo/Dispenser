import { WebSocketServer } from 'ws';
import fetch from "node-fetch";

const ESP_IP = process.env.ESP_IP;
const isDev = process.env.NODE_ENV === "development";

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Cliente conectado via WS");

    if (isDev) {
      const mockStatus = { estado: "ligado" };
      ws.send(JSON.stringify(mockStatus));
    } else {
      fetch(`${ESP_IP}/status`)
        .then(res => res.json())
        .then(status => ws.send(JSON.stringify(status)))
        .catch(err => console.error("Erro ao buscar status inicial:", err));
    }

    ws.on("message", async (message) => {
      const cmd = message.toString();
      if (!["ligar", "desligar"].includes(cmd)) return;

      if (isDev) {
        const mockStatus = { estado: cmd === "ligar" ? "ligado" : "desligado" };
        console.log(`[MOCK] Comando '${cmd}' recebido. Estado simulado:`, mockStatus);

        wss.clients.forEach(client => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(mockStatus));
          }
        });
      } else {
        try {
          const response = await fetch(`${ESP_IP}/${cmd}`);
          const status = await response.json();

          wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify(status));
            }
          });
        } catch (e) {
          console.error("Erro ao enviar comando real para ESP:", e);
        }
      }
    });
  });
}

export default initWebSocket;
