import React from "react";
import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import XIcon from "../assets/x-social-media-logo.svg?react";
import Github from "../assets/github-social-media-logo.svg?react";

interface FooterProps {
  showSimplified?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showSimplified = false }) => {
  const { isLoggedIn } = useAuth();

  // Show simplified footer when sidebar is visible
  if (showSimplified) {
    return (
      <footer className="py-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} EventDP. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  // Show full footer for public pages and when sidebar is not visible
  return (
    <footer className="bg-primary text-neutral mt-16">
      <div className="container mx-auto px-4">
        <div className="py-8 border-b border-neutral/10 flex justify-between items-center">
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link to="/events" className="hover:text-accent transition-colors">
              Events
            </Link>
            <Link to="/pricing" className="hover:text-accent transition-colors">
              Pricing
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-events"
                  className="hover:text-accent transition-colors"
                >
                  My Events
                </Link>
                <Link
                  to="/my-dps"
                  className="hover:text-accent transition-colors"
                >
                  My DPs
                </Link>
                <Link
                  to="/admin/create"
                  className="hover:text-accent transition-colors"
                >
                  Create Event
                </Link>
              </>
            ) : (
              <Link
                to="/signup"
                className="hover:text-accent transition-colors"
              >
                Sign Up
              </Link>
            )}
          </nav>
        </div>

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-hookersgreen">
            © {new Date().getFullYear()} EventDP. All rights reserved.
          </p>

          <div className="flex items-center space-x-4">
            <a
              href="https://www.linkedin.com/in/seyi-ogundijo/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hookersgreen hover:text-accent transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/EstherSeyi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hookersgreen hover:text-accent transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/seyi_hadas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hookersgreen hover:text-accent transition-colors"
            >
              <XIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
