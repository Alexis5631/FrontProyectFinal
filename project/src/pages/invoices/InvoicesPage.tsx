import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Download, Send, DollarSign } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Invoice } from '../../types';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { InvoiceForm } from './InvoiceForm';
import { format } from 'date-fns';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const location = useLocation();
  const pagination = usePagination({ initialPageSize: 20 });
  const { data, loading, error, execute } = useApi(api.invoices.getAll);

  // Check if we should open modal from navigation state
  useEffect(() => {
    if (location.state?.openModal && location.state?.mode) {
      setModalMode(location.state.mode);
      setIsModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchInvoices = useCallback(async () => {
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
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  }, [execute, pagination.page, pagination.pageSize, searchTerm, sortKey, sortDirection, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
    setSelectedInvoice(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await api.invoices.delete(invoice.id);
        fetchInvoices();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      const blob = await api.invoices.generatePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDF generation is not available in demo mode');
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await api.invoices.update(invoice.id, { status: 'sent' });
      fetchInvoices();
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchInvoices();
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      case 'sent':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      sortable: true,
      render: (invoice) => (
        <div>
          <div className="font-medium text-gray-900 font-mono">
            {invoice.invoiceNumber}
          </div>
          <div className="text-gray-500 text-sm">
            {invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : 'Unknown Client'}
          </div>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Service Order',
      render: (invoice) => (
        <div className="text-sm">
          {invoice.order ? (
            <div>
              <div className="font-mono">#{invoice.order.id.slice(-6)}</div>
              <div className="text-gray-500 truncate max-w-xs">
                {invoice.order.description}
              </div>
            </div>
          ) : (
            'Unknown Order'
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (invoice) => (
        <StatusBadge status={invoice.status} variant="invoice" />
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (invoice) => (
        <div className={`font-semibold ${getStatusColor(invoice.status)}`}>
          ${invoice.totalAmount.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      sortable: true,
      render: (invoice) => format(new Date(invoice.issueDate), 'MMM dd, yyyy'),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (invoice) => {
        const dueDate = new Date(invoice.dueDate);
        const isOverdue = dueDate < new Date() && invoice.status !== 'paid';
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(dueDate, 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (invoice) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(invoice)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(invoice)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownloadPdf(invoice)}
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          {invoice.status === 'draft' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSendInvoice(invoice)}
              title="Send Invoice"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(invoice)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const overdueCount = invoices.filter(invoice => {
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date() && invoice.status !== 'paid';
  }).length;

  return (
    <Layout title="Invoices">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-semibold text-green-600">${paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SearchInput
              placeholder="Search invoices..."
              onSearch={handleSearch}
              className="w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        <DataTable
          data={invoices}
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
          emptyMessage="No invoices found"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={
            modalMode === 'create'
              ? 'Create New Invoice'
              : modalMode === 'edit'
              ? 'Edit Invoice'
              : 'Invoice Details'
          }
          size="lg"
        >
          <InvoiceForm
            invoice={selectedInvoice}
            mode={modalMode}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </Layout>
  );
};