"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const short_uuid_1 = __importDefault(require("short-uuid"));
const generateId = () => {
    const shortUUID = (0, short_uuid_1.default)("0123456789");
    return shortUUID.generate().slice(0, 6);
};
exports.generateId = generateId;
