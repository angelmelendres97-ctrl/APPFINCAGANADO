// Types
export interface Animal {
  id: string
  codigo: string
  nombre: string
  sexo: 'Hembra' | 'Macho'
  raza: string
  especie: string
  categoria: string
  estado: 'Activo' | 'Seco' | 'Preñado' | 'En Crecimiento' | 'Vendido' | 'Muerto'
  lote: string
  fechaNacimiento: string
  peso: number
  areteId?: string
}

export interface Lote {
  id: string
  codigo: string
  nombre: string
  tipo: 'Potrero' | 'Corral'
  area: number
  capacidad: number
  animales: number
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento'
}

export interface Raza {
  id: string
  nombre: string
  descripcion: string
  proposito: string
  estado: 'Activo' | 'Inactivo'
}

export interface RegistroLeche {
  id: string
  animalId: string
  fecha: string
  jornada: 'Mañana' | 'Tarde'
  cantidad: number
  temperatura: number
  mastitis: boolean
}

export interface RegistroSanidad {
  id: string
  animalId: string
  fecha: string
  tipo: 'Vacuna' | 'Tratamiento' | 'Control' | 'Desparasitación'
  diagnostico: string
  medicamento: string
  dosis: string
  viaAdministracion: string
  proximaFecha?: string
  veterinario: string
  observaciones: string
}

export interface Reproduccion {
  id: string
  animalId: string
  tipo: 'Monta' | 'Inseminación' | 'Gestación' | 'Parto'
  fecha: string
  estado: 'Pendiente' | 'Confirmado' | 'Exitoso' | 'Fallido'
  observaciones: string
}

export interface Venta {
  id: string
  fecha: string
  cliente: string
  tipo: 'Animal' | 'Producto'
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
  estadoPago: 'Pendiente' | 'Pagado' | 'Parcial'
}

export interface Gasto {
  id: string
  fecha: string
  categoria: 'Alimentación' | 'Medicamentos' | 'Mano de Obra' | 'Transporte' | 'Otros'
  descripcion: string
  monto: number
  responsable: string
  observaciones: string
}

export interface Inventario {
  id: string
  nombre: string
  categoria: 'Insumos' | 'Medicamentos' | 'Alimentos' | 'Herramientas' | 'Derivados Lácteos' | 'Productos'
  stockActual: number
  stockMinimo: number
  unidad: string
  estado: 'Disponible' | 'Bajo Stock' | 'Agotado'
  precioUnitario?: number
  fechaVencimiento?: string
  lote?: string
  proveedor?: string
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'Administrador' | 'Veterinario' | 'Operario'
  estado: 'Activo' | 'Inactivo'
}

export interface Evento {
  id: string
  titulo: string
  tipo: string
  fecha: string
}

export interface Alerta {
  id: string
  mensaje: string
  tipo: 'Alta' | 'Media' | 'Baja'
}

// Sample Data
export const razas: Raza[] = [
  { id: '1', nombre: 'Holstein', descripcion: 'Raza lechera de origen europeo', proposito: 'Leche', estado: 'Activo' },
  { id: '2', nombre: 'Jersey', descripcion: 'Raza lechera de la isla de Jersey', proposito: 'Leche', estado: 'Activo' },
  { id: '3', nombre: 'Brahman', descripcion: 'Raza de carne resistente al calor', proposito: 'Carne', estado: 'Activo' },
  { id: '4', nombre: 'Angus', descripcion: 'Raza de carne de origen escocés', proposito: 'Carne', estado: 'Activo' },
  { id: '5', nombre: 'Charolais', descripcion: 'Raza de carne francesa', proposito: 'Carne', estado: 'Activo' },
]

export const lotes: Lote[] = [
  { id: '1', codigo: 'CA', nombre: 'Corral A', tipo: 'Corral', area: 1.5, capacidad: 50, animales: 12, estado: 'Activo' },
  { id: '2', codigo: 'CB', nombre: 'Corral B', tipo: 'Corral', area: 1.0, capacidad: 30, animales: 8, estado: 'Activo' },
  { id: '3', codigo: 'CC', nombre: 'Corral C', tipo: 'Corral', area: 2.0, capacidad: 40, animales: 0, estado: 'Activo' },
  { id: '4', codigo: 'PA', nombre: 'Potrero A', tipo: 'Potrero', area: 5.2, capacidad: 30, animales: 18, estado: 'Activo' },
  { id: '5', codigo: 'PB', nombre: 'Potrero B', tipo: 'Potrero', area: 4.5, capacidad: 25, animales: 10, estado: 'Activo' },
  { id: '6', codigo: 'PC', nombre: 'Potrero C', tipo: 'Potrero', area: 3.0, capacidad: 20, animales: 0, estado: 'Activo' },
]

export const animales: Animal[] = [
  { id: '1', codigo: 'FIN001', nombre: 'Luna', sexo: 'Hembra', raza: 'Holstein', especie: 'Bovino', categoria: 'Vaca', estado: 'Activo', lote: 'Potrero A', fechaNacimiento: '2020-03-15', peso: 450, areteId: 'AR-001' },
  { id: '2', codigo: 'FIN002', nombre: 'Estrella', sexo: 'Hembra', raza: 'Holstein', especie: 'Bovino', categoria: 'Vaca', estado: 'Activo', lote: 'Potrero A', fechaNacimiento: '2019-07-22', peso: 480, areteId: 'AR-002' },
  { id: '3', codigo: 'FIN003', nombre: 'Tormenta', sexo: 'Hembra', raza: 'Jersey', especie: 'Bovino', categoria: 'Vaca', estado: 'Seco', lote: 'Potrero A', fechaNacimiento: '2018-11-10', peso: 400, areteId: 'AR-003' },
  { id: '4', codigo: 'FIN004', nombre: 'Rayo', sexo: 'Macho', raza: 'Brahman', especie: 'Bovino', categoria: 'Toro', estado: 'Activo', lote: 'Potrero B', fechaNacimiento: '2019-05-18', peso: 650, areteId: 'AR-004' },
  { id: '5', codigo: 'FIN005', nombre: 'Nieve', sexo: 'Hembra', raza: 'Holstein', especie: 'Bovino', categoria: 'Vaca', estado: 'Preñado', lote: 'Potrero A', fechaNacimiento: '2020-01-05', peso: 470, areteId: 'AR-005' },
  { id: '6', codigo: 'FIN006', nombre: 'Relámpago', sexo: 'Macho', raza: 'Angus', especie: 'Bovino', categoria: 'Novillo', estado: 'En Crecimiento', lote: 'Corral A', fechaNacimiento: '2023-02-14', peso: 280, areteId: 'AR-006' },
  { id: '7', codigo: 'FIN007', nombre: 'Dolores', sexo: 'Hembra', raza: 'Holstein', especie: 'Bovino', categoria: 'Vaca', estado: 'Activo', lote: 'Potrero B', fechaNacimiento: '2019-09-30', peso: 460, areteId: 'AR-007' },
  { id: '8', codigo: 'FIN008', nombre: 'Trueno', sexo: 'Macho', raza: 'Charolais', especie: 'Bovino', categoria: 'Novillo', estado: 'En Crecimiento', lote: 'Corral A', fechaNacimiento: '2023-04-20', peso: 320, areteId: 'AR-008' },
  { id: '9', codigo: 'FIN009', nombre: 'Blanca', sexo: 'Hembra', raza: 'Jersey', especie: 'Bovino', categoria: 'Vaca', estado: 'Activo', lote: 'Potrero A', fechaNacimiento: '2020-06-12', peso: 380, areteId: 'AR-009' },
  { id: '10', codigo: 'FIN010', nombre: 'Manchas', sexo: 'Hembra', raza: 'Holstein', especie: 'Bovino', categoria: 'Novilla', estado: 'En Crecimiento', lote: 'Corral B', fechaNacimiento: '2023-01-08', peso: 250, areteId: 'AR-010' },
]

export const registrosLeche: RegistroLeche[] = [
  { id: '1', animalId: '1', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 14.0, temperatura: 36.2, mastitis: false },
  { id: '2', animalId: '2', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 16.0, temperatura: 36.0, mastitis: false },
  { id: '3', animalId: '3', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 19.0, temperatura: 36.3, mastitis: false },
  { id: '4', animalId: '4', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 20.3, temperatura: 37.4, mastitis: true },
  { id: '5', animalId: '5', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 25.2, temperatura: 37.5, mastitis: false },
  { id: '6', animalId: '6', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 19.3, temperatura: 36.1, mastitis: true },
  { id: '7', animalId: '7', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 21.0, temperatura: 37.4, mastitis: false },
  { id: '8', animalId: '8', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 16.8, temperatura: 36.2, mastitis: false },
  { id: '9', animalId: '9', fecha: '2026-04-23T00:00:00.000Z', jornada: 'Mañana', cantidad: 14.0, temperatura: 36.8, mastitis: false },
]

export const registrosSanidad: RegistroSanidad[] = [
  { id: '1', animalId: '1', fecha: '2026-03-15', tipo: 'Vacuna', diagnostico: '', medicamento: 'Vacuna Aftosa', dosis: '5ml', viaAdministracion: 'Intramuscular', proximaFecha: '2026-09-15', veterinario: 'Dr. García', observaciones: 'Aplicación sin complicaciones' },
  { id: '2', animalId: '3', fecha: '2026-04-01', tipo: 'Tratamiento', diagnostico: 'Mastitis leve', medicamento: 'Antibiótico', dosis: '10ml', viaAdministracion: 'Intramuscular', proximaFecha: '2026-04-08', veterinario: 'Dr. García', observaciones: 'Revisar en 7 días' },
  { id: '3', animalId: '5', fecha: '2026-04-10', tipo: 'Control', diagnostico: 'Gestación confirmada', medicamento: '', dosis: '', viaAdministracion: '', proximaFecha: '2026-05-10', veterinario: 'Dra. López', observaciones: 'Gestación de 3 meses' },
]

export const usuarios: Usuario[] = [
  { id: '1', nombre: 'Administrador', email: 'admin@fincalosalamos.com', rol: 'Administrador', estado: 'Activo' },
  { id: '2', nombre: 'Juan Pérez', email: 'juan@fincalosalamos.com', rol: 'Operario', estado: 'Activo' },
  { id: '3', nombre: 'María López', email: 'maria@fincalosalamos.com', rol: 'Veterinario', estado: 'Activo' },
  { id: '4', nombre: 'Carlos García', email: 'carlos@fincalosalamos.com', rol: 'Operario', estado: 'Activo' },
]

export const ventas: Venta[] = [
  { id: '1', fecha: '2026-04-20', cliente: 'Hacienda El Roble', tipo: 'Animal', descripcion: 'Venta de novillo', cantidad: 1, precioUnitario: 2500000, total: 2500000, estadoPago: 'Pagado' },
  { id: '2', fecha: '2026-04-18', cliente: 'Lácteos del Valle', tipo: 'Producto', descripcion: 'Leche 500L', cantidad: 500, precioUnitario: 2000, total: 1000000, estadoPago: 'Pendiente' },
]

export const gastos: Gasto[] = [
  { id: '1', fecha: '2026-04-22', categoria: 'Alimentación', descripcion: 'Concentrado bovino', monto: 850000, responsable: 'Juan Pérez', observaciones: '20 bultos' },
  { id: '2', fecha: '2026-04-20', categoria: 'Medicamentos', descripcion: 'Vacunas y antibióticos', monto: 320000, responsable: 'María López', observaciones: '' },
  { id: '3', fecha: '2026-04-15', categoria: 'Mano de Obra', descripcion: 'Jornales mes abril', monto: 1500000, responsable: 'Admin', observaciones: '' },
]

export const inventario: Inventario[] = [
  { id: '1', nombre: 'Concentrado Bovino', categoria: 'Alimentos', stockActual: 45, stockMinimo: 20, unidad: 'Bultos', estado: 'Disponible', precioUnitario: 85000, proveedor: 'Agrofinca' },
  { id: '2', nombre: 'Heno', categoria: 'Alimentos', stockActual: 100, stockMinimo: 50, unidad: 'Pacas', estado: 'Disponible', precioUnitario: 15000, proveedor: 'Forrajes del Valle' },
  { id: '3', nombre: 'Vacuna Aftosa', categoria: 'Medicamentos', stockActual: 8, stockMinimo: 10, unidad: 'Dosis', estado: 'Bajo Stock', precioUnitario: 12000, fechaVencimiento: '2027-06-15', proveedor: 'VetSupply' },
  { id: '4', nombre: 'Antibiótico', categoria: 'Medicamentos', stockActual: 15, stockMinimo: 10, unidad: 'Frascos', estado: 'Disponible', precioUnitario: 45000, fechaVencimiento: '2026-12-01', proveedor: 'VetSupply' },
  { id: '5', nombre: 'Sales minerales', categoria: 'Insumos', stockActual: 5, stockMinimo: 10, unidad: 'Kg', estado: 'Bajo Stock', precioUnitario: 8500, proveedor: 'Agrofinca' },
  { id: '6', nombre: 'Queso fresco', categoria: 'Derivados Lácteos', stockActual: 25, stockMinimo: 10, unidad: 'Kg', estado: 'Disponible', precioUnitario: 28000, fechaVencimiento: '2026-06-15' },
  { id: '7', nombre: 'Yogurt natural', categoria: 'Derivados Lácteos', stockActual: 50, stockMinimo: 20, unidad: 'Litros', estado: 'Disponible', precioUnitario: 8000, fechaVencimiento: '2026-06-10' },
  { id: '8', nombre: 'Mantequilla', categoria: 'Derivados Lácteos', stockActual: 12, stockMinimo: 15, unidad: 'Kg', estado: 'Bajo Stock', precioUnitario: 35000, fechaVencimiento: '2026-07-20' },
  { id: '9', nombre: 'Cuajada', categoria: 'Derivados Lácteos', stockActual: 8, stockMinimo: 5, unidad: 'Kg', estado: 'Disponible', precioUnitario: 22000, fechaVencimiento: '2026-06-08' },
  { id: '10', nombre: 'Leche en polvo', categoria: 'Derivados Lácteos', stockActual: 0, stockMinimo: 10, unidad: 'Kg', estado: 'Agotado', precioUnitario: 45000 },
  { id: '11', nombre: 'Desparasitante', categoria: 'Medicamentos', stockActual: 20, stockMinimo: 15, unidad: 'Dosis', estado: 'Disponible', precioUnitario: 8500, fechaVencimiento: '2027-03-20', proveedor: 'VetSupply' },
  { id: '12', nombre: 'Guantes de ordeño', categoria: 'Insumos', stockActual: 200, stockMinimo: 100, unidad: 'Pares', estado: 'Disponible', precioUnitario: 500, proveedor: 'Agrofinca' },
  { id: '13', nombre: 'Detergente para tanques', categoria: 'Insumos', stockActual: 8, stockMinimo: 5, unidad: 'Litros', estado: 'Disponible', precioUnitario: 35000, proveedor: 'CleanPro' },
]

export const eventos: Evento[] = [
  { id: '1', titulo: 'Vacunación bovinos', tipo: 'Sanidad', fecha: '2026-04-25' },
  { id: '2', titulo: 'Pesaje general', tipo: 'Control', fecha: '2026-04-28' },
  { id: '3', titulo: 'Visita veterinaria', tipo: 'Sanidad', fecha: '2026-05-01' },
  { id: '4', titulo: 'Parto esperado - Nieve', tipo: 'Reproducción', fecha: '2026-05-15' },
]

export const alertas: Alerta[] = [
  { id: '1', mensaje: 'Baja producción - Vaca #23', tipo: 'Alta' },
  { id: '2', mensaje: 'Vacuna pendiente - Lote B', tipo: 'Media' },
  { id: '3', mensaje: 'Parto próximo - Vaca #45', tipo: 'Baja' },
]

// Dashboard stats
export const dashboardStats = {
  totalAnimales: 156,
  enProduccion: 42,
  secas: 18,
  prenadas: 24,
  proximosPartos: 8,
  alertasActivas: 5,
}

export const produccionMensual = [
  { mes: 'Ene', produccion: 350, peso: 480 },
  { mes: 'Feb', produccion: 420, peso: 485 },
  { mes: 'Mar', produccion: 380, peso: 490 },
  { mes: 'Abr', produccion: 480, peso: 495 },
  { mes: 'May', produccion: 520, peso: 500 },
  { mes: 'Jun', produccion: 490, peso: 505 },
]

export const distribucionSexo = [
  { name: 'Hembras', value: 98, color: '#22c55e' },
  { name: 'Machos', value: 58, color: '#3b82f6' },
]
