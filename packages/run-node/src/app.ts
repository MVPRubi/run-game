import express, { Application } from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import bodyParser from "body-parser";
import actionReducer from "./Actions";
import userRouter from "./Router";
import gameManager from "./Manager/GameManager";

const app: Application = express();

// 中间件设置
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 设置响应头
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/api", userRouter);

// 启动 HTTP 服务器
const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`HTTP server start on port: ${process.env.PORT || 4000}`);
});

// 创建 WebSocket 服务器，并将其附加到现有的 HTTP 服务器
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, request) => {
  console.log("连接成功", ws.protocol);

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

console.log(`WebSocket server attached to port: ${process.env.PORT || 4000}`);
