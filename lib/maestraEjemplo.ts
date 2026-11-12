// Datos de EJEMPLO para maquetar la interfaz de maestra. Se reemplazan por datos reales de Supabase.
export interface ClaseMaestra {
  id: string;
  titulo: string;
  dia: string;
  hora: string;
  horaFin: string;
  ubicacion: string;
  reservadas: number;
  capacidad: number;
}

export interface AlumnaClase {
  id: string;
  nombre: string;
  paquete: string;
}

export const CLASES_EJEMPLO: ClaseMaestra[] = [
  { id: '1', titulo: 'Flow into / Twists', dia: 'Hoy', hora: '07:15', horaFin: '08:15', ubicacion: 'Estudio Inhara', reservadas: 9, capacidad: 12 },
  { id: '2', titulo: 'Power Flow', dia: 'Hoy', hora: '19:15', horaFin: '20:15', ubicacion: 'Estudio Inhara', reservadas: 11, capacidad: 12 },
  { id: '3', titulo: 'Journey to: Bakasana', dia: 'Mañana', hora: '09:30', horaFin: '10:30', ubicacion: 'Estudio Inhara', reservadas: 6, capacidad: 12 },
  { id: '4', titulo: 'Flow into / Arm balance', dia: 'Mañana', hora: '18:15', horaFin: '19:15', ubicacion: 'Estudio Inhara', reservadas: 12, capacidad: 12 },
  { id: '5', titulo: 'The Lab: Backbends', dia: 'Vie 7 nov', hora: '09:30', horaFin: '10:30', ubicacion: 'Estudio Inhara', reservadas: 4, capacidad: 12 },
];

export const ALUMNAS_EJEMPLO: AlumnaClase[] = [
  { id: 'a1', nombre: 'Ana Sofía Ruiz', paquete: '12 clases' },
  { id: 'a2', nombre: 'Mariana López', paquete: 'Mes ilimitado' },
  { id: 'a3', nombre: 'Daniela Torres', paquete: '8 clases' },
  { id: 'a4', nombre: 'Carolina Méndez', paquete: 'Trimestral' },
  { id: 'a5', nombre: 'Valeria Ortega', paquete: '4 clases' },
  { id: 'a6', nombre: 'Paula Herrera', paquete: '10 clases' },
  { id: 'a7', nombre: 'Renata Aguilar', paquete: 'Semestral' },
  { id: 'a8', nombre: 'Sofía Navarro', paquete: '12 clases' },
  { id: 'a9', nombre: 'Lucía Fernández', paquete: 'Mes ilimitado' },
];
