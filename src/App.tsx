import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'events',
        async lazy() {
          const { EventsList } = await import('./pages/EventsList');
          return { Component: EventsList };
        },
      },
      {
        path: 'events/:id',
        async lazy() {
          const { EventDetail } = await import('./pages/EventDetail');
          return { Component: EventDetail };
        },
      },
      {
        path: 'admin/create',
        async lazy() {
          const { CreateEvent } = await import('./pages/admin/CreateEvent');
          return { Component: CreateEvent };
        },
      },
      {
        path: 'login',
        async lazy() {
          const { Login } = await import('./pages/Login');
          return { Component: Login };
        },
      },
      {
        path: 'signup',
        async lazy() {
          const { Signup } = await import('./pages/Signup');
          return { Component: Signup };
        },
      },
      {
        path: 'dashboard',
        async lazy() {
          const { Dashboard } = await import('./pages/Dashboard');
          return { Component: Dashboard };
        },
      },
      {
        path: 'my-dps',
        async lazy() {
          const { MyDPs } = await import('./pages/MyDPs');
          return { Component: MyDPs };
        },
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}