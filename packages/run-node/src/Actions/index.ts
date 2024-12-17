import { roomSliceReducer } from "./roomSliceReducer";
// import { gameSliceReducer } from "./gameSliceReducer";
import { gameSliceReducer as gameSliceReducer2 } from "./gameSliceReducer2";

const actionReducer = ({ action, ws }) => {
  const actions = {
    room: { ...roomSliceReducer(action) },
    // game: { ...gameSliceReducer(action) },
    game2: { ...gameSliceReducer2(action) },
  };

  const { type, payload } = action;
  const reducer =
    actions?.[ws.protocol]?.[type] || actions?.[ws.protocol]?.["default"];
  reducer({
    payload,
    ws,
    action: type,
  });
};

export default actionReducer;
