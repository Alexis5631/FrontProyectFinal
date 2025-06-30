import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Search, Eye, Download, DollarSign, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { Invoice, Client, ServiceOrder, State, OrderDetails, Vehicle } from '../../types';
import { getServiceOrder } from '../../APIS/ServiceOrderApis';
import { getState } from '../../APIS/StateApis';
import { getClient } from '../../APIS/ClientApis';
import { getOrderDetails } from '../../APIS/OrderDetailsApis';
import { getVehicle } from '../../APIS/VehicleApis';
import { generateInvoice, getInvoice } from '../../APIS/InvoiceApis';

const estadoConfig = {
  pendiente: { icon: AlertCircle, color: 'text-warning-600', bg: 'bg-warning-100', label: 'Pendiente' },
  pagada: { icon: CreditCard, color: 'text-success-600', bg: 'bg-success-100', label: 'Pagada' },
  anulada: { icon: FileText, color: 'text-danger-600', bg: 'bg-danger-100', label: 'Anulada' },
};

export function Facturacion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Invoice | null>(null);
  const [facturas, setFacturas] = useState<Invoice[]>([]);
  const [formValues, setFormValues] = useState<Partial<Invoice>>({});
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [estados, setEstados] = useState<State[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [facturaGenerada, setFacturaGenerada] = useState<Invoice | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [invoicesData, serviceOrdersData, statesData, clientsData, ordersData, vehiclesData] = await Promise.all([
          getInvoice(),
          getServiceOrder(),
          getState(),
          getClient(),
          getOrderDetails(),
          getVehicle()
        ]);

        if (invoicesData) setFacturas(invoicesData);
        if (serviceOrdersData) setServiceOrders(serviceOrdersData);
        if (statesData) setEstados(statesData);
        if (clientsData) setClients(clientsData);
        if (ordersData) setOrderDetails(ordersData);
        if (vehiclesData) setVehicles(vehiclesData);
      } catch (error) {
        alert('Error cargando datos: ' + error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Obtener la orden de servicio desde la factura
  const getServiceOrderFromInvoice = (factura: Invoice): ServiceOrder | undefined => {
    if (!factura.idServiceOrder || factura.idServiceOrder === 0) return undefined;
    return serviceOrders.find(so => so.id === factura.idServiceOrder);
  };

  // Obtener el vehículo desde la orden de servicio
  const getVehicleFromServiceOrder = (serviceOrder: ServiceOrder): Vehicle | undefined => {
    return vehicles.find(v => v.id === serviceOrder.idVehicle);
  };

  // Obtener el cliente desde el vehículo
  const getClientFromVehicle = (vehicle: Vehicle): Client | undefined => {
    return clients.find(c => c.id === vehicle.idClient);
  };

  // Obtener el estado de la factura
  const getEstadoFactura = (factura: Invoice) => {
    const serviceOrder = getServiceOrderFromInvoice(factura);
    if (!serviceOrder) return 'pendiente';
    const estado = estados.find(e => e.id === serviceOrder.idState);
    return estado ? estado.stateType.toLowerCase() : 'pendiente';
  };

  // Función para obtener información completa de la factura
  const getFacturaCompleteInfo = (factura: Invoice) => {
    const serviceOrder = getServiceOrderFromInvoice(factura);
    const vehicle = serviceOrder ? getVehicleFromServiceOrder(serviceOrder) : undefined;
    const client = vehicle ? getClientFromVehicle(vehicle) : undefined;
    const hasValidData = !!serviceOrder && !!vehicle && !!client;
    return {
      serviceOrder,
      vehicle,
      client,
      clientName: client ? `${client.name} ${client.lastName}` : (hasValidData ? 'N/A' : 'Sin datos'),
      clientEmail: client?.email || (hasValidData ? 'N/A' : 'Sin datos'),
      clientPhone: client?.phone || (hasValidData ? 'N/A' : 'Sin datos'),
      vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model}` : (hasValidData ? 'N/A' : 'Sin datos'),
      vehicleVin: vehicle?.serialNumberVIN || (hasValidData ? 'N/A' : 'Sin datos'),
      hasValidData,
      status: hasValidData ? 'valid' : factura.idServiceOrder === 0 ? 'no-relation' : 'missing-data'
    };
  };

  const filteredFacturas = facturas.filter(factura => {
    const { vehicleInfo, clientName } = getFacturaCompleteInfo(factura);
    const matchesSearch = searchTerm === '' || 
      factura.totalAmount.toString().includes(searchTerm.toLowerCase()) ||
      factura.issueDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (factura.id && factura.id.toString().includes(searchTerm.toLowerCase()));
    const matchesEstado = filterEstado === '' || getEstadoFactura(factura) === filterEstado;
    return matchesSearch && matchesEstado;
  });

  // Órdenes de servicio que NO tienen factura
  const getServiceOrdersWithoutInvoice = (): ServiceOrder[] => {
    return serviceOrders.filter(so => !facturas.find(f => f.idServiceOrder === so.id));
  };

  // Generar factura automáticamente
  const generateInvoiceFromServiceOrder = async (serviceOrder: ServiceOrder) => {
    try {
      const vehicle = getVehicleFromServiceOrder(serviceOrder);
      const client = vehicle ? getClientFromVehicle(vehicle) : undefined;
      const response = await generateInvoice(serviceOrder.id);
      if (response && response.id) {
        alert('Éxito: Factura generada correctamente');
        const newInvoicesData = await getInvoice();
        if (newInvoicesData) setFacturas(newInvoicesData);
        const nuevaFactura = newInvoicesData?.find(f => f.id === response.id);
        setFacturaGenerada(nuevaFactura || null);
      } else {
        alert('Error: No se pudo generar la factura');
      }
    } catch (error) {
      console.error('Error generando factura:', error);
      alert('Error: No se pudo generar la factura');
    }
  };

  const cerrarModalFactura = () => setFacturaGenerada(null);

  const getFacturacionStats = () => {
    const totalFacturas = facturas.length;
    const facturasValidas = facturas.filter(f => f.idServiceOrder && f.idServiceOrder > 0);
    const facturasInvalidas = facturas.filter(f => !f.idServiceOrder || f.idServiceOrder === 0);
    const ordenesSinFactura = getServiceOrdersWithoutInvoice();
    const montoTotal = facturasValidas.reduce((acc, factura) => acc + factura.totalAmount, 0);
    return { 
      totalFacturas, 
      facturasValidas: facturasValidas.length,
      facturasInvalidas: facturasInvalidas.length,
      ordenesSinFactura: ordenesSinFactura.length,
      montoTotal 
    };
  };

  const stats = getFacturacionStats();
  const ordenesPendientesFacturar = getServiceOrdersWithoutInvoice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-neutral-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            Sistema de Facturación
          </h1>
          <p className="text-neutral-600 mt-1">Órdenes de servicio pendientes de facturar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
              Órdenes Pendientes de Facturar
            </CardTitle>
            <div className="flex space-x-4">
              <Select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.stateType.toLowerCase()}>{estado.stateType}</option>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Orden de Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Cliente / Vehículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Fecha Entrada
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {ordenesPendientesFacturar
                  .filter(so => {
                    const estado = estados.find(e => e.id === so.idState)?.stateType.toLowerCase() || '';
                    const vehicle = getVehicleFromServiceOrder(so);
                    const client = vehicle ? getClientFromVehicle(vehicle) : undefined;
                    const search = searchTerm.toLowerCase();
                    return (
                      (!filterEstado || estado === filterEstado) &&
                      (
                        so.id.toString().includes(search) ||
                        (vehicle && `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(search)) ||
                        (client && `${client.name} ${client.lastName}`.toLowerCase().includes(search))
                      )
                    );
                  })
                  .map((so) => {
                    const vehicle = getVehicleFromServiceOrder(so);
                    const client = vehicle ? getClientFromVehicle(vehicle) : undefined;
                    const estado = estados.find(e => e.id === so.idState)?.stateType || 'N/A';
                    return (
                      <tr key={so.id} className="hover:bg-gradient-to-r hover:from-neutral-50 hover:to-neutral-100 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-neutral-900">#{so.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-neutral-900">
                            {client ? `${client.name} ${client.lastName}` : 'Sin datos'}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Sin datos'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700">
                            {estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">
                            {new Date(so.entryDate).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button size="sm" onClick={() => generateInvoiceFromServiceOrder(so)}>
                            <Plus className="h-4 w-4 mr-1" /> Generar Factura
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {ordenesPendientesFacturar.length === 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-500">No hay órdenes pendientes de facturar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-strong border border-neutral-200 max-h-[90vh] overflow-y-auto">
            {selectedFactura ? (
              // Vista de detalle de factura
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-neutral-900">Detalle de Factura</h2>
                  <p className="text-neutral-600">Información completa de la factura</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-700 mb-4">Información de la Factura</h3>
                    <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">ID:</span>
                        <span className="text-sm font-semibold">{selectedFactura.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Código:</span>
                        <span className="text-sm font-semibold">{selectedFactura.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Fecha:</span>
                        <span className="text-sm font-semibold">{new Date(selectedFactura.issueDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Estado:</span>
                        <span className="text-sm font-semibold capitalize">
                          {getEstadoFactura(selectedFactura)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Service Order ID:</span>
                        <span className="text-sm font-semibold">{selectedFactura.idServiceOrder}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-700 mb-4">Información del Cliente</h3>
                    {(() => {
                      const { client, clientName, clientEmail, clientPhone } = getFacturaCompleteInfo(selectedFactura);
                      return (
                        <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">Nombre:</span>
                            <span className="text-sm font-semibold">{clientName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">Email:</span>
                            <span className="text-sm font-semibold">{clientEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">Teléfono:</span>
                            <span className="text-sm font-semibold">{clientPhone}</span>
                          </div>
                          {client && (
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-600">ID Cliente:</span>
                              <span className="text-sm font-semibold">{client.id}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-700 mb-4">Información del Vehículo</h3>
                  {(() => {
                    const { vehicle, vehicleInfo, vehicleVin } = getFacturaCompleteInfo(selectedFactura);
                    return (
                      <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Vehículo:</span>
                          <span className="text-sm font-semibold">{vehicleInfo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">VIN:</span>
                          <span className="text-sm font-semibold">{vehicleVin}</span>
                        </div>
                        {vehicle && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-600">ID Vehículo:</span>
                              <span className="text-sm font-semibold">{vehicle.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-600">VIN:</span>
                              <span className="text-sm font-semibold">{vehicle.serialNumberVIN || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-600">MODEL:</span>
                              <span className="text-sm font-semibold">{vehicle.model || 'N/A'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-700 mb-4">Detalle de Costos</h3>
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <div className="border-t border-neutral-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-neutral-900">Total:</span>
                        <span className="text-lg font-bold text-neutral-900">${selectedFactura.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            ) : (
              // Formulario para nueva factura
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-neutral-900">Generar Factura</h2>
                  <p className="text-neutral-600">Selecciona una orden de servicio para generar su factura</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-700">Órdenes de Servicio Disponibles</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {getServiceOrdersWithoutInvoice().map(serviceOrder => {
                      const vehicle = getVehicleFromServiceOrder(serviceOrder);
                      const client = vehicle ? getClientFromVehicle(vehicle) : undefined;
                      const estado = estados.find(e => e.id === serviceOrder.idState);
                      
                      return (
                        <div 
                          key={serviceOrder.id} 
                          className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                          onClick={() => generateInvoiceFromServiceOrder(serviceOrder)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-neutral-900">
                                Orden #{serviceOrder.id}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-neutral-600">
                                  <span className="font-medium">Cliente:</span> {client ? `${client.name} ${client.lastName}` : 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  <span className="font-medium">Vehículo:</span> {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  <span className="font-medium">Estado:</span> {estado ? estado.stateType : 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  <span className="font-medium">Fecha entrada:</span> {new Date(serviceOrder.entryDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                Generar Factura
                              </span>
                              <div className="mt-2">
                                <span className="text-xs text-neutral-500">Click para generar</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {getServiceOrdersWithoutInvoice().length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      <p>Todas las órdenes de servicio ya tienen factura</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {selectedFactura ? 'Cerrar' : 'Cancelar'}
              </Button>
              {selectedFactura ? (
                <Button>
                  <Download className="h-4 w-4 mr-1" />
                  Descargar PDF
                </Button>
              ) : (
                <Button onClick={() => {
                  console.log('Crear factura:', formValues);
                  setShowModal(false);
                }}>
                  Crear Factura
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de factura generada */}
      {facturaGenerada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-strong border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Factura Generada</h2>
                <p className="text-neutral-600">Información básica de la factura</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">ID:</span>
                  <span className="text-sm font-semibold">{facturaGenerada.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Código:</span>
                  <span className="text-sm font-semibold">{facturaGenerada.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Fecha:</span>
                  <span className="text-sm font-semibold">{new Date(facturaGenerada.issueDate).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Total:</span>
                  <span className="text-sm font-semibold">${facturaGenerada.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <Button variant="outline" onClick={cerrarModalFactura}>
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}