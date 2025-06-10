import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  PlusCircle, 
  List,
  ChevronLeft,
  ChevronRight,
  FileImage
} from 'lucide-react';

const sideNavItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/my-events',
    label: 'My Events',
    icon: List,
  },
  {
    path: '/my-dps',
    label: 'My DPs',
    icon: ImageIcon,
  },
  {
    path: '/templates',
    label: 'Templates',
    icon: FileImage,
  },
  {
    path: '/admin/create',
    label: 'Create Event',
    icon: PlusCircle,
  },
];

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin/create') {
      // Special handling for create/edit routes
      return location.pathname === '/admin/create' || location.pathname.startsWith('/admin/edit/');
    }
    return location.pathname === path;
  };

  const NavItem: React.FC<{
    item: typeof sideNavItems[0];
    isCollapsed: boolean;
  }> = ({ item, isCollapsed }) => {
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        className={`
          flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
          ${active 
            ? 'bg-thistle text-primary shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
          }
          ${isCollapsed ? 'justify-center' : 'justify-start'}
        `}
      >
        <item.icon 
          className={`
            w-5 h-5 flex-shrink-0
            ${active ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}
            ${isCollapsed ? '' : 'mr-3'}
          `} 
        />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-gray-200 shadow-sm flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold text-primary">Menu</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sideNavItems.map((item) => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-gray-500 text-center"
            >
              EventDP Dashboard
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};