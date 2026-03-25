import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import UsersIndex from "../pages/dashboard/users/UsersIndex";
import ClientsIndex from "../pages/dashboard/clients/ClientsIndex";
import ClientsDetail from "../pages/dashboard/clients/ClientsDetail";
import ProjectsIndex from "../pages/dashboard/projects/ProjectsIndex";
import BusinessSettings from "../pages/dashboard/business/BusinessSettings";
import AuthSignIn from "../pages/auth/AuthSignIn";
import AuthConfirm from "../pages/auth/AuthConfirm";
import AuthForgotPassword from "../pages/auth/AuthForgotPassword";
import AuthResetPassword from "../pages/auth/AuthResetPassword";
import AuthVerifyEmail from "../pages/auth/AuthVerifyEmail";
import ProtectedRoute from "../components/routing/ProtectedRoute";
import Home from "../pages/root/Home";
import NotFound from "../pages/errors/NotFound";
import ErrorBoundary from "../components/errors/ErrorBoundary";
import { Permissions } from "../types/auth";

// Exportar la variable router para que pueda ser importada directamente
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/signin" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "signin", element: <AuthSignIn /> },
      { path: "confirm", element: <AuthConfirm /> },
      { path: "verify-email", element: <AuthVerifyEmail /> },
      { path: "forgot-password", element: <AuthForgotPassword /> },
      { path: "reset-password", element: <AuthResetPassword /> },
      { path: "reset-password/:token", element: <AuthResetPassword /> },
    ],
  },
  {
    path: "identity",
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "email_verification", element: <AuthVerifyEmail /> },
      { path: "reset_password", element: <AuthResetPassword /> },
    ],
  },
  {
    path: "dashboard",
    element: <DashboardLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredPermission={Permissions.VIEW_USERS}>
            <UsersIndex />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute
            requiredPermission={[
              Permissions.EDIT_PROFILE,
              Permissions.VIEW_BUSINESS,
            ]}
          >
            <BusinessSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "clients",
        element: (
          <ProtectedRoute requiredPermission={Permissions.VIEW_CLIENTS}>
            <ClientsIndex />
          </ProtectedRoute>
        ),
      },
      {
        path: "clients/:id",
        element: (
          <ProtectedRoute requiredPermission={Permissions.VIEW_CLIENTS}>
            <ClientsDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute requiredPermission={Permissions.VIEW_PROJECTS}>
            <ProjectsIndex />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
