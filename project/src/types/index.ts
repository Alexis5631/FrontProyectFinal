export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  passwordHash: string;
  username: string;
  userRoles?: UserRole;
  userSpecializations?: UserSpecialization;
  serviceOrders?: ServiceOrder;
  diagnostics?: Diagnostic;
  auditoryRecords?: Auditory;
  role?: Role;
}

export interface Client {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  identification: string;
  vehicles?: Vehicle;
}

export interface Vehicle {
  id: number;
  idClient: number;
  brand: string;
  model: string;
  year: number;
  serialNumberVIN: string;
  mileage: number;
  client?: Client;
  serviceOrders?: ServiceOrder;
}

export interface ServiceOrder {
  id: number;
  idVehicle: number;
  idUser: number;
  idServiceType: number;
  idState: number;
  entryDate: string;
  exitDate: string;
  clientMessage: string;
  vehicle?: Vehicle;
  user?: User;
  serviceType?: ServiceType;
  state?: State;
  detailsDiagnostics?: DetailsDiagnostic;
  orderDetails?: OrderDetails;
  inventoryDetails?: InventoryDetail;
  invoice?: Invoice;
}

export interface Invoice {
  id: number;
  idServiceOrder: number;
  issueDate: string;
  laborTotal: number;
  replacementsTotal: number;
  totalAmount: number;
  serviceOrders?: ServiceOrder;
}

export interface Auditory {
  id: number;
  entityName: string;
  changeType: string;
  changedBy: string;
  date: string;
}

export interface DetailsDiagnostic {
  idServiceOrder: number;
  idDiagnostic: number;
  serviceOrder?: ServiceOrder;
  diagnostic?: Diagnostic;
}

export interface Diagnostic {
  id: number;
  idUser: number;
  description: string;
  user?: User;
  detailsDiagnostics?: DetailsDiagnostic;
}

export interface Inventory {
  id: number;
  name: string;
  inventoryDetails?: InventoryDetail;
}

export interface InventoryDetail {
  id: number;
  idOrder: number;
  idInventory: number;
  quantity: number;
  serviceOrder?: ServiceOrder;
  inventory?: Inventory;
}

export interface OrderDetails {
  id: number;
  idOrder: number;
  idReplacement: number;
  quantity: number;
  totalCost: number;
  serviceOrder?: ServiceOrder;
  replacement?: Replacement;
}

export interface Replacement {
  id: number;
  code: string;
  description: string;
  stockQuantity: number;
  minimumStock?: number;
  unitPrice: number;
  category: string;
  orderDetails?: OrderDetails;
}

export interface Role {
  id: number;
  description: string;
  userRoles?: UserRole;
  users?: User;
}

export interface ServiceType {
  id: number;
  duration: number;
  description: string;
  serviceOrders?: ServiceOrder;
}

export interface Specialization {
  id: number;
  name: string;
  userSpecializations?: UserSpecialization;
}

export interface State {
  id: number;
  stateType: string;
  serviceOrders?: ServiceOrder;
}

export interface UserRole {
  idUser: number;
  idRole: number;
  user?: User;
  role?: Role;
}

export interface UserSpecialization {
  idUser: number;
  idSpecialization: number;
  user?: User;
  specialization?: Specialization;
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