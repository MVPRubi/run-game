import { lazy } from "react";

import { createBrowserRouter } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import RoomPage from "./Pages/RoomPage";
import GamePage from "./Pages/GamePage";
import RoomListPage from "./Pages/RoomListPage";

const Game2 = lazy(() => import("./Pages/GamePage2"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "room/:roomId",
    element: <RoomPage />,
  },
  {
    path: "game/:gameId",
    element: <GamePage />,
  },
  {
    path: "game2/:gameId",
    element: <Game2 />,
  },
  {
    path: "room-list",
    element: <RoomListPage />,
  },
]);
