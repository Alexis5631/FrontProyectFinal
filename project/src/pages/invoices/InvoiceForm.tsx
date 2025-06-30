import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../components/common/Button';
import { Invoice, ServiceOrder, Client } from '../../types';
import { getInvoice, postInvoice, putInvoice } from '../../APIS/InvoiceApis';

const schema = yup.object().shape({
  orderId: yup.string().required('Service order is required'),
  invoiceNumber: yup.string().required('Invoice number is required'),
  issueDate: yup.string().required('Issue date is required'),
  dueDate: yup.string().required('Due date is required'),
  subtotal: yup.number().required('Subtotal is required').min(0),
  taxAmount: yup.number().required('Tax amount is required').min(0),
  totalAmount: yup.number().required('Total amount is required').min(0),
  status: yup.string().required('Status is required'),
});

interface InvoiceFormProps {
  invoice?: Invoice | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onCancel: () => void;
}

interface InvoiceFormData {
  orderId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: yupResolver(schema),
  });

  const subtotal = watch('subtotal');
  const taxAmount = watch('taxAmount');

  useEffect(() => {
    setOrders([]);
    setLoadingOrders(false);
  }, []);

  useEffect(() => {
    if (invoice) {
      reset({
        orderId: invoice.orderId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
      });
    } else {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setValue('invoiceNumber', invoiceNumber);
      setValue('issueDate', new Date().toISOString().split('T')[0]);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setValue('dueDate', dueDate.toISOString().split('T')[0]);
    }
  }, [invoice, reset, setValue]);

  useEffect(() => {
    if (subtotal !== undefined && taxAmount !== undefined) {
      setValue('totalAmount', subtotal + taxAmount);
    }
  }, [subtotal, taxAmount, setValue]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      };
      if (mode === 'create') {
        await postInvoice(invoiceData as any);
      } else if (mode === 'edit' && invoice) {
        await putInvoice(invoiceData as any, invoice.id);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const isReadOnly = mode === 'view';

  if (mode === 'view' && invoice) {
    const order = orders.find(o => o.id === invoice.orderId);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <p className="text-sm text-gray-900 font-mono">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-sm text-gray-900 capitalize">{invoice.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Order
            </label>
            <p className="text-sm text-gray-900">
              {order ? `#${order.id.slice(-6)} - ${order.description}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <p className="text-sm text-gray-900">
              {invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <p className="text-sm text-gray-900">
              {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <p className="text-sm text-gray-900">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtotal
            </label>
            <p className="text-sm text-gray-900">${invoice.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Amount
            </label>
            <p className="text-sm text-gray-900">${invoice.taxAmount.toFixed(2)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <p className="text-lg font-semibold text-gray-900">${invoice.totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button variant="secondary">
            Download PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
            Invoice Number *
          </label>
          <input
            {...register('invoiceNumber')}
            type="text"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-mono"
          />
          {errors.invoiceNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
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
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
            Service Order *
          </label>
          <select
            {...register('orderId')}
            disabled={isReadOnly || loadingOrders}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Select a service order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                #{order.id.slice(-6)} - {order.description} (${order.totalCost})
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            Issue Date *
          </label>
          <input
            {...register('issueDate')}
            type="date"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date *
          </label>
          <input
            {...register('dueDate')}
            type="date"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700">
            Subtotal *
          </label>
          <input
            {...register('subtotal', { valueAsNumber: true })}
            type="number"
            step="0.01"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.subtotal && (
            <p className="mt-1 text-sm text-red-600">{errors.subtotal.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="taxAmount" className="block text-sm font-medium text-gray-700">
            Tax Amount *
          </label>
          <input
            {...register('taxAmount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
          {errors.taxAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.taxAmount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
            Total Amount *
          </label>
          <input
            {...register('totalAmount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-semibold text-lg"
          />
          {errors.totalAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
          </Button>
        )}
      </div>
    </form>
  );
};