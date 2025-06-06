import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, PlusCircle, LogOut, Menu, X, LayoutDashboard, Image as ImageIcon, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavLink: React.FC<{
    to: string;
    children: React.ReactNode;
    Icon?: React.ElementType;
    onClick?: () => void;
  }> = ({ to, children, Icon, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center px-6 py-4 rounded-lg transition-all duration-200 ${
          isActive
            ? "text-gray-900 font-semibold bg-gray-100 md:bg-transparent"
            : "text-gray-700"
        }`}
      >
        {Icon && <Icon className="w-5 h-5 mr-3" />}
        {children}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 bg-neutral/80 backdrop-blur-sm border-b border-primary/10 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/90"
          >
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
                   className="flex items-center px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg"
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
                  className="flex items-center px-6 py-2 bg-accent text-primary  hover:bg-accent/90 transition-colors"
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
                className="fixed inset-0 h-screen p-[20px] md:hidden bg-black/50"
              >
                <motion.div
                  ref={mobileMenuRef}
                   initial={{
                    scale: 1.1,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.75,
                  }}
                  className="relative py-6 rounded-xl bg-white shadow-lg overflow-y-auto"
                >
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="flex flex-col pt-8 px-4 pb-4">
                    <NavLink
                      to="/events"
                      Icon={Calendar}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Events
                    </NavLink>

                    {isLoggedIn ? (
                      <>
                        <NavLink
                          to="/dashboard"
                          Icon={LayoutDashboard}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/my-dps"
                          Icon={ImageIcon}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My DPs
                        </NavLink>
                        <NavLink
                          to="/admin/create"
                          Icon={PlusCircle}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Create Event
                        </NavLink>
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <NavLink
                        to="/login"
                        Icon={LogIn}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </NavLink>
                    )}
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