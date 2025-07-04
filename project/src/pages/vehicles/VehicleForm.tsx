import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { Vehicle, Client } from '../../types';
import { getVehicle, postVehicle, putVehicle } from '../../APIS/VehicleApis';
import { getClient } from '../../APIS/ClientApis';

const schema = yup.object().shape({
  idClient: yup.number().required('Client is required'),
  serialNumberVIN: yup.string().required('VIN is required'),
  brand: yup.string().required('Brand is required'),
  model: yup.string().required('Model is required'),
  year: yup.number().required('Year is required').min(1900).max(new Date().getFullYear() + 1),
  mileage: yup.number().required('Mileage is required').min(0),
});

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface VehicleFormData {
  idClient: number;
  brand: string;
  model: string;
  year: number;
  serialNumberVIN: string;
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
        const data = await getClient();
        if (data) {
          setClients(data);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };
    
    fetchClients();
  }, []);

  useEffect(() => {
    if (vehicle) {
      reset({
        idClient: vehicle.idClient,
        serialNumberVIN: vehicle.serialNumberVIN,
        model: vehicle.model,
        year: vehicle.year,
        brand: vehicle.brand,
        mileage: vehicle.mileage,
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      let response;
      
      if (mode === 'create') {
        await postVehicle(data as any);
      } else if (mode === 'edit' && vehicle) {
        response = await putVehicle(data as any, vehicle.id);
      }
      
      alert(mode === 'create' ? 'Vehículo creado exitosamente.' : 'Vehículo actualizado exitosamente.');
      onSuccess();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      alert('Error inesperado al guardar el vehículo. Por favor, inténtalo de nuevo.');
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && vehicle) {
    const client = clients.find(c => c.id === vehicle.idClient);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <p className="text-sm text-gray-900">
              {client ? `${client.name} ${client.lastName}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN
            </label>
            <p className="text-sm text-gray-900">{vehicle.serialNumberVIN}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <p className="text-sm text-gray-900">{vehicle.brand}</p>
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
          <label htmlFor="idClient" className="block text-sm font-medium text-gray-700">
            Owner *
          </label>
          <select
            {...register('idClient', { valueAsNumber: true })}
            disabled={isReadOnly || loadingClients}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.lastName}
              </option>
            ))}
          </select>
          {errors.idClient && (
            <p className="mt-1 text-sm text-red-600">{errors.idClient.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Brand *
          </label>
          <input
            {...register('brand')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
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
          <label htmlFor="serialNumberVIN" className="block text-sm font-medium text-gray-700">
            VIN *
          </label>
          <input
            {...register('serialNumberVIN')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.serialNumberVIN && (
            <p className="mt-1 text-sm text-red-600">{errors.serialNumberVIN.message}</p>
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