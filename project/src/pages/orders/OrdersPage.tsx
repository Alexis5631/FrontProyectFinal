import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, FileText, Wrench } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ServiceOrder } from '../../types';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { OrderForm } from './OrderForm';
import { format } from 'date-fns';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const location = useLocation();
  const pagination = usePagination({ initialPageSize: 20 });
  const { data, loading, error, execute } = useApi(api.serviceOrders.getAll);

  // Check if we should open modal from navigation state
  useEffect(() => {
    if (location.state?.openModal && location.state?.mode) {
      setModalMode(location.state.mode);
      setIsModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchOrders = useCallback(async () => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm,
      sortBy: sortKey,
      sortOrder: sortDirection,
      ...(statusFilter && { status: statusFilter }),
    };
    
    try {
      const response = await execute(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [execute, pagination.page, pagination.pageSize, searchTerm, sortKey, sortDirection, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    pagination.goToFirstPage();
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    pagination.goToFirstPage();
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: ServiceOrder['status']) => {
    try {
      await api.serviceOrders.updateStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleDelete = async (order: ServiceOrder) => {
    if (window.confirm(`Are you sure you want to delete order #${order.id.slice(-6)}?`)) {
      try {
        await api.serviceOrders.delete(order.id);
        fetchOrders();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handlePrintOrder = (order: ServiceOrder) => {
    // Create a simple print view
    const printContent = `
      <html>
        <head>
          <title>Service Order #${order.id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AutoTaller Manager</h1>
            <h2>Service Order #${order.id.slice(-6)}</h2>
          </div>
          <div class="info">
            <p><span class="label">Client:</span> ${order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Unknown'}</p>
            <p><span class="label">Vehicle:</span> ${order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : 'Unknown'}</p>
            <p><span class="label">Mechanic:</span> ${order.mechanic ? `${order.mechanic.firstName} ${order.mechanic.lastName}` : 'Unassigned'}</p>
            <p><span class="label">Status:</span> ${order.status.replace('_', ' ').toUpperCase()}</p>
            <p><span class="label">Start Date:</span> ${new Date(order.startDate).toLocaleDateString()}</p>
            <p><span class="label">Estimated Cost:</span> $${order.estimatedCost.toFixed(2)}</p>
            <p><span class="label">Description:</span> ${order.description}</p>
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

  const handleCreateInvoice = async (order: ServiceOrder) => {
    if (order.status !== 'completed') {
      alert('Only completed orders can be invoiced.');
      return;
    }
    
    try {
      const invoiceData = {
        orderId: order.id,
        clientId: order.clientId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        subtotal: order.totalCost * 0.87, // Assuming 13% tax
        taxAmount: order.totalCost * 0.13,
        totalAmount: order.totalCost,
        status: 'draft' as const,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
      
      await api.invoices.create(invoiceData);
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchOrders();
  };

  const getStatusIcon = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const columns: Column<ServiceOrder>[] = [
    {
      key: 'id',
      header: 'Order #',
      sortable: true,
      render: (order) => (
        <div className="font-mono text-sm">
          #{order.id.slice(-6)}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Unknown'}
          </div>
          <div className="text-gray-500 text-sm">
            {order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : 'Unknown Vehicle'}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (order) => (
        <div className="max-w-xs truncate text-sm">
          {order.description}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <StatusBadge status={order.status} variant="order" />
        </div>
      ),
    },
    {
      key: 'estimatedCost',
      header: 'Est. Cost',
      sortable: true,
      render: (order) => `$${order.estimatedCost.toFixed(2)}`,
    },
    {
      key: 'mechanic',
      header: 'Mechanic',
      render: (order) => (
        <div className="text-sm">
          {order.mechanic ? `${order.mechanic.firstName} ${order.mechanic.lastName}` : 'Unassigned'}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (order) => format(new Date(order.startDate), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <div className="flex space-x-1">
          {order.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(order.id, 'in_progress')}
              title="Start Work"
            >
              <Clock className="h-4 w-4" />
            </Button>
          )}
          {order.status === 'in_progress' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange(order.id, 'completed')}
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(order)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(order)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePrintOrder(order)}
            title="Print Order"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {order.status === 'completed' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCreateInvoice(order)}
              title="Create Invoice"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(order)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Service Orders">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SearchInput
              placeholder="Search orders..."
              onSearch={handleSearch}
              className="w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>

        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          error={error}
          pagination={
            data
              ? {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  total: data.total,
                  totalPages: data.totalPages,
                  onPageChange: pagination.setPage,
                  onPageSizeChange: pagination.setPageSize,
                }
              : undefined
          }
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No service orders found"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={
            modalMode === 'create'
              ? 'Create New Order'
              : modalMode === 'edit'
              ? 'Edit Order'
              : 'Order Details'
          }
          size="xl"
        >
          <OrderForm
            order={selectedOrder}
            mode={modalMode}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </Layout>
  );
};