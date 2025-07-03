import React, { useEffect, useState } from 'react';
import { Users, Car, FileText, Calendar, Phone, Mail, Wrench, Package, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, ServiceOrder } from '../../types';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';

export const ReceptionistDashboard: React.FC = () => {
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [todayOrders, setTodayOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [clientsResponse, ordersResponse] = await Promise.all([
        api.clients.getAll({ pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        api.serviceOrders.getAll({ pageSize: 10 }),
      ]);

      setRecentClients(clientsResponse.data.data);
      setTodayOrders(ordersResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleCallClient = (client: Client) => {
    if (navigator.userAgent.includes('Mobile')) {
      window.location.href = `tel:${client.phone}`;
    } else {
      alert(`Calling ${client.name} ${client.lastName} at ${client.phone}`);
    }
  };

  const handleEmailClient = (client: Client) => {
    window.location.href = `mailto:${client.email}?subject=AutoTaller Service Update`;
  };

  const handleViewClient = (client: Client) => {
    navigate('/clients');
  };

  const handleViewOrder = (order: ServiceOrder) => {
    navigate('/orders');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-client':
        navigate('/clients', { state: { openModal: true, mode: 'create' } });
        break;
      case 'new-order':
        navigate('/orders', { state: { openModal: true, mode: 'create' } });
        break;
      case 'add-vehicle':
        navigate('/vehicles', { state: { openModal: true, mode: 'create' } });
        break;
      case 'schedule-service':
        navigate('/orders');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  const pendingOrders = todayOrders.filter(order => order.state?.stateType === 'pending');
  const inProgressOrders = todayOrders.filter(order => order.state?.stateType === 'in_progress');

  const quickActions = [
    {
      id: 'add-client',
      name: 'New Client',
      icon: Users,
      color: 'text-blue-600',
      description: 'Register client',
    },
    {
      id: 'schedule-service',
      name: 'Schedule Service',
      icon: Calendar,
      color: 'text-green-600',
      description: 'Book appointment',
    },
    {
      id: 'add-vehicle',
      name: 'Add Vehicle',
      icon: Car,
      color: 'text-orange-600',
      description: 'Register vehicle',
    },
    {
      id: 'new-order',
      name: 'New Order',
      icon: Wrench,
      color: 'text-purple-600',
      description: 'Create service order',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
          <p className="text-gray-600">Manage client interactions and appointments</p>
        </div>
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
          <Button onClick={() => handleQuickAction('add-client')}>
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
          <Button variant="secondary" onClick={() => handleQuickAction('schedule-service')}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/clients')}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{recentClients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/orders')}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/orders')}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Service</p>
              <p className="text-2xl font-semibold text-gray-900">{inProgressOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/invoices')}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invoices Due</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Clients</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/clients')}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClients.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent clients
              </div>
            ) : (
              recentClients.map((client) => (
                <div key={client.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {client.name} {client.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCallClient(client)}
                        title="Call Client"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEmailClient(client)}
                        title="Email Client"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewClient(client)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};