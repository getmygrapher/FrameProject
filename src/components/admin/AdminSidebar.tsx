import React from 'react';
import { 
  BarChart3, Package, Users, ShoppingCart, Settings, 
  LogOut, Camera, Shield 
} from 'lucide-react';
import { AdminUser } from '../../lib/supabase';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  admin: AdminUser | null;
  onLogout: () => void;
}

export default function AdminSidebar({ currentView, onViewChange, admin, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { id: 'frames', label: 'Frame Management', icon: <Package size={20} /> },
    { id: 'users', label: 'Admin Users', icon: <Users size={20} />, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || admin?.role === 'super_admin'
  );

  return (
    <div className="w-64 bg-white shadow-lg border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Camera size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">FrameCraft Pro</h2>
            <p className="text-xs text-blue-600 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {admin?.full_name || admin?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {admin?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}