"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const Actions_1 = __importDefault(require("./Actions"));
const Router_1 = __importDefault(require("./Router"));
const app = (0, express_1.default)();
// 中间件设置
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
// 设置响应头
app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
});
app.use("/api", Router_1.default);
// 启动 HTTP 服务器
const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`HTTP server start on port: ${process.env.PORT || 4000}`);
});
// 创建 WebSocket 服务器，并将其附加到现有的 HTTP 服务器
const wss = new ws_1.WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws, request) => {
    console.log("连接成功", ws.protocol);
    ws.on("message", (message) => {
        console.log("接受消息", message.toString());
        try {
            const action = JSON.parse(message.toString());
            (0, Actions_1.default)({ action, ws });
        }
        catch (error) {
            console.error(error, "invalid data format:", message);
        }
    });
    ws.on("close", (message) => {
        console.log("连接关闭", message);
    });
});
console.log(`WebSocket server attached to port: ${process.env.PORT || 4000}`);
