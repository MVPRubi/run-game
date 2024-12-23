"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roomSliceReducer_1 = require("./roomSliceReducer");
// import { gameSliceReducer } from "./gameSliceReducer";
const gameSliceReducer2_1 = require("./gameSliceReducer2");
const actionReducer = ({ action, ws }) => {
    var _a, _b;
    const actions = {
        room: Object.assign({}, (0, roomSliceReducer_1.roomSliceReducer)(action)),
        // game: { ...gameSliceReducer(action) },
        game2: Object.assign({}, (0, gameSliceReducer2_1.gameSliceReducer)(action)),
    };
    const { type, payload } = action;
    const reducer = ((_a = actions === null || actions === void 0 ? void 0 : actions[ws.protocol]) === null || _a === void 0 ? void 0 : _a[type]) || ((_b = actions === null || actions === void 0 ? void 0 : actions[ws.protocol]) === null || _b === void 0 ? void 0 : _b["default"]);
    reducer({
        payload,
        ws,
        action: type,
    });
};
exports.default = actionReducer;
