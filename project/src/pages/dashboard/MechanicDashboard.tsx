import React, { useEffect, useState } from 'react';
import { Users, Car, Wrench, Package, AlertTriangle, TrendingUp, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Layout } from '../../components/layout/Layout';

interface DashboardStats {
  totalClients: number;
  totalVehicles: number;
  activeOrders: number;
  lowStockParts: number;
  monthlyRevenue: number;
  completedOrdersThisMonth: number;
}

export const MechanicDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      // In a real app, you'd have a dedicated stats endpoint
      const [clients, vehicles, orders, parts] = await Promise.all([
        api.clients.getAll({ pageSize: 1 }),
        api.vehicles.getAll({ pageSize: 1 }),
        api.serviceOrders.getAll({ status: 'in_progress', pageSize: 1 }),
        api.parts.getLowStock(),
      ]);

      setStats({
        totalClients: clients.data.total,
        totalVehicles: vehicles.data.total,
        activeOrders: orders.data.total,
        lowStockParts: parts.data.length,
        monthlyRevenue: 125430, // Mock data
        completedOrdersThisMonth: 85, // Mock data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-client':
        navigate('/clients', { state: { openModal: true, mode: 'create' } });
        break;
      case 'new-order':
        navigate('/orders', { state: { openModal: true, mode: 'create' } });
        break;
      case 'add-part':
        navigate('/parts', { state: { openModal: true, mode: 'create' } });
        break;
      case 'add-vehicle':
        navigate('/vehicles', { state: { openModal: true, mode: 'create' } });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  const statCards = [
    {
      name: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      action: () => navigate('/clients'),
    },
    {
      name: 'Total Vehicles',
      value: stats?.totalVehicles || 0,
      icon: Car,
      color: 'bg-green-500',
      change: '+8%',
      action: () => navigate('/vehicles'),
    },
    {
      name: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: Wrench,
      color: 'bg-yellow-500',
      change: '+3%',
      action: () => navigate('/orders'),
    },
    {
      name: 'Low Stock Items',
      value: stats?.lowStockParts || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-5%',
      action: () => navigate('/parts'),
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+15%',
      action: () => navigate('/invoices'),
    },
    {
      name: 'Completed Orders',
      value: stats?.completedOrdersThisMonth || 0,
      icon: Package,
      color: 'bg-indigo-500',
      change: '+22%',
      action: () => navigate('/orders'),
    },
  ];

  const quickActions = [
    {
      id: 'add-client',
      name: 'Add Client',
      icon: Users,
      color: 'text-blue-600',
      description: 'Register new client',
    },
    {
      id: 'new-order',
      name: 'New Order',
      icon: Wrench,
      color: 'text-green-600',
      description: 'Create service order',
    },
    {
      id: 'add-part',
      name: 'Add Part',
      icon: Package,
      color: 'text-purple-600',
      description: 'Add inventory item',
    },
    {
      id: 'add-vehicle',
      name: 'Add Vehicle',
      icon: Car,
      color: 'text-orange-600',
      description: 'Register vehicle',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Workshop Overview</h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <div 
              key={stat.name} 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.action}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/audit')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Order #1234 completed by John Doe</p>
                <span className="text-xs text-gray-400">2 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">New client registered: Jane Smith</p>
                <span className="text-xs text-gray-400">15 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Low stock alert: Brake Pads</p>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Vehicle added: 2020 Toyota Camry</p>
                <span className="text-xs text-gray-400">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};