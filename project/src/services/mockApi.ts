import { AuthResponse, User, Client, Vehicle, ServiceOrder, Part, Invoice, AuditLog, PaginatedResponse } from '../types';

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'mechanic@example.com',
    firstName: 'John',
    lastName: 'Mechanic',
    role: 'mechanic',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'reception@example.com',
    firstName: 'Jane',
    lastName: 'Receptionist',
    role: 'receptionist',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Mock clients
const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos@email.com',
    phone: '+1-555-0101',
    address: '123 Main St, City, State 12345',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@email.com',
    phone: '+1-555-0102',
    address: '456 Oak Ave, City, State 12345',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    firstName: 'Luis',
    lastName: 'Martinez',
    email: 'luis@email.com',
    phone: '+1-555-0103',
    address: '789 Pine Rd, City, State 12345',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
];

// Mock vehicles
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    clientId: '1',
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    color: 'Silver',
    licensePlate: 'ABC-123',
    mileage: 45000,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    clientId: '2',
    vin: '2HGBH41JXMN109187',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    color: 'Blue',
    licensePlate: 'XYZ-789',
    mileage: 32000,
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
];

// Mock service orders
const mockServiceOrders: ServiceOrder[] = [
  {
    id: '1',
    clientId: '1',
    vehicleId: '1',
    mechanicId: '2',
    status: 'completed',
    description: 'Oil change and brake inspection',
    estimatedCost: 150,
    totalCost: 145,
    startDate: '2024-01-20T08:00:00Z',
    completionDate: '2024-01-20T16:00:00Z',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
  },
  {
    id: '2',
    clientId: '2',
    vehicleId: '2',
    mechanicId: '2',
    status: 'pending',
    description: 'Transmission service',
    estimatedCost: 300,
    totalCost: 0,
    startDate: '2024-01-21T09:00:00Z',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
  },
];

// Mock parts
const mockParts: Part[] = [
  {
    id: '1',
    code: 'OIL-001',
    name: 'Engine Oil 5W-30',
    description: 'High quality synthetic engine oil',
    brand: 'Mobil 1',
    price: 25.99,
    stockQuantity: 50,
    minimumStock: 10,
    category: 'Fluids',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'BRAKE-001',
    name: 'Brake Pads Front',
    description: 'Ceramic brake pads for front wheels',
    brand: 'Brembo',
    price: 89.99,
    stockQuantity: 5,
    minimumStock: 8,
    category: 'Brakes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock invoices
const mockInvoices: Invoice[] = [
  {
    id: '1',
    orderId: '1',
    invoiceNumber: 'INV-001',
    clientId: '1',
    totalAmount: 145.00,
    taxAmount: 11.60,
    subtotal: 133.40,
    status: 'paid',
    issueDate: '2024-01-20T16:00:00Z',
    dueDate: '2024-02-19T16:00:00Z',
    createdAt: '2024-01-20T16:00:00Z',
  },
  {
    id: '2',
    orderId: '2',
    invoiceNumber: 'INV-002',
    clientId: '2',
    totalAmount: 300.00,
    taxAmount: 24.00,
    subtotal: 276.00,
    status: 'sent',
    issueDate: '2024-01-21T09:00:00Z',
    dueDate: '2024-02-20T09:00:00Z',
    createdAt: '2024-01-21T09:00:00Z',
  },
];

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'create',
    entity: 'client',
    entityId: 'client-123',
    newValues: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: mockUsers[0],
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
    user: mockUsers[1],
  },
  {
    id: '3',
    userId: '1',
    action: 'delete',
    entity: 'part',
    entityId: 'part-789',
    oldValues: { name: 'Old Brake Pad', stockQuantity: 0 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    user: mockUsers[0],
  },
  {
    id: '4',
    userId: '3',
    action: 'login',
    entity: 'user',
    entityId: 'user-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    user: mockUsers[2],
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<{ data: AuthResponse }> => {
      await delay(1000); // Simulate network delay
      
      const user = mockUsers.find(u => u.email === email);
      if (!user || password !== 'password') {
        throw new Error('Invalid credentials');
      }

      return {
        data: {
          token: 'mock-jwt-token-' + user.id,
          user,
        },
      };
    },
    getCurrentUser: async (): Promise<{ data: User }> => {
      await delay(500);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const userId = token.replace('mock-jwt-token-', '');
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      return { data: user };
    },
  },

  // Clients endpoints
  clients: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<Client> }> => {
      await delay(800);
      
      let filteredClients = [...mockClients];
      
      // Apply search filter
      if (params?.search) {
        const search = params.search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          client.firstName.toLowerCase().includes(search) ||
          client.lastName.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search)
        );
      }

      // Apply sorting
      if (params?.sortBy) {
        filteredClients.sort((a, b) => {
          const aVal = a[params.sortBy as keyof Client];
          const bVal = b[params.sortBy as keyof Client];
          const modifier = params.sortOrder === 'desc' ? -1 : 1;
          return aVal > bVal ? modifier : -modifier;
        });
      }

      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredClients.slice(startIndex, endIndex);

      return {
        data: {
          data: paginatedData,
          total: filteredClients.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredClients.length / pageSize),
        },
      };
    },
    getById: async (id: string): Promise<{ data: Client }> => {
      await delay(500);
      const client = mockClients.find(c => c.id === id);
      if (!client) {
        throw new Error('Client not found');
      }
      return { data: client };
    },
    create: async (data: Partial<Client>): Promise<{ data: Client }> => {
      await delay(1000);
      const newClient: Client = {
        id: (mockClients.length + 1).toString(),
        firstName: data.firstName!,
        lastName: data.lastName!,
        email: data.email!,
        phone: data.phone!,
        address: data.address!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockClients.push(newClient);
      return { data: newClient };
    },
    update: async (id: string, data: Partial<Client>): Promise<{ data: Client }> => {
      await delay(1000);
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }
      mockClients[index] = { ...mockClients[index], ...data, updatedAt: new Date().toISOString() };
      return { data: mockClients[index] };
    },
    delete: async (id: string): Promise<void> => {
      await delay(800);
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }
      mockClients.splice(index, 1);
    },
  },

  // Vehicles endpoints
  vehicles: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<Vehicle> }> => {
      await delay(800);
      return {
        data: {
          data: mockVehicles,
          total: mockVehicles.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };
    },
    getById: async (id: string): Promise<{ data: Vehicle }> => {
      await delay(500);
      const vehicle = mockVehicles.find(v => v.id === id);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      return { data: vehicle };
    },
    create: async (data: Partial<Vehicle>): Promise<{ data: Vehicle }> => {
      await delay(1000);
      const newVehicle: Vehicle = {
        id: (mockVehicles.length + 1).toString(),
        ...data as Vehicle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockVehicles.push(newVehicle);
      return { data: newVehicle };
    },
    update: async (id: string, data: Partial<Vehicle>): Promise<{ data: Vehicle }> => {
      await delay(1000);
      const index = mockVehicles.findIndex(v => v.id === id);
      if (index === -1) {
        throw new Error('Vehicle not found');
      }
      mockVehicles[index] = { ...mockVehicles[index], ...data, updatedAt: new Date().toISOString() };
      return { data: mockVehicles[index] };
    },
    delete: async (id: string): Promise<void> => {
      await delay(800);
      const index = mockVehicles.findIndex(v => v.id === id);
      if (index === -1) {
        throw new Error('Vehicle not found');
      }
      mockVehicles.splice(index, 1);
    },
    getByClient: async (clientId: string): Promise<{ data: Vehicle[] }> => {
      await delay(500);
      const vehicles = mockVehicles.filter(v => v.clientId === clientId);
      return { data: vehicles };
    },
  },

  // Service Orders endpoints
  serviceOrders: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<ServiceOrder> }> => {
      await delay(800);
      let filteredOrders = mockServiceOrders.map(order => ({
        ...order,
        client: mockClients.find(c => c.id === order.clientId),
        vehicle: mockVehicles.find(v => v.id === order.vehicleId),
        mechanic: mockUsers.find(u => u.id === order.mechanicId),
      }));

      // Filter by mechanic if specified
      if (params?.mechanicId) {
        filteredOrders = filteredOrders.filter(order => order.mechanicId === params.mechanicId);
      }

      // Filter by status if specified
      if (params?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status);
      }

      return {
        data: {
          data: filteredOrders,
          total: filteredOrders.length,
          page: 1,
          pageSize: params?.pageSize || 20,
          totalPages: 1,
        },
      };
    },
    getById: async (id: string): Promise<{ data: ServiceOrder }> => {
      await delay(500);
      const order = mockServiceOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Service order not found');
      }
      return { data: order };
    },
    create: async (data: Partial<ServiceOrder>): Promise<{ data: ServiceOrder }> => {
      await delay(1000);
      const newOrder: ServiceOrder = {
        id: (mockServiceOrders.length + 1).toString(),
        ...data as ServiceOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockServiceOrders.push(newOrder);
      return { data: newOrder };
    },
    update: async (id: string, data: Partial<ServiceOrder>): Promise<{ data: ServiceOrder }> => {
      await delay(1000);
      const index = mockServiceOrders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error('Service order not found');
      }
      mockServiceOrders[index] = { ...mockServiceOrders[index], ...data, updatedAt: new Date().toISOString() };
      return { data: mockServiceOrders[index] };
    },
    delete: async (id: string): Promise<void> => {
      await delay(800);
      const index = mockServiceOrders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error('Service order not found');
      }
      mockServiceOrders.splice(index, 1);
    },
    updateStatus: async (id: string, status: ServiceOrder['status']): Promise<{ data: ServiceOrder }> => {
      await delay(800);
      const index = mockServiceOrders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error('Service order not found');
      }
      mockServiceOrders[index] = { 
        ...mockServiceOrders[index], 
        status, 
        updatedAt: new Date().toISOString(),
        completionDate: status === 'completed' ? new Date().toISOString() : undefined,
      };
      return { data: mockServiceOrders[index] };
    },
  },

  // Parts endpoints
  parts: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<Part> }> => {
      await delay(800);
      return {
        data: {
          data: mockParts,
          total: mockParts.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };
    },
    getById: async (id: string): Promise<{ data: Part }> => {
      await delay(500);
      const part = mockParts.find(p => p.id === id);
      if (!part) {
        throw new Error('Part not found');
      }
      return { data: part };
    },
    create: async (data: Partial<Part>): Promise<{ data: Part }> => {
      await delay(1000);
      const newPart: Part = {
        id: (mockParts.length + 1).toString(),
        ...data as Part,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockParts.push(newPart);
      return { data: newPart };
    },
    update: async (id: string, data: Partial<Part>): Promise<{ data: Part }> => {
      await delay(1000);
      const index = mockParts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Part not found');
      }
      mockParts[index] = { ...mockParts[index], ...data, updatedAt: new Date().toISOString() };
      return { data: mockParts[index] };
    },
    delete: async (id: string): Promise<void> => {
      await delay(800);
      const index = mockParts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Part not found');
      }
      mockParts.splice(index, 1);
    },
    getLowStock: async (): Promise<{ data: Part[] }> => {
      await delay(500);
      const lowStockParts = mockParts.filter(part => part.stockQuantity <= part.minimumStock);
      return { data: lowStockParts };
    },
  },

  // Invoices endpoints
  invoices: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<Invoice> }> => {
      await delay(800);
      const invoicesWithRelations = mockInvoices.map(invoice => ({
        ...invoice,
        client: mockClients.find(c => c.id === invoice.clientId),
        order: mockServiceOrders.find(o => o.id === invoice.orderId),
      }));

      return {
        data: {
          data: invoicesWithRelations,
          total: invoicesWithRelations.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };
    },
    getById: async (id: string): Promise<{ data: Invoice }> => {
      await delay(500);
      const invoice = mockInvoices.find(i => i.id === id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      return { data: invoice };
    },
    create: async (data: Partial<Invoice>): Promise<{ data: Invoice }> => {
      await delay(1000);
      const newInvoice: Invoice = {
        id: (mockInvoices.length + 1).toString(),
        ...data as Invoice,
        createdAt: new Date().toISOString(),
      };
      mockInvoices.push(newInvoice);
      return { data: newInvoice };
    },
    update: async (id: string, data: Partial<Invoice>): Promise<{ data: Invoice }> => {
      await delay(1000);
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('Invoice not found');
      }
      mockInvoices[index] = { ...mockInvoices[index], ...data };
      return { data: mockInvoices[index] };
    },
    delete: async (id: string): Promise<void> => {
      await delay(800);
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('Invoice not found');
      }
      mockInvoices.splice(index, 1);
    },
    generatePdf: async (id: string): Promise<Blob> => {
      await delay(1000);
      throw new Error('PDF generation not available in demo mode');
    },
  },

  // Audit logs endpoints
  auditLogs: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<AuditLog> }> => {
      await delay(800);
      return {
        data: {
          data: mockAuditLogs,
          total: mockAuditLogs.length,
          page: 1,
          pageSize: 50,
          totalPages: 1,
        },
      };
    },
  },

  users: {
    getAll: async (params?: any): Promise<{ data: PaginatedResponse<User> }> => {
      await delay(800);
      return {
        data: {
          data: mockUsers,
          total: mockUsers.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };
    },
    getById: async (id: string): Promise<{ data: User }> => {
      await delay(500);
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return { data: user };
    },
    create: async (data: Partial<User>): Promise<{ data: User }> => {
      throw new Error('Not implemented');
    },
    update: async (id: string, data: Partial<User>): Promise<{ data: User }> => {
      throw new Error('Not implemented');
    },
    delete: async (id: string): Promise<void> => {
      throw new Error('Not implemented');
    },
  },
};