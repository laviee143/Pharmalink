import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Receipt,
  UserCircle,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PHARMACIST', 'CASHIER']
    },
    {
      name: 'Medicines',
      path: '/medicines',
      icon: Package,
      roles: ['ADMIN', 'PHARMACIST']
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: Users,
      roles: ['ADMIN', 'PHARMACIST', 'CASHIER']
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: FileText,
      roles: ['ADMIN', 'PHARMACIST']
    },
    {
      name: 'Invoices',
      path: '/invoices',
      icon: Receipt,
      roles: ['ADMIN', 'PHARMACIST', 'CASHIER']
    },
    {
      name: 'Users',
      path: '/users',
      icon: UserCircle,
      roles: ['ADMIN']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'PHARMACIST']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-800">PharmaLink</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <UserCircle size={24} className="text-gray-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
