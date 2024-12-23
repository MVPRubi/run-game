"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createGameRouter = (router) => {
    router.post("/game/create", (req, res) => {
        const { room } = req === null || req === void 0 ? void 0 : req.body;
        if (!room) {
            res.status(500).send({
                error: true,
                message: "create game without room",
            });
        }
        // const newRoom = roomManager.createRoom(userId);
        // res.send(newRoom);
    });
};
exports.default = createGameRouter;
