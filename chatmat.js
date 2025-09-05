
// Save as: chatmat.js
// Run with: node chatmat.js

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// frontend serve karega
app.use(express.static(path.join(__dirname)));

let users = {}; // {number: socketId}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (profile) => {
    users[profile.number] = socket.id;
    socket.data.profile = profile;
    console.log("Registered:", profile);
  });

  socket.on("message", (msg) => {
    let toSocket = users[msg.to];
    if (toSocket) io.to(toSocket).emit("message", msg);
  });

  socket.on("call", (data) => {
    let toSocket = users[data.to];
    if (toSocket) {
      io.to(toSocket).emit("incomingCall", {
        from: socket.data.profile,
        offer: data.offer,
      });
    }
  });

  socket.on("answer", (data) => {
    let toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("callAnswered", { answer: data.answer });
  });

  socket.on("candidate", (data) => {
    let toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("candidate", { candidate: data.candidate });
  });

  socket.on("disconnect", () => {
    if (socket.data.profile) {
      delete users[socket.data.profile.number];
      console.log("User left:", socket.data.profile.number);
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 ChatMat server running at http://localhost:3000/chatmat.html");
});
