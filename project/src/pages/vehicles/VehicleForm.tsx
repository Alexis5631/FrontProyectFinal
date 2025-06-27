import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { Vehicle, Client } from '../../types';
import { api } from '../../services/api';

const schema = yup.object().shape({
  clientId: yup.string().required('Client is required'),
  vin: yup.string().required('VIN is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  year: yup.number().required('Year is required').min(1900).max(new Date().getFullYear() + 1),
  color: yup.string().required('Color is required'),
  licensePlate: yup.string().required('License plate is required'),
  mileage: yup.number().required('Mileage is required').min(0),
});

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface VehicleFormData {
  clientId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.clients.getAll({ pageSize: 100 });
        setClients(response.data.data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (vehicle) {
      reset({
        clientId: vehicle.clientId,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        mileage: vehicle.mileage,
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (mode === 'create') {
        await api.vehicles.create(data);
      } else if (mode === 'edit' && vehicle) {
        await api.vehicles.update(vehicle.id, data);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && vehicle) {
    const client = clients.find(c => c.id === vehicle.clientId);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <p className="text-sm text-gray-900">
              {client ? `${client.firstName} ${client.lastName}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN
            </label>
            <p className="text-sm text-gray-900">{vehicle.vin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <p className="text-sm text-gray-900">{vehicle.make}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <p className="text-sm text-gray-900">{vehicle.model}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <p className="text-sm text-gray-900">{vehicle.year}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <p className="text-sm text-gray-900">{vehicle.color}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate
            </label>
            <p className="text-sm text-gray-900">{vehicle.licensePlate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage
            </label>
            <p className="text-sm text-gray-900">{vehicle.mileage.toLocaleString()} miles</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Owner *
          </label>
          <select
            {...register('clientId')}
            disabled={isReadOnly || loadingClients}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
            VIN *
          </label>
          <input
            {...register('vin')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.vin && (
            <p className="mt-1 text-sm text-red-600">{errors.vin.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700">
            Make *
          </label>
          <input
            {...register('make')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.make && (
            <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model *
          </label>
          <input
            {...register('model')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <input
            {...register('year', { valueAsNumber: true })}
            type="number"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color *
          </label>
          <input
            {...register('color')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
            License Plate *
          </label>
          <input
            {...register('licensePlate')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.licensePlate && (
            <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
            Mileage *
          </label>
          <input
            {...register('mileage', { valueAsNumber: true })}
            type="number"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.mileage && (
            <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Create Vehicle' : 'Update Vehicle'}
          </Button>
        )}
      </div>
    </form>
  );
};