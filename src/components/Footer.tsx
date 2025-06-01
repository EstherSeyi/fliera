import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-neutral mt-16">
      <div className="container mx-auto px-4">
        <div className="py-8 border-b border-neutral/10">
          <nav className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="hover:text-accent transition-colors">UPCOMING EVENTS</Link>
            <Link to="/categories" className="hover:text-accent transition-colors">CATEGORIES</Link>
            <Link to="/login" className="hover:text-accent transition-colors">LOGIN</Link>
          </nav>
        </div>
        
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral/80">© 2025 EventDP. All rights reserved.</p>
          
          <div className="flex items-center space-x-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
               className="text-neutral/80 hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className="text-neutral/80 hover:text-accent transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className="text-neutral/80 hover:text-accent transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};