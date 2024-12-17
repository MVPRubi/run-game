import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import Loading from "@components/Loading";
import { router } from "./Router";

import "./normalize.css";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
