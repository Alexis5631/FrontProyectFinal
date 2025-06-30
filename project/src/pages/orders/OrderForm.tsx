import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { ServiceOrder, Client, Vehicle, User, Part } from '../../types';
import { getOrderDetails, postOrderDetails, putOrderDetails } from '../../APIS/OrderDetailsApis';

const schema = yup.object().shape({
  clientId: yup.string().required('Client is required'),
  vehicleId: yup.string().required('Vehicle is required'),
  mechanicId: yup.string().required('Mechanic is required'),
  description: yup.string().required('Description is required'),
  estimatedCost: yup.number().required('Estimated cost is required').min(0),
  startDate: yup.string().required('Start date is required'),
  status: yup.string().required('Status is required'),
});

interface OrderFormProps {
  order?: ServiceOrder | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface OrderFormData {
  clientId: string;
  vehicleId: string;
  mechanicId: string;
  description: string;
  estimatedCost: number;
  startDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [selectedClientVehicles, setSelectedClientVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<OrderFormData>({
    resolver: yupResolver(schema),
  });

  const selectedClientId = watch('clientId');

  useEffect(() => {
    // Aquí deberías obtener los datos reales de clientes, vehículos y mecánicos si tienes endpoints, si no, dejar vacío
    setClients([]);
    setVehicles([]);
    setMechanics([]);
    setLoading(false);
  }, []);

  // Filter vehicles by selected client
  useEffect(() => {
    if (selectedClientId) {
      const clientVehicles = vehicles.filter(vehicle => vehicle.clientId === selectedClientId);
      setSelectedClientVehicles(clientVehicles);
      
      // Reset vehicle selection if current vehicle doesn't belong to selected client
      const currentVehicleId = watch('vehicleId');
      if (currentVehicleId && !clientVehicles.find(v => v.id === currentVehicleId)) {
        setValue('vehicleId', '');
      }
    } else {
      setSelectedClientVehicles([]);
    }
  }, [selectedClientId, vehicles, setValue, watch]);

  useEffect(() => {
    if (order) {
      reset({
        clientId: order.clientId,
        vehicleId: order.vehicleId,
        mechanicId: order.mechanicId,
        description: order.description,
        estimatedCost: order.estimatedCost,
        startDate: order.startDate.split('T')[0],
        status: order.status,
      });
    } else {
      // Set default values for new orders
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('status', 'pending');
    }
  }, [order, reset, setValue]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      const orderData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        totalCost: data.estimatedCost,
      };
      if (mode === 'create') {
        await postOrderDetails(orderData as any); // Ajusta el tipo según tu modelo
      } else if (mode === 'edit' && order) {
        await putOrderDetails(orderData as any, order.id);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && order) {
    const client = clients.find(c => c.id === order.clientId);
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    const mechanic = mechanics.find(m => m.id === order.mechanicId);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <p className="text-sm text-gray-900 font-mono">#{order.id.slice(-6)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-sm text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <p className="text-sm text-gray-900">
              {client ? `${client.firstName} ${client.lastName}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle
            </label>
            <p className="text-sm text-gray-900">
              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mechanic
            </label>
            <p className="text-sm text-gray-900">
              {mechanic ? `${mechanic.firstName} ${mechanic.lastName}` : 'Unassigned'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <p className="text-sm text-gray-900">
              {new Date(order.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Cost
            </label>
            <p className="text-sm text-gray-900">${order.estimatedCost.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Cost
            </label>
            <p className="text-sm text-gray-900">${order.totalCost.toFixed(2)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{order.description}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button variant="secondary">
            Print Order
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Client *
          </label>
          <select
            {...register('clientId')}
            disabled={isReadOnly}
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
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
            Vehicle *
          </label>
          <select
            {...register('vehicleId')}
            disabled={isReadOnly || !selectedClientId}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a vehicle</option>
            {selectedClientVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mechanicId" className="block text-sm font-medium text-gray-700">
            Mechanic *
          </label>
          <select
            {...register('mechanicId')}
            disabled={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a mechanic</option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.firstName} {mechanic.lastName}
              </option>
            ))}
          </select>
          {errors.mechanicId && (
            <p className="mt-1 text-sm text-red-600">{errors.mechanicId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            {...register('status')}
            disabled={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            {...register('startDate')}
            type="date"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700">
            Estimated Cost *
          </label>
          <input
            {...register('estimatedCost', { valueAsNumber: true })}
            type="number"
            step="0.01"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.estimatedCost && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedCost.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            readOnly={isReadOnly}
            placeholder="Describe the work to be performed..."
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Create Order' : 'Update Order'}
          </Button>
        )}
      </div>
    </form>
  );
};