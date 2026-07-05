import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import RootLayout from "../layouts/RootLayout";
import HomePage from "@pages/HomePage";
import ResultsPage from "@pages/ResultsPage";
import HistoryPage from "@pages/HistoryPage";
import NotFoundPage from "@pages/NotFoundPage";

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "results",
        element: <ResultsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
