import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, TrendingDown, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { Replacement } from '../../types';
import { getReplacement, postReplacement, putReplacement, deleteReplacement } from '../../APIS/ReplacementApis';
import { Layout } from '../../components/layout/Layout';

export const PartsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<Replacement | null>(null);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [formValues, setFormValues] = useState<Partial<Replacement>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReplacements();
  }, []);

  const fetchReplacements = async () => {
    setIsLoading(true);
    try {
      const data = await getReplacement();
      if (data) setReplacements(data);
    } catch (error) {
      console.error('Error loading replacements:', error);
      alert('Error al cargar los repuestos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const categorias = [...new Set(replacements.map(r => r.category))];

  const filteredReplacements = replacements.filter(replacement => {
    const matchesSearch = replacement.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    replacement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    replacement.stockQuantity.toString().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filterCategoria === '' || replacement.category === filterCategoria;
    
    const matchesStock = filterStock === '' || 
                        (filterStock === 'bajo' && replacement.stockQuantity <= (replacement.minimumStock || 0)) ||
                        (filterStock === 'normal' && replacement.stockQuantity > (replacement.minimumStock || 0));
    
    return matchesSearch && matchesCategoria && matchesStock;
  });

  const handleEdit = async (replacement: Replacement) => {
    try {
      setIsLoading(true);
      // Verificar si el repuesto aún existe antes de editar
      const response = await fetch(`http://localhost:5202/api/Replacement/${replacement.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('El repuesto no existe o ya fue eliminado. La lista se actualizará.');
          fetchReplacements();
          return;
        } else {
          alert('Error al verificar el repuesto. Por favor, inténtalo de nuevo.');
          return;
        }
      }
      
      setSelectedReplacement(replacement);
      setFormValues(replacement);
      setShowModal(true);
    } catch (error) {
      console.error('Error checking replacement:', error);
      alert('Error al verificar el repuesto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedReplacement(null);
    setFormValues({});
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const getInventarioStats = () => {
    const totalItems = replacements.length;
    const stockBajo = replacements.filter(r => r.stockQuantity <= (r.minimumStock || 0)).length;
    const valorTotal = replacements.reduce((sum, r) => sum + (r.stockQuantity * r.unitPrice), 0);
    const rotacionAlta = replacements.filter(r => r.stockQuantity > (r.minimumStock || 0) * 2).length;
    
    return { totalItems, stockBajo, valorTotal, rotacionAlta };
  };

  const stats = getInventarioStats();

  const handleSubmit = async () => {
    if (!formValues.code || !formValues.description || !formValues.category) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (selectedReplacement) {
        // Edit
        response = await putReplacement(formValues as Replacement, selectedReplacement.id);
      } else {
        // Create
        response = await postReplacement(formValues as Replacement);
      }
      
      // Verificar si hay respuesta y si es un error HTTP
      if (response && response.status >= 400) {
        // Manejar diferentes tipos de errores HTTP
        if (response.status === 404) {
          alert('El repuesto no existe o ya fue eliminado.');
        } else if (response.status === 409) {
          alert('Ya existe un repuesto con este código. Por favor, verifica el código.');
        } else if (response.status === 400) {
          alert('Datos inválidos. Por favor, verifica la información ingresada.');
        } else if (response.status === 403) {
          alert('No tienes permisos para realizar esta acción.');
        } else {
          alert('Error al guardar el repuesto. Por favor, inténtalo de nuevo.');
        }
        return;
      }
      
      // Si llegamos aquí, la operación fue exitosa
      alert(selectedReplacement ? 'Repuesto actualizado exitosamente.' : 'Repuesto creado exitosamente.');
      setShowModal(false);
      await fetchReplacements();
    } catch (error) {
      console.error('Failed to save replacement:', error);
      alert('Error inesperado al guardar el repuesto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este repuesto?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await deleteReplacement(id);
      
      // Verificar si hay respuesta y si es un error HTTP
      if (response && response.status >= 400) {
        // Manejar diferentes tipos de errores HTTP
        if (response.status === 404) {
          alert('El repuesto no existe o ya fue eliminado.');
        } else if (response.status === 409) {
          alert('No se puede eliminar el repuesto porque está siendo usado en órdenes de servicio activas.');
        } else if (response.status === 403) {
          alert('No tienes permisos para eliminar este repuesto.');
        } else {
          alert('Error al eliminar el repuesto. Por favor, inténtalo de nuevo.');
        }
        return;
      }
      
      // Si llegamos aquí, la operación fue exitosa
      alert('Repuesto eliminado exitosamente.');
      await fetchReplacements();
    } catch (error) {
      console.error('Failed to delete replacement:', error);
      alert('Error inesperado al eliminar el repuesto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Gestión de Repuestos">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
              Gestión de Repuestos
            </h1>
            <p className="text-neutral-600 mt-1">Controla el stock de repuestos y materiales</p>
          </div>
          <Button onClick={handleCreate} className="shadow-medium bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Repuesto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600 flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /> Total Items</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.totalItems}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 shadow-medium">
                  <Package className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500" /> Stock Bajo</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.stockBajo}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-danger-500 to-danger-600 shadow-medium">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600 flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" /> Valor Total</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">${(stats.valorTotal / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-success-500 to-success-600 shadow-medium">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-yellow-500" /> Alta Rotación</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.rotacionAlta}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-secondary-500 to-secondary-600 shadow-medium">
                  <TrendingDown className="h-7 w-7 text-white" />
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
                Inventario de Repuestos
              </CardTitle>
              <div className="flex space-x-4">
                <Select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </Select>
                <Select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                  <option value="">Todo el stock</option>
                  <option value="bajo">Stock bajo</option>
                  <option value="normal">Stock normal</option>
                </Select>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar repuestos..."
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
                        Repuesto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredReplacements.map((replacement) => (
                      <tr key={replacement.id} className="hover:bg-gradient-to-r hover:from-neutral-50 hover:to-neutral-100 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-medium">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-neutral-900">{replacement.description}</div>
                              <div className="text-sm text-neutral-500">Código: {replacement.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-accent-100 text-accent-800">
                            {replacement.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-bold text-neutral-900">{replacement.stockQuantity}</div>
                            {replacement.stockQuantity <= (replacement.minimumStock || 0) && (
                              <AlertTriangle className="h-4 w-4 text-danger-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-neutral-500">Mín: {replacement.minimumStock || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">
                            <div className="font-bold">Precio: ${replacement.unitPrice.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(replacement)} className="hover:bg-blue-50 hover:text-blue-600" disabled={isLoading}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-red-600" onClick={() => handleDelete(replacement.id)} disabled={isLoading}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-strong border border-neutral-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">
                {selectedReplacement ? 'Editar Repuesto' : 'Nuevo Repuesto'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Código *" 
                  name="code" 
                  value={formValues.code || ''} 
                  onChange={handleInputChange}
                  required
                />
                <Input 
                  label="Descripción *" 
                  name="description" 
                  value={formValues.description || ''} 
                  onChange={handleInputChange}
                  required
                />
                <Input 
                  label="Categoría *" 
                  name="category" 
                  value={formValues.category || ''} 
                  onChange={handleInputChange}
                  required
                />
                <Input 
                  label="Stock Actual" 
                  type="number" 
                  name="stockQuantity" 
                  value={formValues.stockQuantity || 0} 
                  onChange={handleInputChange}
                />
                <Input 
                  label="Stock Mínimo" 
                  type="number" 
                  name="minimumStock" 
                  value={formValues.minimumStock || 0} 
                  onChange={handleInputChange}
                />
                <Input 
                  label="Precio Unitario" 
                  type="number" 
                  name="unitPrice" 
                  value={formValues.unitPrice || 0} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading} className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isLoading ? 'Guardando...' : (selectedReplacement ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};