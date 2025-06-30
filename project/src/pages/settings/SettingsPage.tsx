import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AlertCircle, Plus, Search, Edit, Eye, Clock, CheckCircle, AlertTriangle, XCircle, CreditCardIcon, FileText, Key, Bell, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { ServiceOrder, Client, Vehicle, User, Replacement, State, ServiceType} from '../../types';
import { getServiceOrder, postServiceOrder, putServiceOrder, deleteServiceOrder } from '../../APIS/ServiceOrderApis';
import { getVehicle } from '../../APIS/VehicleApis';
import { getClient } from '../../APIS/ClientApis';
import { getState } from '../../APIS/StateApis';
import { getUser } from '../../APIS/UserApis';
import { get } from 'react-hook-form';
import { getServiceType } from '../../APIS/ServiceTypeApis';
import { Layout } from '../../components/layout/Layout';

export const SettingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<ServiceOrder | null>(null);
  const [ordenes, setOrdenes] = useState<ServiceOrder[]>([]);
  const [formValues, setFormValues] = useState<Partial<ServiceOrder>>({});
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [estados, setStates] = useState<State[]>([]);
  const [servicios, setType] = useState<ServiceType[]>([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [clientes, setClientes] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordenesData, vehiculosData, usuariosData, estadosData, serviciosData, clientesData] = await Promise.all([
        getServiceOrder(),
        getVehicle(),
        getUser(),
        getState(),
        getServiceType(),
        getClient()
      ]);

      if (ordenesData) setOrdenes(ordenesData);
      if (vehiculosData) setVehiculos(vehiculosData);
      if (usuariosData) setUsuarios(usuariosData);
      if (estadosData) setStates(estadosData);
      if (serviciosData) setType(serviciosData);
      if (clientesData) setClientes(clientesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el nombre del estado a partir del state_id
  const getStateName = (state_id: number) => {
    const estado = estados.find(e => e.id === state_id);
    return estado ? `${estado.stateType}` : 'Sin estado';
  };

  // Obtener el id del estado seleccionado a partir del nombre
  const selectedState = estados.find(e => e.stateType.toLowerCase() === filterEstado);

  const filteredOrdenes = ordenes.filter(orden => {
    if (filterEstado === '') return (
      searchTerm === '' ||
      orden.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const estado = estados.find(e => e.id === orden.idState);
    return (
      estado && estado.stateType.toLowerCase() === filterEstado &&
      (
        searchTerm === '' ||
        orden.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleEdit = (orden: ServiceOrder) => {
    setSelectedOrden(orden);
    setFormValues(orden);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedOrden(null);
    setFormValues({});
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormValues(prev => ({ ...prev, [name]: value }));
    };

  // Función para obtener el cliente a partir del vehículo
  const getClientFromOrder = (orden: ServiceOrder): Client | undefined => {
    const vehicle = vehiculos.find(v => v.id === orden.idVehicle);
    if (!vehicle) return undefined;
    return clientes.find(c => c.id === vehicle.idClient);
  };

  // Función para obtener el vehículo a partir de la orden
  const getVehicleFromOrder = (orden: ServiceOrder): Vehicle | undefined => {
    return vehiculos.find(v => v.id === orden.idVehicle);
  };

  // Funciones para calcular estadísticas
  const getOrdenesByState = (stateName: string) => {
    return ordenes.filter(orden => {
      const estado = estados.find(e => e.id === orden.idState);
      return estado && estado.stateType.toLowerCase() === stateName.toLowerCase();
    }).length;
  };

  const getOrdenesEnProceso = () => {
    return ordenes.filter(orden => {
      const estado = estados.find(e => e.id === orden.idState);
      return estado && (estado.stateType.toLowerCase().includes('proceso') || 
                       estado.stateType.toLowerCase().includes('trabajando') ||
                       estado.stateType.toLowerCase().includes('reparando'));
    }).length;
  };

  const getOrdenesCompletadas = () => {
    return ordenes.filter(orden => {
      const estado = estados.find(e => e.id === orden.idState);
      return estado && (estado.stateType.toLowerCase().includes('completada') || 
                       estado.stateType.toLowerCase().includes('terminada') ||
                       estado.stateType.toLowerCase().includes('finalizada'));
    }).length;
  };

  const getOrdenesPendientes = () => {
    return ordenes.filter(orden => {
      const estado = estados.find(e => e.id === orden.idState);
      return estado && (estado.stateType.toLowerCase().includes('pendiente') || 
                       estado.stateType.toLowerCase().includes('espera') ||
                       estado.stateType.toLowerCase().includes('nueva'));
    }).length;
  };

  const handleSubmit = async () => {
    if (!formValues.idVehicle) {
      alert('Debes seleccionar un vehículo válido.');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedOrden) {
        const response = await putServiceOrder(formValues as ServiceOrder, selectedOrden.id);
        if (!response || !response.ok) {
          alert('No se pudo editar la orden de servicio.');
        } else {
          alert('La orden de servicio ha sido editada exitosamente');
          setShowModal(false);
          await loadData();
        }
      } else {
        const response = await postServiceOrder(formValues as ServiceOrder);
        if (!response || !response.ok) {
          alert('No se pudo crear la orden de servicio.');
        } else {
          alert('La orden de servicio ha sido creada exitosamente');
          setShowModal(false);
          await loadData();
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al procesar la orden. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: number | string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta orden de servicio?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await deleteServiceOrder(id);
      if (!response || !response.ok) {
        alert('No se pudo eliminar la orden de servicio.');
      } else {
        alert('La orden de servicio ha sido eliminada exitosamente');
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error al eliminar la orden. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFromOrder = (orden: ServiceOrder): User | undefined => {
    const userId = orden.idUser;
    if (userId) {
      return usuarios.find(u => u.id === userId);
    }
    return undefined;
  };

  return (
    <Layout title="Órdenes de Servicio">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
              Órdenes de Servicio
            </h1>
            <p className="text-neutral-600 mt-1">Gestiona las órdenes de trabajo del taller</p>
          </div>
          <Button onClick={handleCreate} className="shadow-medium" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Total Órdenes</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{ordenes.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-500 to-neutral-600 shadow-medium">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">En Proceso</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{getOrdenesEnProceso()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 shadow-medium">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Completadas</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{getOrdenesCompletadas()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-success-500 to-success-600 shadow-medium">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Pendientes</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{getOrdenesPendientes()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-warning-500 to-warning-600 shadow-medium">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                Lista de Órdenes
              </CardTitle>
              <div className="flex space-x-4">
                <Select value={filterEstado} onChange={e => setFilterEstado(e.target.value.toLowerCase())}>
                  <option value="">Todos los estados</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.stateType.toLowerCase()}>
                      {estado.stateType}
                    </option>
                  ))}
                </Select>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar órdenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-neutral-600">Cargando...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Orden
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Cliente / Vehículo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Mecánico
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Fecha de Salida
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredOrdenes.map((orden) => {
                      const estadoName = getStateName(orden.idState);
                      const EstadoIcon = AlertCircle;
                      return (
                        <tr key={orden.id} className="hover:bg-gradient-to-r hover:from-neutral-50 hover:to-neutral-100 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-bold text-neutral-900">{orden.id}</div>
                              <div className="text-sm text-neutral-500">
                                {orden.entryDate}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-neutral-900">
                                {getClientFromOrder(orden)?.name || 'N/A'} {getClientFromOrder(orden)?.lastName || ''}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {getVehicleFromOrder(orden)?.brand || ''} • {getVehicleFromOrder(orden)?.serialNumberVIN || ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">{getUserFromOrder(orden)?.name || 'N/A'} {getUserFromOrder(orden)?.lastName || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700">
                              <EstadoIcon className="h-3 w-3 mr-1" />
                              {estadoName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-neutral-900">
                              {orden.exitDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm" className="hover:bg-accent-50 hover:text-accent-600" onClick={() => handleEdit(orden)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(orden.id)} className="hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-strong border border-neutral-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">
                {selectedOrden ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Select 
                    name="idVehicle" 
                    label="Vehículo" 
                    value={formValues.idVehicle || ''} 
                    onChange={e => {
                      const value = e.target.value;
                      setFormValues(prev => ({
                        ...prev,
                        idVehicle: value ? Number(value) : undefined
                      }));
                    }} 
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos.map(vehiculo => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.brand} {vehiculo.model}
                      </option>
                    ))}
                  </Select>
                  
                  <Select 
                    label="Mecánico" 
                    name="idUser" 
                    value={formValues.idUser || ''} 
                    onChange={e => setFormValues(prev => ({
                      ...prev,
                      idUser: Number(e.target.value)
                    }))}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  >
                    <option value="">Asignar mecánico</option>
                    {usuarios.map(mecanico => (
                      <option key={mecanico.id} value={mecanico.id}>
                        {mecanico.name} {mecanico.lastName}
                      </option>
                    ))}
                  </Select>
                  
                  <Select 
                    label="Estado" 
                    name="idState" 
                    value={formValues.idState || ''} 
                    onChange={e => setFormValues(prev => ({
                      ...prev,
                      idState: Number(e.target.value)
                    }))}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  >
                    <option value="">Asignar estado</option>
                    {estados.map(estado => (
                      <option key={estado.id} value={estado.id}>
                        {estado.stateType}
                      </option>
                    ))}
                  </Select>
                  
                  <Input
                    label="Fecha de Entrada"
                    type="date"
                    name="entryDate"
                    value={formValues.entryDate || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  
                  <Input
                    label="Fecha de Salida"
                    type="date"
                    name="exitDate"
                    value={formValues.exitDate || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje del Cliente
                    </label>
                    <textarea
                      name="clientMessage"
                      value={formValues.clientMessage || ''}
                      onChange={(e) => setFormValues(prev => ({
                        ...prev,
                        clientMessage: e.target.value
                      }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mensaje del cliente sobre el problema..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Guardando...' : (selectedOrden ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};