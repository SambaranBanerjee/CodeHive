import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import bodyparser from "body-parser";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { registerSocketHandlers } from "./socket";
import teamRoutes from "./modules/auth/teams/team.routes";
import projectRoutes from './modules/projects/projects.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());
app.use(bodyparser.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

// REST APIs
app.use("/api/auth", authRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/teams", teamRoutes);


// WebSocket
registerSocketHandlers(io);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
