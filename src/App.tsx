import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;