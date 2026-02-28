const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./app"); // Your Express app (routes, middleware)
const { handleSocketConnection } = require("./socket");

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

// Optional: Base route for testing server connection
// Start server
server.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});

// Connect to MongoDB (example)

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
