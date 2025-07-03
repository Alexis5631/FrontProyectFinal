import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Search, Edit, Eye, Clock, CheckCircle, Trash2} from 'lucide-react';
import { ServiceOrder, Replacement, OrderDetails, State, Client, Vehicle } from '../../types';
import { getOrderDetails, putOrderDetails, deleteOrderDetails } from '../../APIS/OrderDetailsApis';
import { getServiceOrder, generateServiceOrder } from '../../APIS/ServiceOrderApis';
import { getReplacement } from '../../APIS/ReplacementApis';
import { getState } from '../../APIS/StateApis';
import { getVehicle } from '../../APIS/VehicleApis';
import { getClient } from '../../APIS/ClientApis';
import { Layout } from '../../components/layout/Layout';

export function DetallesOrden() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDetalles, setSelectedDetalles] = useState<OrderDetails | null>(null);
    const [detalles, setDetalles] = useState<OrderDetails[]>([]);
    const [formValues, setFormValues] = useState<Partial<OrderDetails>>({});
    const [repuestos, setRepuestos] = useState<Replacement[]>([]);
    const [ordenes, setOrden] = useState<ServiceOrder[]>([]);
    const [estados, setStates] = useState<State[]>([]);
    const [clientes, setClientes] = useState<Client[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getClient().then((data) => {
        if (data) setClientes(data);
        });
    }, []);

    useEffect(() => {
          getVehicle().then((data) => {
            if (data) setVehiculos(data);
          });
        }, []);

    useEffect(() => {
        getServiceOrder().then((data) => {
        if (data) setOrden(data);
        });
    }, []);

    useEffect(() => {
        getReplacement().then((data) => {
        if (data) setRepuestos(data);
        });
    }, []);

    useEffect(() => {
        getOrderDetails().then((data) => {
        if (data) setDetalles(data);
        });
    }, []);

    useEffect(() => {
        getState().then((data) => {
        if (data) setStates(data);
        });
    }, []);

    const handleEdit = (detalles: OrderDetails) => {
        setSelectedDetalles(detalles);
        setFormValues(detalles);
        setShowModal(true);
    };
    
    const handleCreate = () => {
        setSelectedDetalles(null);
        setFormValues({});
        setShowModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (selectedDetalles) {
            try {
                //Edit
                const response = await putOrderDetails(formValues as OrderDetails, selectedDetalles.id);

                // CORREGIDO: Validación correcta para éxito
                if (response && response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Editado',
                        text: 'El detalle de orden ha sido editado exitosamente',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    // Refrescar datos solo si fue exitoso
                    const data = await getOrderDetails();
                    if (data) setDetalles(data);
                } else {
                    // Manejar error de respuesta
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al editar el detalle de orden.',
                    });
                }
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al editar el detalle de orden.',
                });
            }
        } else {
            //Create
            const serviceOrderId = formValues.idOrder;
            if (!serviceOrderId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Debes seleccionar una orden de servicio válida.'
                });
                return;
            }

            try {
                const response = await generateServiceOrder(serviceOrderId, formValues as ServiceOrder);
                
                if (!response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'El detalle de orden ha sido creado exitosamente',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    return
                }

                if (response.message) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                    return;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Creado',
                    text: 'El detalle de orden ha sido creado exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                const data = await getOrderDetails();
                if (data) setDetalles(data);
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al crear el detalle de orden.'
                });
            }
        }

        setShowModal(false);
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

    const getReplacementName = (idReplacement: number): string => {
        const repuesto = repuestos.find(r => r.id === idReplacement);
        return repuesto ? `${repuesto.description}` : 'N/A'; 
    }

    const handleDelete = async (id: number | string) => {
        const result = await Swal.fire({
            title: '¿Esta seguro de eliminar el detaller de orden?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
            const response = await deleteOrderDetails(id);
    
            if (!response || !response.ok) {
                Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el detalle de orden.',
            });
            }
    
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El detalle de orden ha sido eliminado exitosamente',
                showConfirmButton: false,
                timer: 1500
            });
    
            const data = await getOrderDetails();
            if (data) setDetalles(data);
    
            } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo eliminar el detalle de orden.',
            });
            }
        }
    };

    const filteredDetalles = detalles.filter(d => {
    if (!searchTerm) return true; // Si no hay búsqueda, muestra todo
    return (
        d.replacement?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.replacement?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    });

    // Función para obtener el vehículo a partir del detalle de orden
    const getVehicleFromOrderDetail = (detalle: OrderDetails): Vehicle | undefined => {
        const orden = ordenes.find(o => o.id === detalle.idOrder);
        if (!orden) return undefined;
        return vehiculos.find(v => v.id === orden.idVehicle);
    };

    // Función para obtener el cliente a partir del detalle de orden
    const getClientFromOrderDetail = (detalle: OrderDetails): Client | undefined => {
        const orden = ordenes.find(o => o.id === detalle.idOrder);
        if (!orden) return undefined;
        const vehicle = vehiculos.find(v => v.id === orden.idVehicle);
        if (!vehicle) return undefined;
        return clientes.find(c => c.id === vehicle.idClient);
    };

    const getSparePartName = (sparePartId: number): string => {
        const repuesto = repuestos.find(r => r.id === sparePartId);
        return repuesto ? `${repuesto.description}` : 'N/A'; 
    }

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
                    <Button onClick={handleCreate} className="shadow-medium bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
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
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{detalles.length}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-black to-neutral-800 shadow-medium">
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
                                    <p className="text-3xl font-bold text-neutral-900 mt-1">{detalles.length}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-medium">
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
                                        {filteredDetalles.map((detail) => {
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
                                                            <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEdit(detail)} disabled={isLoading}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(detail.id)} className="hover:bg-blue-100 hover:text-red-600" disabled={isLoading}>
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
                                {selectedDetalles ? 'Editar Detalle' : 'Nuevo Detalle'}
                            </h2>
                            <div className="space-y-4">
                                <Select
                                    label="Cliente *"
                                    name="cliente"
                                    value={selectedClientId || ''}
                                    onChange={e => {
                                        const clientId = Number(e.target.value);
                                        setSelectedClientId(clientId);
                                        setFormValues(prev => ({ ...prev, idClient: clientId, idVehicle: undefined, idOrder: undefined }));
                                    }}
                                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.name} {cliente.lastName}
                                        </option>
                                    ))}
                                </Select>
                                {selectedClientId && (
                                    <Select
                                        label="Vehículo *"
                                        name="idVehicle"
                                        value={formValues.idVehicle || ''}
                                        onChange={e => {
                                            const vehicleId = Number(e.target.value);
                                            setFormValues(prev => ({ ...prev, idVehicle: vehicleId }));
                                        }}
                                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                    >
                                        <option value="">Seleccionar vehículo</option>
                                        {vehiculos.filter(v => v.idClient === selectedClientId).map(vehiculo => (
                                            <option key={vehiculo.id} value={vehiculo.id}>
                                                {vehiculo.brand} - {vehiculo.model} ({vehiculo.serialNumberVIN})
                                            </option>
                                        ))}
                                    </Select>
                                )}
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
                                    {ordenes.map(order => (
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
                                    {repuestos.map(replacement => (
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
                                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading} className="border-blue-500 text-blue-600 hover:bg-blue-50">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isLoading ? 'Guardando...' : (selectedDetalles ? 'Actualizar' : 'Crear')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
