const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Internal API layer for sending sockets from Next.js endpoints
    if (req.method === 'POST' && req.url === '/api/internal/emit') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
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
          res.writeHead(400); res.end();
        }
      });
      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    // console.log("A user connected:", socket.id);

    // Join a group room
    socket.on("join_group", (groupId) => {
      socket.join(groupId);
      // console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      // Broadcast immediately for optimistic UI
      socket.to(data.groupId).emit("receive_message", data);

      try {
        if (data.senderId === "ai-system") return;

        // 1. Save standard message to Postgres
        await fetch(`http://localhost:${port}/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        // 2. Trigger AI Queue if invoked
        if (data.type === "ai_prompt" || data.content.toLowerCase().includes("@ai")) {
          // console.log("-> Sending AI trigger to route...");
          fetch(`http://localhost:${port}/api/ai/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          })
            .then(async (res) => {
              // console.log("<- AI Route responded with:", res.status);
              if (!res.ok) console.error("AI Error Body:", await res.text());
            })
            .catch(err => console.error("Fetch to AI route failed:", err));
        }
      } catch (e) {
        console.error("Message processing failed:", e);
      }
    });

    socket.on("typing_start", (data) => {
      // data contains: { groupId, userId, userName }
      socket.to(data.groupId).emit("typing_start", data);
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.groupId).emit("typing_stop", data);
    });

    socket.on("mark_read", (data) => {
      // data contains { groupId, messageId, userId }
      socket.to(data.groupId).emit("mark_read", data);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
