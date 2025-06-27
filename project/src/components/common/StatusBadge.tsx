import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'invoice' | 'stock' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default',
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (variant) {
      case 'order':
        switch (status) {
          case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'in_progress':
            return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'completed':
            return 'bg-green-100 text-green-800 border-green-200';
          case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      case 'invoice':
        switch (status) {
          case 'draft':
            return 'bg-gray-100 text-gray-800 border-gray-200';
          case 'sent':
            return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'paid':
            return 'bg-green-100 text-green-800 border-green-200';
          case 'overdue':
            return 'bg-red-100 text-red-800 border-red-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      case 'stock':
        switch (status) {
          case 'low':
            return 'bg-red-100 text-red-800 border-red-200';
          case 'adequate':
            return 'bg-green-100 text-green-800 border-green-200';
          case 'out':
            return 'bg-gray-100 text-gray-800 border-gray-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusConfig()} ${className}`}>
      {formatStatus(status)}
    </span>
  );
};