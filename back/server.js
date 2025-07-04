const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const ESP_IP = "http://192.168.1.5";
const PORT = 4000;

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Rota HTTP para verificar status do ESP
app.get("/status", async (req, res) => {
  try {
    const r = await fetch(`${ESP_IP}/status`);
    const status = await r.json(); // espera JSON como: { "estado": "ligado" }
    res.json(status);
  } catch (e) {
    res.status(500).json({ erro: "Erro ao consultar status do ESP" });
  }
});

// WebSocket: conexão e mensagens
wss.on("connection", (ws) => {
  console.log("Cliente conectado via WS");

  // Envia o status atual ao novo cliente (em JSON)
  fetch(`${ESP_IP}/status`)
    .then((res) => res.json())
    .then((status) => {
      console.log("Enviando estado inicial:", status);
      ws.send(JSON.stringify(status)); // envia { "estado": "ligado" }
    })
    .catch((err) => {
      console.error("Erro ao buscar status inicial:", err);
    });

  // Quando um cliente envia "ligar" ou "desligar"
  ws.on("message", async (message) => {
    const msg = message.toString();

    if (msg === "ligar" || msg === "desligar") {
      const url = `${ESP_IP}/${msg}`;
      console.log(`Comando recebido: ${msg}. Enviando para ESP: ${url}`);

      try {
        fetch(url)
          .then((res) => res.json())
          .then((status) => {
            console.log("Enviando o status:", status);
            const payload = JSON.stringify(status)
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(payload); // ← envia para todos os clientes conectados
              }
            });
          });

        // Envia o novo status após o comando
      } catch (e) {
        console.error("Erro ao enviar comando:", e);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0',() => {
  console.log(`Servidor WebSocket + HTTP rodando em http://localhost:${PORT}`);
});
