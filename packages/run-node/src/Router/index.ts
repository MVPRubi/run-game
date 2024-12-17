import express from "express";
import createRoomRouter from "./Room";

const router = express.Router();

createRoomRouter(router);

export default router;
