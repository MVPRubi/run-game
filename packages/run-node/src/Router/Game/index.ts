import { Router } from "express";

const createGameRouter = (router: Router) => {
  router.post("/game/create", (req, res) => {
    const { room } = req?.body;
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

export default createGameRouter;
