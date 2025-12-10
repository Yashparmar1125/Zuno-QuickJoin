import "dotenv/config";
import http from "http";
import app, { allowedOrigins } from "./app.js";
import connectDB from "./config/db.js";
import setupSocket from "./Socket/socket.server.js";
import config from "./config/config.js";

const PORT = config.port || 5000;

const start = async () => {
  config.validateConfig();
  await connectDB();

  const server = http.createServer(app);
  setupSocket(server, allowedOrigins);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Socket.IO Signaling Server Ready");
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
