import React, { useState, useEffect, useCallback } from 'react';
import { Activity, User, Calendar, Filter, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { AuditLog } from '../../types';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { format } from 'date-fns';

export const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const pagination = usePagination({ initialPageSize: 50 });
  const { data, loading, error, execute } = useApi(api.auditLogs.getAll);

  const fetchAuditLogs = useCallback(async () => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm,
      sortBy: sortKey,
      sortOrder: sortDirection,
      ...(actionFilter && { action: actionFilter }),
      ...(entityFilter && { entity: entityFilter }),
      ...(dateFilter && { date: dateFilter }),
    };
    
    try {
      const response = await execute(params);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, [execute, pagination.page, pagination.pageSize, searchTerm, sortKey, sortDirection, actionFilter, entityFilter, dateFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    pagination.goToFirstPage();
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    pagination.goToFirstPage();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'login':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      default:
        return '📝';
    }
  };

  const formatChanges = (oldValues?: Record<string, any>, newValues?: Record<string, any>) => {
    if (!oldValues && !newValues) return null;
    
    if (newValues && !oldValues) {
      // Creation
      return (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Created with:</span>
          <div className="mt-1 space-y-1">
            {Object.entries(newValues).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-medium w-20 truncate">{key}:</span>
                <span className="text-green-600 truncate">{String(value)}</span>
              </div>
            ))}
            {Object.keys(newValues).length > 3 && (
              <div className="text-gray-500">... and {Object.keys(newValues).length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    if (oldValues && newValues) {
      // Update
      const changes = Object.keys(newValues).filter(key => 
        oldValues[key] !== newValues[key]
      );
      
      if (changes.length === 0) return null;

      return (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Changed:</span>
          <div className="mt-1 space-y-1">
            {changes.slice(0, 2).map((key) => (
              <div key={key} className="flex flex-col">
                <span className="font-medium">{key}:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 line-through truncate max-w-24">
                    {String(oldValues[key])}
                  </span>
                  <span>→</span>
                  <span className="text-green-600 truncate max-w-24">
                    {String(newValues[key])}
                  </span>
                </div>
              </div>
            ))}
            {changes.length > 2 && (
              <div className="text-gray-500">... and {changes.length - 2} more changes</div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {format(new Date(log.timestamp), 'MMM dd, yyyy')}
          </div>
          <div className="text-gray-500">
            {format(new Date(log.timestamp), 'HH:mm:ss')}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (log) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
            </div>
            <div className="text-gray-500">
              {log.user?.role || 'system'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (log) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getActionIcon(log.action)}</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
            {log.action.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 capitalize">
            {log.entity}
          </div>
          <div className="text-gray-500 font-mono text-xs">
            ID: {log.entityId.slice(-8)}
          </div>
        </div>
      ),
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (log) => formatChanges(log.oldValues, log.newValues),
    },
  ];

  // Mock data for demonstration since audit logs aren't implemented in the mock API
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      action: 'create',
      entity: 'client',
      entityId: 'client-123',
      newValues: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: '' },
    },
    {
      id: '2',
      userId: '2',
      action: 'update',
      entity: 'vehicle',
      entityId: 'vehicle-456',
      oldValues: { mileage: 45000 },
      newValues: { mileage: 47500 },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: { id: '2', firstName: 'John', lastName: 'Mechanic', email: 'mechanic@example.com', role: 'mechanic', isActive: true, createdAt: '' },
    },
    {
      id: '3',
      userId: '1',
      action: 'delete',
      entity: 'part',
      entityId: 'part-789',
      oldValues: { name: 'Old Brake Pad', stockQuantity: 0 },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      user: { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: '' },
    },
    {
      id: '4',
      userId: '3',
      action: 'login',
      entity: 'user',
      entityId: 'user-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      user: { id: '3', firstName: 'Jane', lastName: 'Receptionist', email: 'reception@example.com', role: 'receptionist', isActive: true, createdAt: '' },
    },
  ];

  const displayLogs = auditLogs.length > 0 ? auditLogs : mockAuditLogs;

  return (
    <Layout title="Audit Logs">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-semibold text-gray-900">{displayLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <span className="text-white text-lg">➕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-2xl font-semibold text-green-600">
                  {displayLogs.filter(log => log.action === 'create').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <span className="text-white text-lg">✏️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Updated</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {displayLogs.filter(log => log.action === 'update').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500">
                <span className="text-white text-lg">🗑️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deleted</p>
                <p className="text-2xl font-semibold text-red-600">
                  {displayLogs.filter(log => log.action === 'delete').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              placeholder="Search logs..."
              onSearch={handleSearch}
              className="w-full"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Entities</option>
              <option value="client">Clients</option>
              <option value="vehicle">Vehicles</option>
              <option value="order">Orders</option>
              <option value="part">Parts</option>
              <option value="invoice">Invoices</option>
              <option value="user">Users</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <DataTable
          data={displayLogs}
          columns={columns}
          loading={loading}
          error={error}
          pagination={
            data
              ? {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  total: data.total || displayLogs.length,
                  totalPages: data.totalPages || Math.ceil(displayLogs.length / pagination.pageSize),
                  onPageChange: pagination.setPage,
                  onPageSizeChange: pagination.setPageSize,
                }
              : {
                  page: 1,
                  pageSize: pagination.pageSize,
                  total: displayLogs.length,
                  totalPages: Math.ceil(displayLogs.length / pagination.pageSize),
                  onPageChange: pagination.setPage,
                  onPageSizeChange: pagination.setPageSize,
                }
          }
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No audit logs found"
        />
      </div>
    </Layout>
  );
};