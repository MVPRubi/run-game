import express, { Application, Request, Response, Router } from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import bodyParser from "body-parser";
import actionReducer from "./Actions";
import userRouter from "./Router";
import gameManager from "./Manager/GameManager";

const app: Application = express();

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use("/api", userRouter);

const wss = new WebSocketServer({
  port: 8898,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
});

// 注册一个事件处理程序，用于连接和断开客户端
wss.on("connection", (ws, request) => {
  // 向客户端发送一条欢迎消息
  console.log("连接成功", ws.protocol);
 
  // 注册一个事件处理程序，用于接收来自客户端的消息
  ws.on("message", (message: any) => {
    console.log("接受消息", message.toString());
    try {
      const action = JSON.parse(message.toString());
      actionReducer({ action, ws });
    } catch (error) {
      console.error(error, "invalid data format:", message);
    }
  });

  ws.on("close", (message: any) => {
    console.log("连接关闭", message);
  });
});

app.listen(8899);

console.log("http server start on part: 8899");
console.log("sokect server start on part: 8898");