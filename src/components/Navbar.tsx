import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, PlusCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary/10 ${
          isActive ? 'text-primary font-semibold' : 'text-primary/70'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 bg-neutral/80 backdrop-blur-sm border-b border-primary/10 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/90">
            <Calendar className="w-6 h-6" />
            <span className="text-xl font-bold">EventDP</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/admin/create">
              <PlusCircle className="w-5 h-5 mr-1" />
              Create Event
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};