import {
  DeliveryType,
  UserRole,
  DumpsterStatus,
  WorkOrderType,
  WorkOrderStatus,
  CustomerType,
  VehicleType,
  VehicleStatus,
  DriverStatus,
  CNHCategory,
} from './enums';

/**
 * Usuário do sistema (admin ou motorista)
 */
export interface User {
  id: string;
  email?: string;
  username?: string;
  name: string;
  cpf?: string;
  role: UserRole;
  isActive?: boolean;
  empresaId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Motorista
 */
export interface Driver {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone?: string;
  email?: string;
  senhaHash: string;
  numeroCNH?: string;
  categoriaCNH?: string;
  validadeCNH?: Date;
  status: DriverStatus;
  ativo: boolean;
  veiculoPadraoId?: string;
  empresaId?: string;
  createdAt: Date;
  updatedAt: Date;
  veiculoPadrao?: Vehicle;
  workOrders?: WorkOrder[];
}

/**
 * Cliente
 */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  type?: CustomerType;
  createdAt: Date;
  updatedAt: Date;
  jobSites?: JobSite[];
  contacts?: Contact[];
}

/**
 * Contato do cliente
 */
export interface Contact {
  id: string;
  customerId: string;
  name: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
}

/**
 * Obra/Endereço de entrega
 */
export interface JobSite {
  id: string;
  customerId: string;
  address: string;
  neighborhood?: string;
  reference?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
}

/**
 * Veículo
 */
export interface Vehicle {
  id: string;
  placa: string;
  tipo: VehicleType;
  marca?: string;
  modelo?: string;
  ano?: number;
  renavam?: string;
  observacoes?: string;
  possuiMunck: boolean;
  status: VehicleStatus;
  temRastreador: boolean;
  codigoRastreador?: string;
  empresaId?: string;
  createdAt: Date;
  updatedAt: Date;
  workOrders?: WorkOrder[];
  drivers?: Driver[];
}

/**
 * Terreno (para descarte)
 */
export interface Yard {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caçamba
 */
export interface Dumpster {
  id: string;
  code: string; // Código identificador (ex: CAC-001)
  capacityM3: number; // Capacidade em m³
  status: DumpsterStatus;
  currentJobSiteId?: string;
  lastLat?: number;
  lastLng?: number;
  lastAccuracy?: number;
  lastLocationAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  currentJobSite?: JobSite;
  workOrders?: WorkOrder[];
}

/**
 * Entrega/Retirada de caçamba (legado)
 */
export interface Delivery {
  id: string;
  type: DeliveryType;
  dumpsterId: string;
  jobSiteId: string;
  driverId: string;
  occurredAt: Date;
  latitude: number;
  longitude: number;
  accuracy?: number; // Precisão do GPS em metros
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  dumpster?: Dumpster;
  jobSite?: JobSite;
  driver?: Driver;
}

/**
 * Ordem de Serviço
 */
export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  sequence: number;
  scheduledAt?: Date;
  returnDueDate?: Date; // Data limite para retirada da caçamba do cliente
  isIndeterminate: boolean; // Tempo indeterminado (padrão: true)
  driverId: string;
  vehicleId: string;
  dumpsterId: string;
  jobSiteId?: string;
  yardId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
  driver?: Driver;
  vehicle?: Vehicle;
  dumpster?: Dumpster;
  jobSite?: JobSite;
  yard?: Yard;
  proofs?: WorkOrderProof[];
}

/**
 * Comprovação de conclusão da ordem de serviço
 */
export interface WorkOrderProof {
  id: string;
  workOrderId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
  workOrder?: WorkOrder;
}
