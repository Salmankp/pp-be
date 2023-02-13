const app = require("express")();
var http = require("http");
const serverFile = require("./server");
const { Server } = require("socket.io");
const server = http.createServer(app);

const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});

const Chat = require("./models/chatModel");

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`listening on *:${process.env.SOCKET_PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3100",
      "https://p2p.invo.zone",
      "http://localhost:3000"
    ],
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, PUT, POST, DELETE"
  }
});

let liveConnectedUsers = {};

io.on("connection", async socket => {
  console.log('user connected', socket.id);
  socket.on('handshake', async (data) => {
    liveConnectedUsers[data?.id] = socket;
  })
  // setInterval(() => server.emit("transaction-released", "Hi"), 5000);
  // io.emit("transaction-released", "hi");
  socket.on("send-chat-payload", async msg => {
    serverFile.mongoConnection;
    try {
      const chat = await Chat.create({
        message: msg.message,
        sender: msg.senderID,
        time: msg.time,
        receiver: msg.receiverID,
        transaction: msg.transactionId
      });

      return io.emit("receive-chat-message", [chat]);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('disconnect', () => {
    console.log('someone has left')
  })
});

app.set("io", io);

exports.module = server;
module.exports.liveConnectedUsers = liveConnectedUsers;
module.exports.io = io;
