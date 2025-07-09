import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import initWebSocket from "./src/services/websocketService.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

initWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
