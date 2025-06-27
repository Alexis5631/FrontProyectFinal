export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'mechanic' | 'receptionist';
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  vehicleId: string;
  mechanicId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  estimatedCost: number;
  totalCost: number;
  startDate: string;
  completionDate?: string;
  client?: Client;
  vehicle?: Vehicle;
  mechanic?: User;
  parts?: OrderPart[];
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  code: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPart {
  id: string;
  orderId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  part?: Part;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  clientId: string;
  totalAmount: number;
  taxAmount: number;
  subtotal: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  order?: ServiceOrder;
  client?: Client;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}