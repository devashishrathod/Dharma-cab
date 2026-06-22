const http = require("http");
const { Server } = require("socket.io");
const ngrok = require("ngrok");
const app = require("./app"); // Your Express app (routes, middleware)
const { handleSocketConnection } = require("./socket");
const { mongoDb } = require("./function/db");

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend's origin (e.g., http://localhost:3000)
    methods: ["GET", "POST"],
  },
});

// Setup socket handling
handleSocketConnection(io);
mongoDb();
// Optional: Base route for testing server connection
// Start server
server.listen(port, async () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
  if (process.env.ENABLE_NGROK === "true") {
    const url = await ngrok.connect({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN,
      // subdomain: process.env.NGROK_SUBDOMAIN // must be set for custom subdomain
    });
    console.log(`Public URL: ${url}`);
  }
});
