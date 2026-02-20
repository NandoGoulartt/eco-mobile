import { DeliveryType, UserRole, WorkOrderType, WorkOrderStatus, CustomerType, DumpsterStatus, VehicleType, VehicleStatus, DriverStatus, CNHCategory } from './enums';

/**
 * DTO para login (motorista - CPF + senha)
 */
export interface LoginDto {
  cpf: string;
  password: string;
}

/**
 * DTO para resposta de autenticação do motorista
 */
export interface DriverAuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    cpf: string;
    role: string;
    empresaId?: string | null;
  };
}

/**
 * DTO para resposta de autenticação (compatível com motorista)
 */
export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email?: string;
    name: string;
    cpf?: string;
    role: UserRole;
    empresaId?: string | null;
  };
}

/**
 * DTO para criar entrega/retirada
 */
export interface CreateDeliveryDto {
  type: DeliveryType;
  dumpsterId: string;
  jobSiteId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  photoUrl?: string;
  notes?: string;
}

/**
 * DTO para atualizar entrega
 */
export interface UpdateDeliveryDto {
  notes?: string;
  photoUrl?: string;
}

/**
 * DTO para criar caçamba
 */
export interface CreateDumpsterDto {
  code: string;
  capacityM3: number;
  status?: DumpsterStatus;
}

/**
 * DTO para criar obra
 */
export interface CreateJobSiteDto {
  customerId: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  notes?: string;
}

/**
 * DTO para criar cliente
 */
export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  type?: CustomerType;
}

/**
 * DTO para criar contato
 */
export interface CreateContactDto {
  customerId: string;
  name: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
}

/**
 * DTO para criar motorista
 */
export interface CreateDriverDto {
  nomeCompleto: string;
  cpf: string;
  telefone?: string;
  email: string;
  senha: string; // Será convertido para senhaHash no backend
  numeroCNH?: string;
  categoriaCNH?: CNHCategory | string;
  validadeCNH?: Date | string;
  status?: DriverStatus;
  ativo?: boolean;
  veiculoPadraoId?: string;
  empresaId?: string;
}

/**
 * DTO para criar usuário (admin)
 */
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

/**
 * DTO para resetar senha
 */
export interface ResetPasswordDto {
  newPassword: string;
}

/**
 * DTO para criar veículo
 */
export interface CreateVehicleDto {
  placa: string;
  tipo: VehicleType;
  marca?: string;
  modelo?: string;
  ano?: number;
  renavam?: string;
  observacoes?: string;
  possuiMunck?: boolean;
  status?: VehicleStatus;
  temRastreador?: boolean;
  codigoRastreador?: string;
  empresaId?: string;
}

/**
 * DTO para criar terreno
 */
export interface CreateYardDto {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

/**
 * DTO para criar pedido de serviço
 */
export interface CreateWorkOrderDto {
  type: WorkOrderType;
  driverId: string;
  vehicleId: string;
  dumpsterId: string;
  jobSiteId?: string;
  yardId?: string;
  scheduledAt?: Date;
  returnDueDate?: Date; // Data limite para retirada da caçamba do cliente
  isIndeterminate?: boolean; // Tempo indeterminado (padrão: true)
}

/**
 * DTO para atualizar ordem de serviço
 */
export interface UpdateWorkOrderDto {
  type?: WorkOrderType;
  driverId?: string;
  vehicleId?: string;
  dumpsterId?: string;
  jobSiteId?: string;
  yardId?: string;
  scheduledAt?: Date;
  returnDueDate?: Date; // Data limite para retirada da caçamba do cliente
  isIndeterminate?: boolean; // Tempo indeterminado
}

/**
 * DTO para reordenar ordens de serviço
 */
export interface ReorderWorkOrdersDto {
  driverId: string;
  orders: Array<{
    id: string;
    sequence: number;
  }>;
}

/**
 * DTO para completar ordem de serviço
 */
export interface CompleteWorkOrderDto {
  lat: number;
  lng: number;
  accuracy?: number;
  notes?: string;
  // photo será enviado como multipart/form-data
}
