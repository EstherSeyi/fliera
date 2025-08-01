import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { EventProvider } from "./context/EventContext";
import { usePreloadGoogleFonts } from "./hooks/usePreloadGoogleFonts";
import { EventDetailProvider } from "./context/EventDetails";

// Create a client
const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AuthProvider>
        <EventProvider>{children}</EventProvider>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProviders>
        <Layout />
        <ToastContainer />
      </AppProviders>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "events",
        async lazy() {
          const { EventsList } = await import("./pages/EventsList");
          return { Component: EventsList };
        },
      },
      {
        path: "events/:id",
        async lazy() {
          const { EventDetail } = await import("./pages/EventDetail");
          return {
            Component: () => (
              <EventDetailProvider>
                <EventDetail />
              </EventDetailProvider>
            ),
          };
        },
      },
      {
        path: "pricing",
        async lazy() {
          const { Pricing } = await import("./pages/Pricing");
          return { Component: Pricing };
        },
      },
      {
        path: "payment-success",
        async lazy() {
          const { PaymentSuccess } = await import("./pages/PaymentSuccess");
          return { Component: PaymentSuccess };
        },
      },
      {
        path: "payment-failure",
        async lazy() {
          const { PaymentFailure } = await import("./pages/PaymentFailure");
          return { Component: PaymentFailure };
        },
      },
      {
        path: "admin/create",
        async lazy() {
          const { CreateEvent } = await import("./pages/admin/CreateEvent");
          return {
            Component: () => (
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: "admin/edit/:id",
        async lazy() {
          const { EditEvent } = await import("./pages/admin/EditEvent");
          return {
            Component: () => (
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: "login",
        async lazy() {
          const { Login } = await import("./pages/Login");
          return { Component: Login };
        },
      },
      {
        path: "signup",
        async lazy() {
          const { Signup } = await import("./pages/Signup");
          return { Component: Signup };
        },
      },
      {
        path: "dashboard",
        async lazy() {
          const { Dashboard } = await import("./pages/Dashboard");
          return {
            Component: () => (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: "my-dps",
        async lazy() {
          const { MyDPs } = await import("./pages/MyDPs");
          return {
            Component: () => (
              <ProtectedRoute>
                <MyDPs />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: "my-events",
        async lazy() {
          const { MyEvents } = await import("./pages/MyEvents");
          return {
            Component: () => (
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: "templates",
        async lazy() {
          const { Templates } = await import("./pages/templates/");
          return {
            Component: () => (
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            ),
          };
        },
      },
    ],
  },
]);

function App() {
  usePreloadGoogleFonts();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
