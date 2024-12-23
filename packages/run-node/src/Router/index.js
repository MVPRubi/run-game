"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Room_1 = __importDefault(require("./Room"));
const router = express_1.default.Router();
(0, Room_1.default)(router);
exports.default = router;
