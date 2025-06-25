import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import './AdminStyles.css';

interface CustomAdminNavbarProps {
  onMenuClick: () => void;
}

export default function CustomAdminNavbar({ onMenuClick }: CustomAdminNavbarProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="navbar-title">Admin Dashboard</h1>
      </div>
      
      <div className="navbar-right">
        <button className="notification-btn">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <button 
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="avatar-text">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user?.firstName || user?.username}</div>
                <div className="user-role">{user?.role}</div>
              </div>
              <hr />
              <button className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                👤 Profile
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}