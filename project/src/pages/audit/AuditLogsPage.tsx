import React, { useState, useEffect, useCallback } from 'react';
import { Activity, User, Calendar, Filter, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { getAuditory } from '../../APIS/AuditoryApis';
import type { Auditory } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<Auditory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAuditory();
        if (data) {
          setAuditLogs(data);
        } else {
          setAuditLogs([]);
        }
      } catch (err) {
        setError('Error al cargar auditoría');
      } finally {
        setLoading(false);
      }
    };
    fetchAuditory();
  }, []);

  const columns: Column<Auditory>[] = [
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {log.date ? new Date(log.date).toLocaleDateString() : ''}
          </div>
          <div className="text-gray-500">
            {log.date ? new Date(log.date).toLocaleTimeString() : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'changedBy',
      header: 'Usuario',
      render: (log) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {log.changedBy || 'Desconocido'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'changeType',
      header: 'Acción',
      sortable: true,
      render: (log) => (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
            {log.changeType?.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Entidad',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 capitalize">
            {log.entityName}
          </div>
        </div>
      ),
    },
  ];

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
                <p className="text-2xl font-semibold text-gray-900">{auditLogs.length}</p>
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
                  {auditLogs.filter(log => log.changeType?.toLowerCase() === 'create').length}
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
                  {auditLogs.filter(log => log.changeType?.toLowerCase() === 'update').length}
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
                  {auditLogs.filter(log => log.changeType?.toLowerCase() === 'delete').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Filters (puedes dejar los filtros pero no funcionarán hasta que la API los soporte) */}
        {/* Tabla de datos */}
        <DataTable
          data={auditLogs}
          columns={columns}
          loading={loading}
          error={error}
          pagination={undefined}
          onSort={undefined}
          sortKey={undefined}
          sortDirection={undefined}
          emptyMessage="No audit logs found"
        />
      </div>
    </Layout>
  );
};