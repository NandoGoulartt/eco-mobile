/**
 * Tipos de entrega/retirada de caçamba (legado)
 */
export enum DeliveryType {
  DROP_OFF = 'DROP_OFF', // Entrega/Deixar caçamba
  PICK_UP = 'PICK_UP',   // Retirada
}

/**
 * Roles de usuário no sistema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
}

/**
 * Tipo de cliente
 */
export enum CustomerType {
  PERSON = 'PERSON',   // Pessoa Física
  COMPANY = 'COMPANY', // Pessoa Jurídica
}

/**
 * Status da caçamba
 *
 * AVAILABLE   -> disponível no pátio
 * IN_USE      -> locada/em uso em uma obra
 * IN_TRANSIT  -> em transporte
 * MAINTENANCE -> em manutenção
 * INACTIVE    -> cadastro inativo (soft delete)
 */
export enum DumpsterStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

/**
 * Tipos de ordem de serviço
 */
export enum WorkOrderType {
  DROP_OFF = 'DROP_OFF',
  PICK_UP = 'PICK_UP',
  EXCHANGE = 'EXCHANGE',
  DUMP = 'DUMP',
}

/**
 * Status da ordem de serviço
 */
export enum WorkOrderStatus {
  PENDING = 'PENDING',         // Pendente
  IN_PROGRESS = 'IN_PROGRESS', // Em andamento
  DONE = 'DONE',               // Concluída
  CANCELED = 'CANCELED',       // Cancelada
}

/**
 * Tipo de veículo
 */
export enum VehicleType {
  TRUCK = 'TRUCK',           // Caminhão
  PICKUP = 'PICKUP',         // Caminhonete
  TRAILER = 'TRAILER',       // Reboque
  OTHER = 'OTHER',           // Outro
}

/**
 * Status do veículo
 */
export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',   // Disponível
  IN_USE = 'IN_USE',         // Em uso
  MAINTENANCE = 'MAINTENANCE', // Em manutenção
  INACTIVE = 'INACTIVE',     // Inativo
}

/**
 * Status do motorista
 */
export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',   // Disponível
  ON_DUTY = 'ON_DUTY',       // Em serviço
  OFF_DUTY = 'OFF_DUTY',     // Fora de serviço
  INACTIVE = 'INACTIVE',     // Inativo
}

/**
 * Categoria da CNH
 */
export enum CNHCategory {
  A = 'A',       // Motocicleta
  B = 'B',       // Automóvel
  C = 'C',       // Caminhão
  D = 'D',       // Ônibus
  E = 'E',       // Carreta/Articulado
  AB = 'AB',     // A + B
  AC = 'AC',     // A + C
  AD = 'AD',     // A + D
  AE = 'AE',     // A + E
}
