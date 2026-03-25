const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // IMPORTANT for Render
const port = process.env.PORT || 3000;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // 👈 MUST SET IN ENV

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {

    // ✅ Health check (Render needs this)
    if (req.url === "/health") {
      res.writeHead(200);
      res.end("OK");
      return;
    }

    // ✅ Internal emit API
    if (req.method === 'POST' && req.url === '/api/internal/emit') {
      let body = '';

      req.on('data', chunk => body += chunk);

      req.on('end', () => {
        try {
          const payload = JSON.parse(body);

          console.log("📡 Internal Emit:", payload);

          if (payload.event === 'receive_message') {
            io.to(payload.groupId).emit("receive_message", payload.data);
          } else if (payload.event === 'trip_state_updated') {
            io.to(payload.groupId).emit("trip_state_updated");
          } else if (payload.event === 'expenses_updated') {
            io.to(payload.groupId).emit("expenses_updated");
          }

          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          console.error("❌ Emit error:", e);
          res.writeHead(400);
          res.end();
        }
      });

      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // ✅ Socket.IO setup
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // tighten later
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // support both
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ✅ Join group
    socket.on("join_group", (groupId) => {
      socket.join(groupId);
      console.log(`👥 ${socket.id} joined ${groupId}`);
    });

    // ✅ Send message
    socket.on("send_message", async (data) => {
      console.log("📩 Message received:", data);

      // 🔥 IMPORTANT: send to ALL (including sender)
      io.to(data.groupId).emit("receive_message", data);

      try {
        if (data.senderId === "ai-system") return;

      // 1. Try to Save message (Don't let this block AI trigger)
      try {
        if (data.senderId !== "ai-system") {
           fetch(`${BASE_URL}/api/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).catch(err => console.error("❌ DB save fetch failed:", err.message));
        }
      } catch (err) {
        console.error("❌ DB save error:", err.message);
      }
      
      // 2. AI trigger
      if (
        (data.type === "ai_prompt" || data.content?.toLowerCase().includes("@ai")) &&
        data.senderId !== "ai-system"
      ) {
          console.log(`🤖 AI Trigger: Attempting to call ${BASE_URL}/api/ai/process...`);
          fetch(`${BASE_URL}/api/ai/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
            .then(async (res) => {
              if (!res.ok) {
                const text = await res.text();
                console.error(`❌ AI API Error (${res.status}):`, text);
              } else {
                console.log("🤖 AI API triggered successfully (queued on Vercel)");
              }
            })
            .catch(err => console.error("❌ AI trigger network failure:", err.message));
      }

      } catch (e) {
        console.error("❌ Message processing failed:", e);
      }
    });

    // ✅ Typing indicators
    socket.on("typing_start", (data) => {
      socket.to(data.groupId).emit("typing_start", data);
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.groupId).emit("typing_stop", data);
    });

    // ✅ Read receipts
    socket.on("mark_read", (data) => {
      socket.to(data.groupId).emit("mark_read", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
  });
});
