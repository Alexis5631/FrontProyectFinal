import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Client } from '../../types';
import { getClient, postClient, putClient, deleteClient } from '../../APIS/ClientApis';
import { usePagination } from '../../hooks/usePagination';
import { ClientForm } from './ClientForm';
import { format } from 'date-fns';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const pagination = usePagination({ initialPageSize: 20 });

  // Check if we should open modal from navigation state
  useEffect(() => {
    if (location.state?.openModal && location.state?.mode) {
      setModalMode(location.state.mode);
      setIsModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getClient();
      if (response) {
        // Apply search filter
        let filteredClients = response;
        if (searchTerm) {
          filteredClients = response.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
          );
        }

        // Apply sorting
        filteredClients.sort((a, b) => {
          const aValue = a[sortKey as keyof Client];
          const bValue = b[sortKey as keyof Client];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          if (aValue instanceof Date && bValue instanceof Date) {
            return sortDirection === 'asc' 
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          }
          
          return 0;
        });

        // Apply pagination
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedClients = filteredClients.slice(startIndex, endIndex);
        
        setClients(paginatedClients);
      }
    } catch (err) {
      setError('Failed to fetch clients');
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortKey, sortDirection, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
    setSelectedClient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name} ${client.lastName}?`)) {
      try {
        await deleteClient(client.id);
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchClients();
  };

  const columns: Column<Client>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (client) => (
        <div>
          <div className="font-medium text-gray-900">
            {client.name} {client.lastName}
          </div>
          <div className="text-gray-500 text-sm">{client.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
    },
    {
      key: 'identification',
      header: 'identification',
      render: (client) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {client.identification}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(client)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(client)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(client)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Clients">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SearchInput
              placeholder="Search clients..."
              onSearch={handleSearch}
              className="w-80"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <DataTable
          data={clients}
          columns={columns}
          loading={loading}
          error={error}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: clients.length,
            totalPages: Math.ceil(clients.length / pagination.pageSize),
            onPageChange: pagination.setPage,
            onPageSizeChange: pagination.setPageSize,
          }}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No clients found"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={
            modalMode === 'create'
              ? 'Add New Client'
              : modalMode === 'edit'
              ? 'Edit Client'
              : 'Client Details'
          }
          size="lg"
        >
          <ClientForm
            client={selectedClient}
            mode={modalMode}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </Layout>
  );
};