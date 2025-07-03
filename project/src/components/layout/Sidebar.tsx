import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Package,
  FileText,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['Administrator'] },
  { name: 'Dashboard', href: '/dashboard/mechanic', icon: LayoutDashboard, roles: ['Mechanic'] },
  { name: 'Dashboard', href: '/dashboard/receptionist', icon: LayoutDashboard, roles: ['Recepcionist'] },
  { name: 'Service Orders', href: '/orders', icon: Wrench, roles: ['Mechanic', 'Recepcionist', 'Administrator'] },
  { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['Mechanic', 'Administrator'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['Recepcionist', 'Administrator'] },
  { name: 'Vehicles', href: '/vehicles', icon: Car, roles: ['Recepcionist', 'Administrator'] },
  { name: 'Audit Logs', href: '/audit', icon: Activity, roles: ['Administrator'] },
  { name: 'Service Orders', href: '/settings', icon: Settings, roles: ['Administrator'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavigation = navigation.filter(item =>
    user?.rol && item.roles.includes(user.rol)
  );

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-400" />
            <span className="text-white font-bold text-lg">AutoTaller</span>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={onToggle}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-300">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.rol}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};