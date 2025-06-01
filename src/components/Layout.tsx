import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};