import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import RootLayout from "../layouts/RootLayout";
import HomePage from "@pages/HomePage";
import ResultsPage from "@pages/ResultsPage";
import NotFoundPage from "@pages/NotFoundPage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import { AuthProvider } from "@/components/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
        element: <Navigate to="/profile" replace />,
      },
      {
        path: "results",
        element: <ResultsPage />,
      },
      {
        path: "login",
        element: <AuthPage />,
      },
      {
        path: "signup",
        element: <AuthPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
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
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
