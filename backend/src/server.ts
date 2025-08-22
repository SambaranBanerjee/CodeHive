import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { registerSocketHandlers } from "./socket";
import teamRoutes from "./modules/auth/teams/team.routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

// REST APIs
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);

// WebSocket
registerSocketHandlers(io);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
