import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, Users, ShoppingCart, TrendingUp, 
  Calendar, DollarSign, Eye, Settings, LogOut 
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { OrderService } from '../../services/orderService';
import AdminSidebar from './AdminSidebar';
import OrdersManagement from './OrdersManagement';
import FrameManagement from './FrameManagement';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

type AdminView = 'dashboard' | 'orders' | 'frames' | 'users' | 'settings';

export default function AdminDashboard() {
  const { admin, logout } = useAdmin();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const orderStats = await OrderService.getOrderStats();
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recent-orders':
        setCurrentView('orders');
        break;
      case 'frame-inventory':
        setCurrentView('frames');
        break;
      case 'user-management':
        setCurrentView('users');
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'orders':
        return <OrdersManagement />;
      case 'frames':
        return <FrameManagement />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview stats={stats} loading={loading} onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        admin={admin}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'orders' && 'Orders Management'}
                {currentView === 'frames' && 'Frame Management'}
                {currentView === 'users' && 'Admin Users'}
                {currentView === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {admin?.full_name || admin?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Role: <span className="font-medium capitalize">{admin?.role.replace('_', ' ')}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview({ stats, loading, onQuickAction }: { 
  stats: any; 
  loading: boolean; 
  onQuickAction: (action: string) => void;
}) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart size={24} className="text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <Calendar size={24} className="text-orange-600" />,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      title: 'Processing',
      value: stats.processingOrders,
      icon: <Package size={24} className="text-purple-600" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign size={24} className="text-green-600" />,
      color: 'bg-green-50 border-green-200'
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Processing</span>
              <span className="font-medium">{stats.processingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipped</span>
              <span className="font-medium">{stats.shippedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Delivered</span>
              <span className="font-medium">{stats.deliveredOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onQuickAction('recent-orders')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-blue-600" />
                <span>View Recent Orders</span>
              </div>
            </button>
            <button 
              onClick={() => onQuickAction('frame-inventory')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package size={20} className="text-green-600" />
                <span>Manage Frame Inventory</span>
              </div>
            </button>
            <button 
              onClick={() => onQuickAction('user-management')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-purple-600" />
                <span>Admin User Management</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}