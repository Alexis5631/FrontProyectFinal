import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Part } from '../../types';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { PartForm } from './PartForm';
import { format } from 'date-fns';
import { getReplacement } from '../../APIS/ReplacementApis';

export const PartsPage: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const pagination = usePagination({ initialPageSize: 20 });

  // Modal desde navegación
  useEffect(() => {
    if (location.state?.openModal && location.state?.mode) {
      setModalMode(location.state.mode);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Obtener repuestos reales
  const fetchParts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReplacement();
      if (data) {
        setParts(data as any); // Ajustar el tipo si es necesario
      } else {
        setParts([]);
      }
    } catch (err) {
      setError('Error al cargar repuestos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

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
    setSelectedPart(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (part: Part) => {
    setSelectedPart(part);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (part: Part) => {
    if (window.confirm(`Are you sure you want to delete ${part.name}?`)) {
      try {
        await api.parts.delete(part.id);
        fetchParts();
      } catch (error) {
        console.error('Failed to delete part:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPart(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchParts();
  };

  const getStockStatus = (part: Part) => {
    if (part.stockQuantity === 0) return 'out';
    if (part.stockQuantity <= part.minimumStock) return 'low';
    return 'adequate';
  };

  const columns: Column<Part>[] = [
    {
      key: 'code',
      header: 'Part',
      sortable: true,
      render: (part) => (
        <div>
          <div className="font-medium text-gray-900">{part.name}</div>
          <div className="text-gray-500 text-sm font-mono">{part.code}</div>
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Brand',
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (part) => `$${part.price.toFixed(2)}`,
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      render: (part) => (
        <div className="flex items-center space-x-2">
          <span>{part.stockQuantity}</span>
          <StatusBadge status={getStockStatus(part)} variant="stock" />
          {part.stockQuantity <= part.minimumStock && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortable: true,
      render: (part) => format(new Date(part.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (part) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(part)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(part)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(part)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Parts Inventory">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SearchInput
              placeholder="Search parts..."
              onSearch={handleSearch}
              className="w-80"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>

        <DataTable
          data={parts}
          columns={columns}
          loading={loading}
          error={error}
          pagination={
            parts.length > 0
              ? {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  total: parts.length,
                  totalPages: 1,
                  onPageChange: pagination.setPage,
                  onPageSizeChange: pagination.setPageSize,
                }
              : undefined
          }
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No parts found"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={
            modalMode === 'create'
              ? 'Add New Part'
              : modalMode === 'edit'
              ? 'Edit Part'
              : 'Part Details'
          }
          size="lg"
        >
          <PartForm
            part={selectedPart}
            mode={modalMode}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </Layout>
  );
};