import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ 
    to, 
    children,
    onClick 
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
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
            <Calendar className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xl font-light">EventDP</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/events">Events</NavLink>
            
            {isLoggedIn ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/my-dps">My DPs</NavLink>
                <NavLink to="/admin/create">
                  <PlusCircle className="w-5 h-5 mr-1" />
                  Create Event
                </NavLink>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center px-6 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </motion.button>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="flex items-center px-6 py-2 bg-accent text-primary rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 md:hidden"
              >
                <motion.div
                  ref={mobileMenuRef}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="absolute right-0 top-0 h-full w-64 bg-neutral shadow-xl"
                >
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-primary">Menu</span>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <NavLink to="/events" onClick={() => setIsMobileMenuOpen(false)}>
                        Events
                      </NavLink>
                      
                      {isLoggedIn ? (
                        <>
                          <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                          </NavLink>
                          <NavLink to="/my-dps" onClick={() => setIsMobileMenuOpen(false)}>
                            My DPs
                          </NavLink>
                          <NavLink to="/admin/create" onClick={() => setIsMobileMenuOpen(false)}>
                            <PlusCircle className="w-5 h-5 mr-1" />
                            Create Event
                          </NavLink>
                          <button
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Login
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};