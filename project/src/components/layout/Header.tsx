import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Mock notifications
    if (!showNotifications) {
      alert('Notifications:\n• Low stock alert: Brake Pads\n• New order assigned to you\n• System backup completed');
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSettingsClick = () => {
    alert('Profile settings will open here');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="p-2 relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="p-2 flex items-center space-x-2"
                onClick={handleProfileClick}
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.name?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name} {user?.lastName}
                </span>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.name} {user?.lastName}</div>
                    <div className="text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-400 capitalize">{user?.rol}</div>
                  </div>
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};