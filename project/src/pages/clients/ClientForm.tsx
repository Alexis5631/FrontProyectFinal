import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { Client } from '../../types';
import { getClient, postClient, putClient, deleteClient } from '../../APIS/ClientApis';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  identification: yup.string().required('Identification is required'),
});

interface ClientFormProps {
  client?: Client | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface ClientFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  identification: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  mode,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        identification: client.identification,
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (mode === 'create') {
        await postClient({ ...data, id: 0 });
      } else if (mode === 'edit' && client) {
        const clientData: Client = {
          ...data,
          id: client.id
        };
        await putClient(clientData, client.id);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && client) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <p className="text-sm text-gray-900">{client.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <p className="text-sm text-gray-900">{client.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">{client.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-sm text-gray-900">{client.phone}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identification
            </label>
            <p className="text-sm text-gray-900">{client.identification}</p>
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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Name 
          </label>
          <input
            {...register('name')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            {...register('lastName')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            {...register('phone')}
            type="tel"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Identification *
          </label>
          <textarea
            {...register('identification')}
            rows={3}
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.identification && (
            <p className="mt-1 text-sm text-red-600">{errors.identification.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Create Client' : 'Update Client'}
          </Button>
        )}
      </div>
    </form>
  );
};