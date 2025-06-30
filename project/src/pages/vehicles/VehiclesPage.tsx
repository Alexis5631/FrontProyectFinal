import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Vehicle } from '../../types';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { VehicleForm } from './VehicleForm';
import { format } from 'date-fns';
import { getVehicle } from '../../APIS/VehicleApis';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  // Obtener vehículos reales
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehicle();
      if (data) {
        setVehicles(data as any); // Ajustar el tipo si es necesario
      } else {
        setVehicles([]);
      }
    } catch (err) {
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    setSelectedVehicle(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
      try {
        await api.vehicles.delete(vehicle.id);
        fetchVehicles();
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchVehicles();
  };

  const columns: Column<Vehicle>[] = [
    {
      key: 'make',
      header: 'Vehicle',
      sortable: true,
      render: (vehicle) => (
        <div>
          <div className="font-medium text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div className="text-gray-500 text-sm">{vehicle.color} • {vehicle.licensePlate}</div>
        </div>
      ),
    },
    {
      key: 'vin',
      header: 'VIN',
      sortable: true,
      render: (vehicle) => (
        <div className="text-sm text-gray-900 font-mono">
          {vehicle.vin}
        </div>
      ),
    },
    {
      key: 'mileage',
      header: 'Mileage',
      sortable: true,
      render: (vehicle) => `${vehicle.mileage.toLocaleString()} miles`,
    },
    {
      key: 'client',
      header: 'Owner',
      render: (vehicle) => (
        <div className="text-sm text-gray-900">
          {vehicle.client ? `${vehicle.client.firstName} ${vehicle.client.lastName}` : 'Unknown'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortable: true,
      render: (vehicle) => format(new Date(vehicle.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (vehicle) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(vehicle)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(vehicle)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(vehicle)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Vehicles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SearchInput
              placeholder="Search vehicles..."
              onSearch={handleSearch}
              className="w-80"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        <DataTable
          data={vehicles}
          columns={columns}
          loading={loading}
          error={error}
          pagination={
            vehicles.length > 0
              ? {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  total: vehicles.length,
                  totalPages: Math.ceil(vehicles.length / pagination.pageSize),
                  onPageChange: pagination.setPage,
                  onPageSizeChange: pagination.setPageSize,
                }
              : undefined
          }
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No vehicles found"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={
            modalMode === 'create'
              ? 'Add New Vehicle'
              : modalMode === 'edit'
              ? 'Edit Vehicle'
              : 'Vehicle Details'
          }
          size="lg"
        >
          <VehicleForm
            vehicle={selectedVehicle}
            mode={modalMode}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </Layout>
  );
};