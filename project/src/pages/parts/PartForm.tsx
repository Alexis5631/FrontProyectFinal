import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { Part } from '../../types';
import { getReplacement, posReplacement, putReplacement } from '../../APIS/ReplacementApis';

const schema = yup.object().shape({
  code: yup.string().required('Part code is required'),
  name: yup.string().required('Part name is required'),
  description: yup.string().required('Description is required'),
  brand: yup.string().required('Brand is required'),
  price: yup.number().required('Price is required').min(0),
  stockQuantity: yup.number().required('Stock quantity is required').min(0),
  minimumStock: yup.number().required('Minimum stock is required').min(0),
  category: yup.string().required('Category is required'),
});

interface PartFormProps {
  part?: Part | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface PartFormData {
  code: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  category: string;
}

const categories = [
  'Engine',
  'Brakes',
  'Suspension',
  'Electrical',
  'Fluids',
  'Filters',
  'Belts & Hoses',
  'Body Parts',
  'Interior',
  'Tools',
  'Other',
];

export const PartForm: React.FC<PartFormProps> = ({
  part,
  mode,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PartFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (part) {
      reset({
        code: part.code,
        name: part.name,
        description: part.description,
        brand: part.brand,
        price: part.price,
        stockQuantity: part.stockQuantity,
        minimumStock: part.minimumStock,
        category: part.category,
      });
    }
  }, [part, reset]);

  const onSubmit = async (data: PartFormData) => {
    try {
      if (mode === 'create') {
        await posReplacement(data as any);
      } else if (mode === 'edit' && part) {
        await putReplacement(data as any, part.id);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save part:', error);
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && part) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Code
            </label>
            <p className="text-sm text-gray-900 font-mono">{part.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-sm text-gray-900">{part.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <p className="text-sm text-gray-900">{part.brand}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-sm text-gray-900">{part.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <p className="text-sm text-gray-900">${part.price.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <p className="text-sm text-gray-900">{part.stockQuantity}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Stock
            </label>
            <p className="text-sm text-gray-900">{part.minimumStock}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{part.description}</p>
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Part Code *
          </label>
          <input
            {...register('code')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-mono"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
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
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            {...register('category')}
            disabled={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price *
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            step="0.01"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
            Stock Quantity *
          </label>
          <input
            {...register('stockQuantity', { valueAsNumber: true })}
            type="number"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.stockQuantity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="minimumStock" className="block text-sm font-medium text-gray-700">
            Minimum Stock *
          </label>
          <input
            {...register('minimumStock', { valueAsNumber: true })}
            type="number"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.minimumStock && (
            <p className="mt-1 text-sm text-red-600">{errors.minimumStock.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={3}
            readOnly={isReadOnly}
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
            {mode === 'create' ? 'Create Part' : 'Update Part'}
          </Button>
        )}
      </div>
    </form>
  );
};