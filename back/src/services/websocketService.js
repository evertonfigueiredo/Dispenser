import { WebSocketServer } from "ws";
import fetch from "node-fetch";

const ESP_IP = process.env.ESP_IP;
const isDev = process.env.NODE_ENV === "development";

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Cliente conectado via WS");

    // Envia status inicial
    if (isDev) {
      const mockStatus = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        status: "off",
      }));
      ws.send(JSON.stringify(mockStatus));
    } else {
      fetch(`${ESP_IP}/status`)
        .then((res) => res.json())
        .then((status) => ws.send(JSON.stringify(status)))
        .catch((err) => console.error("Erro ao buscar status inicial:", err));
    }

    // Escuta mensagens de comando
    ws.on("message", async (message) => {
      const msg = message.toString(); // exemplo: "ligar?id=3"
      const [acao, query] = msg.split("?"); // "ligar", "id=3"

      if (!["ligar", "desligar"].includes(acao)) return;

      const params = new URLSearchParams(query);
      const id = params.get("id");

      if (!id) {
        console.warn("Comando recebido sem ID:", msg);
        return;
      }

      if (isDev) {
        const mockStatus = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          status: i + 1 === parseInt(id) ? (acao === "ligar" ? "on" : "off") : "off",
        }));

        console.log(`[MOCK] Comando '${acao}' recebido para ID ${id}.`);

        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(mockStatus));
          }
        });
      } else {
        try {
          const response = await fetch(`${ESP_IP}/${acao}?id=${id}`);
          const status = await response.json();
          
          wss.clients.forEach((client) => {
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
