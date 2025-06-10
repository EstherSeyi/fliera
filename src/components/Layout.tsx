import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Define protected routes that should show the side navigation
  const protectedRoutes = ['/dashboard', '/my-events', '/my-dps', '/admin'];
  
  // Check if current route is a protected route
  const isProtectedRoute = isLoggedIn && protectedRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Side Navigation - Only show on protected routes */}
        {isProtectedRoute && (
          <div className="hidden md:block">
            <SideNav />
          </div>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${isProtectedRoute ? 'md:ml-0' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};