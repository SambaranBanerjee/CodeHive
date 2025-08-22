import { Server, Socket } from "socket.io";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔗 User connected:", socket.id);

    socket.on("chat:message", (msg) => {
      io.emit("chat:message", msg);
    });

    socket.on("project:update", (data) => {
      io.emit("project:update", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};