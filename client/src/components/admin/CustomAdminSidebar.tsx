import React from 'react';
import { useLocation } from 'wouter';
import './AdminStyles.css';

interface CustomAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: '📊', 
    path: '/admin',
    category: 'main'
  },
  { 
    text: 'Analytics', 
    icon: '📈', 
    path: '/admin/analytics',
    category: 'main'
  },
  { 
    text: 'Users', 
    icon: '👥', 
    path: '/admin/users',
    category: 'management'
  },
  { 
    text: 'Tasks', 
    icon: '✅', 
    path: '/admin/tasks',
    category: 'management'
  },
  { 
    text: 'Calendar', 
    icon: '📅', 
    path: '/admin/calendar',
    category: 'management'
  },
  { 
    text: 'Reports', 
    icon: '📋', 
    path: '/admin/reports',
    category: 'analytics'
  },
  { 
    text: 'Feedback', 
    icon: '💬', 
    path: '/admin/feedback',
    category: 'analytics'
  },
  { 
    text: 'Inventory', 
    icon: '📦', 
    path: '/admin/inventory',
    category: 'management'
  },
  { 
    text: 'Profile', 
    icon: '👤', 
    path: '/admin/profile',
    category: 'account'
  },
  { 
    text: 'Notifications', 
    icon: '🔔', 
    path: '/admin/notifications',
    category: 'account'
  },
  { 
    text: 'Settings', 
    icon: '⚙️', 
    path: '/admin/settings',
    category: 'account'
  },
];

export default function CustomAdminSidebar({ open, onClose }: CustomAdminSidebarProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const renderMenuSection = (category: string, title: string) => {
    const items = menuItems.filter(item => item.category === category);
    
    return (
      <div className="menu-section">
        <h3 className="menu-section-title">{title}</h3>
        <ul className="menu-list">
          {items.map((item) => {
            const isActive = location === item.path || (item.path !== '/admin' && location.startsWith(item.path));
            return (
              <li key={item.text} className="menu-item">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`menu-button ${isActive ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`custom-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">Admin Portal</span>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="sidebar-content">
          {renderMenuSection('main', 'Main')}
          {renderMenuSection('management', 'Management')}
          {renderMenuSection('analytics', 'Analytics')}
          {renderMenuSection('account', 'Account')}
        </div>
      </div>
    </>
  );
}