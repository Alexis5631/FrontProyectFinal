import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Search, Edit, Eye, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { ServiceOrder, Replacement, OrderDetails, State, Client, Vehicle } from '../../types';
import { getOrderDetails, putOrderDetails, deleteOrderDetails } from '../../APIS/OrderDetailsApis';
import { getServiceOrder } from '../../APIS/ServiceOrderApis';
import { getReplacement } from '../../APIS/ReplacementApis';
import { getState } from '../../APIS/StateApis';
import { getVehicle } from '../../APIS/VehicleApis';
import { getClient } from '../../APIS/ClientApis';
import { Layout } from '../../components/layout/Layout';

export const OrdersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetails | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
    const [formValues, setFormValues] = useState<Partial<OrderDetails>>({});
    const [replacements, setReplacements] = useState<Replacement[]>([]);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [clientsData, vehiclesData, serviceOrdersData, replacementsData, orderDetailsData, statesData] = await Promise.all([
                getClient(),
                getVehicle(),
                getServiceOrder(),
                getReplacement(),
                getOrderDetails(),
                getState()
            ]);

            if (clientsData) setClients(clientsData);
            if (vehiclesData) setVehicles(vehiclesData);
            if (serviceOrdersData) setServiceOrders(serviceOrdersData);
            if (replacementsData) setReplacements(replacementsData);
            if (orderDetailsData) setOrderDetails(orderDetailsData);
            if (statesData) setStates(statesData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error al cargar los datos. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (orderDetail: OrderDetails) => {
        try {
            setIsLoading(true);
            // Verificar si el detalle de orden aún existe antes de editar
            const response = await fetch(`http://localhost:5202/api/OrderDetails/${orderDetail.id}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    alert('El detalle de orden no existe o ya fue eliminado. La lista se actualizará.');
                    fetchData();
                    return;
                } else {
                    alert('Error al verificar el detalle de orden. Por favor, inténtalo de nuevo.');
                    return;
                }
            }
            
            setSelectedOrderDetail(orderDetail);
            setFormValues(orderDetail);
            setShowModal(true);
        } catch (error) {
            console.error('Error checking order detail:', error);
            alert('Error al verificar el detalle de orden. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreate = () => {
        setSelectedOrderDetail(null);
        setFormValues({});
        setShowModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formValues.idOrder || !formValues.idReplacement || !formValues.quantity) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            
            if (selectedOrderDetail) {
                // Edit
                response = await putOrderDetails(formValues as OrderDetails, selectedOrderDetail.id);
            } else {
                // Create - Aquí necesitarías implementar la función de creación
                alert('Función de creación no implementada. Por favor, implementa postOrderDetails.');
                return;
            }
            
            // Verificar si hay respuesta y si es un error HTTP
            if (response && response.status >= 400) {
                // Manejar diferentes tipos de errores HTTP
                if (response.status === 404) {
                    alert('El detalle de orden no existe o ya fue eliminado.');
                } else if (response.status === 409) {
                    alert('Ya existe un detalle de orden con estos datos. Por favor, verifica la información.');
                } else if (response.status === 400) {
                    alert('Datos inválidos. Por favor, verifica la información ingresada.');
                } else if (response.status === 403) {
                    alert('No tienes permisos para realizar esta acción.');
                } else {
                    alert('Error al guardar el detalle de orden. Por favor, inténtalo de nuevo.');
                }
                return;
            }
            
            // Si llegamos aquí, la operación fue exitosa
            alert(selectedOrderDetail ? 'Detalle de orden actualizado exitosamente.' : 'Detalle de orden creado exitosamente.');
            setShowModal(false);
            await fetchData();
        } catch (error) {
            console.error('Failed to save order detail:', error);
            alert('Error inesperado al guardar el detalle de orden. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceOrdersCompleted = () => {
        return serviceOrders.filter(order => {
            const state = states.find(s => s.id === order.idState);
            return state && (state.stateType.toLowerCase().includes('completada') || 
                           state.stateType.toLowerCase().includes('terminada') ||
                           state.stateType.toLowerCase().includes('finalizada'));
        }).length;
    };

    const getServiceOrdersPending = () => {
        return serviceOrders.filter(order => {
            const state = states.find(s => s.id === order.idState);
            return state && (state.stateType.toLowerCase().includes('pendiente') || 
                           state.stateType.toLowerCase().includes('espera') ||
                           state.stateType.toLowerCase().includes('nueva'));
        }).length;
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este detalle de orden?')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await deleteOrderDetails(id);
            
            // Verificar si hay respuesta y si es un error HTTP
            if (response && response.status >= 400) {
                // Manejar diferentes tipos de errores HTTP
                if (response.status === 404) {
                    alert('El detalle de orden no existe o ya fue eliminado.');
                } else if (response.status === 409) {
                    alert('No se puede eliminar el detalle de orden porque está siendo usado.');
                } else if (response.status === 403) {
                    alert('No tienes permisos para eliminar este detalle de orden.');
                } else {
                    alert('Error al eliminar el detalle de orden. Por favor, inténtalo de nuevo.');
                }
                return;
            }
            
            // Si llegamos aquí, la operación fue exitosa
            alert('Detalle de orden eliminado exitosamente.');
            await fetchData();
        } catch (error) {
            console.error('Failed to delete order detail:', error);
            alert('Error inesperado al eliminar el detalle de orden. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrderDetails = orderDetails.filter(detail => {
        if (!searchTerm) return true; // Si no hay búsqueda, muestra todo
        return (
            detail.replacement?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            detail.replacement?.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Función para obtener el vehículo a partir del detalle de orden
    const getVehicleFromOrderDetail = (detail: OrderDetails): Vehicle | undefined => {
        const serviceOrder = serviceOrders.find(o => o.id === detail.idOrder);
        if (!serviceOrder) return undefined;
        return vehicles.find(v => v.id === serviceOrder.idVehicle);
    };

    // Función para obtener el cliente a partir del detalle de orden
    const getClientFromOrderDetail = (detail: OrderDetails): Client | undefined => {
        const serviceOrder = serviceOrders.find(o => o.id === detail.idOrder);
        if (!serviceOrder) return undefined;
        const vehicle = vehicles.find(v => v.id === serviceOrder.idVehicle);
        if (!vehicle) return undefined;
        return clients.find(c => c.id === vehicle.idClient);
    };

    const getReplacementName = (replacementId: number): string => {
        const replacement = replacements.find(r => r.id === replacementId);
        return replacement ? `${replacement.description}` : 'N/A'; 
    };

    return (
        <Layout title="Gestión de Detalles de Orden">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                            Gestión de Detalles de Orden
                        </h1>
                        <p className="text-neutral-600 mt-1">Administra la información de las órdenes de servicio</p>
                    </div>
                    <Button onClick={handleCreate} className="shadow-medium" disabled={isLoading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Detalle de Orden
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-neutral-600">Total Detalles de Orden</p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{orderDetails.length}</p>
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
                                    <p className="text-sm font-semibold text-neutral-600">Total Órdenes</p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{serviceOrders.length}</p>
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
                                    <p className="text-sm font-semibold text-neutral-600">Órdenes Completadas</p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{getServiceOrdersCompleted()}</p>
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
                                    <p className="text-sm font-semibold text-neutral-600">Órdenes Pendientes</p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{getServiceOrdersPending()}</p>
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
                                Lista de Detalles de Orden
                            </CardTitle>
                            <div className="flex space-x-4">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="Buscar detalles de orden..."
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
                                                Detalle de Orden
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                                Cliente / Vehículo
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                                Repuesto
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                                Costo Total
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200">
                                        {filteredOrderDetails.map((detail) => {
                                            return (
                                                <tr key={detail.id} className="hover:bg-gradient-to-r hover:from-neutral-50 hover:to-neutral-100 transition-all duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-bold text-neutral-900">{detail.id}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-semibold text-neutral-900">
                                                                {getClientFromOrderDetail(detail)?.name || 'N/A'} {getClientFromOrderDetail(detail)?.lastName || ''}
                                                            </div>
                                                            <div className="text-sm text-neutral-500">
                                                                {getVehicleFromOrderDetail(detail)?.brand || ''} • {getVehicleFromOrderDetail(detail)?.serialNumberVIN || ''}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700">
                                                            {getReplacementName(detail.idReplacement)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-neutral-900">
                                                            {detail.quantity}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-neutral-900">
                                                            ${detail.totalCost?.toLocaleString() || '0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Button variant="ghost" size="sm" className="hover:bg-accent-50 hover:text-accent-600" onClick={() => handleEdit(detail)} disabled={isLoading}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(detail.id)} className="hover:bg-danger-50 hover:text-danger-600" disabled={isLoading}>
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

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-strong border border-neutral-200">
                            <h2 className="text-xl font-bold text-neutral-900 mb-6">
                                {selectedOrderDetail ? 'Editar Detalle' : 'Nuevo Detalle'}
                            </h2>
                            <div className="space-y-4">
                                <Select 
                                    label="Orden de Servicio *" 
                                    name="idOrder" 
                                    value={formValues.idOrder || ''} 
                                    onChange={e => setFormValues(prev => ({
                                        ...prev,
                                        idOrder: Number(e.target.value)
                                    }))}
                                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                >
                                    <option value="">Seleccionar Orden de Servicio</option>
                                    {serviceOrders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.id} - {order.entryDate}
                                        </option>
                                    ))}
                                </Select>
                                <Select 
                                    label="Repuesto *" 
                                    name="idReplacement" 
                                    value={formValues.idReplacement || ''} 
                                    onChange={e => setFormValues(prev => ({
                                        ...prev,
                                        idReplacement: Number(e.target.value)
                                    }))}
                                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                >
                                    <option value="">Seleccionar repuesto</option>
                                    {replacements.map(replacement => (
                                        <option key={replacement.id} value={replacement.id}>
                                            {replacement.description} - ${replacement.unitPrice}
                                        </option>
                                    ))}
                                </Select>
                                <Input 
                                    label="Cantidad *" 
                                    type="number" 
                                    name="quantity" 
                                    value={formValues.quantity || ''} 
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : (selectedOrderDetail ? 'Actualizar' : 'Crear')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
