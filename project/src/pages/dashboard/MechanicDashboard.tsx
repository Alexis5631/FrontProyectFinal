import React, { useEffect, useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { ServiceOrder } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';

export const MechanicDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOrders = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.serviceOrders.getAll({
        mechanicId: user.id,
        pageSize: 10,
      });
      setMyOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyOrders();
  };

  const updateOrderStatus = async (orderId: string, status: ServiceOrder['status']) => {
    try {
      await api.serviceOrders.updateStatus(orderId, status);
      setMyOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handlePrintOrder = (order: ServiceOrder) => {
    const printContent = `
      <html>
        <head>
          <title>Work Order #${order.id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .label { font-weight: bold; }
            .checklist { margin-top: 20px; }
            .checklist li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AutoTaller Manager</h1>
            <h2>Work Order #${order.id.slice(-6)}</h2>
          </div>
          <div class="info">
            <p><span class="label">Client:</span> ${order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Unknown'}</p>
            <p><span class="label">Vehicle:</span> ${order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : 'Unknown'}</p>
            <p><span class="label">License Plate:</span> ${order.vehicle?.licensePlate || 'Unknown'}</p>
            <p><span class="label">Mechanic:</span> ${user?.firstName} ${user?.lastName}</p>
            <p><span class="label">Status:</span> ${order.status.replace('_', ' ').toUpperCase()}</p>
            <p><span class="label">Start Date:</span> ${new Date(order.startDate).toLocaleDateString()}</p>
            <p><span class="label">Description:</span> ${order.description}</p>
          </div>
          <div class="checklist">
            <h3>Work Checklist:</h3>
            <ul>
              <li>☐ Initial inspection completed</li>
              <li>☐ Parts ordered/available</li>
              <li>☐ Work performed as described</li>
              <li>☐ Quality check completed</li>
              <li>☐ Test drive performed</li>
              <li>☐ Customer notified</li>
            </ul>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewOrderDetails = (order: ServiceOrder) => {
    alert(`Order Details:\n\nOrder #${order.id.slice(-6)}\nClient: ${order.client?.firstName} ${order.client?.lastName}\nVehicle: ${order.vehicle?.year} ${order.vehicle?.make} ${order.vehicle?.model}\nDescription: ${order.description}\nEstimated Cost: $${order.estimatedCost}\nStatus: ${order.status.replace('_', ' ')}`);
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  const pendingOrders = myOrders.filter(order => order.status === 'pending');
  const inProgressOrders = myOrders.filter(order => order.status === 'in_progress');
  const completedOrders = myOrders.filter(order => order.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work Orders</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{inProgressOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {myOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No orders assigned to you yet.
            </div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Order #{order.id.slice(-6)}
                      </h4>
                      <StatusBadge status={order.status} variant="order" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Client:</strong> {order.client?.firstName} {order.client?.lastName}</p>
                      <p><strong>Vehicle:</strong> {order.vehicle?.year} {order.vehicle?.make} {order.vehicle?.model}</p>
                      <p><strong>Description:</strong> {order.description}</p>
                      <p><strong>Estimated Cost:</strong> ${order.estimatedCost}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrintOrder(order)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      >
                        Start Work
                      </Button>
                    )}
                    {order.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};