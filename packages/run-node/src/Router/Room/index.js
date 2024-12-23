"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RoomManager_1 = __importDefault(require("../../Manager/RoomManager"));
const createRoomRouter = (router) => {
    router.post("/room/create", (req, res) => {
        const { userId, userName } = req === null || req === void 0 ? void 0 : req.body;
        if (!userId) {
            res.status(500).send({
                error: true,
                message: "create room without useId",
            });
        }
        const newRoom = RoomManager_1.default.createRoom(userId);
        res.send(newRoom);
    });
    router.get("/room/list", (req, res) => {
        const roomList = RoomManager_1.default.getRoomList();
        console.log("roomList", roomList);
        res.send(roomList
            .filter((room) => room.gameStatus === "idle")
            .filter((room) => !room.isAllUserWSClosed())
            .map((room) => room.transToClientData())
            .filter(({ playerList }) => playerList.length));
    });
    router.post("/room/enter", (req, res) => {
        const { userId, roomId } = req === null || req === void 0 ? void 0 : req.body;
        if (!userId) {
            return res.status(500).send({
                error: true,
                message: "用户不合法",
            });
        }
        const currentRoom = RoomManager_1.default.getRoomById(roomId);
        if (!currentRoom) {
            return res.status(500).send({
                error: true,
                message: "未找到指定房间",
            });
        }
        // 如果房间已经开始游戏，则不允许进入
        if (currentRoom.gameStatus === "playing") {
            return res.status(500).send({
                error: true,
                message: "房间已经开始游戏",
            });
        }
        // 如果人数大于等于 4 人，则不允许进入，且该用户不在房间内
        if (currentRoom.playerList.length >= 4 &&
            !currentRoom.playerList.find(({ id }) => id === userId)) {
            return res.status(500).send({
                error: true,
                message: "房间已满",
            });
        }
        res.send({
            roomId: currentRoom === null || currentRoom === void 0 ? void 0 : currentRoom.id,
        });
    });
};
exports.default = createRoomRouter;
