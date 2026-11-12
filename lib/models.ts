export interface Profile {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  rol: string | null;
  numero_alumno: string | null;
}

export interface Plan {
  id: number;
  nombre: string;
  slug: string | null;
  precio: number;
  clases_por_mes: number | null;
  duracion_dias: number | null;
  ilimitado: boolean | null;
  descripcion: string | null;
  activo: boolean | null;
  orden: number | null;
}

export interface Suscripcion {
  id: string;
  user_id: string;
  plan_id: number | null;
  estado: string;
  clases_restantes: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  ilimitado: boolean | null;
}

export interface Asistencia {
  id: string;
  user_id: string;
  clase_id: string | null;
  fecha: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string | null;
  activo: boolean | null;
  para_todos: boolean | null;
  para_alumnos: boolean | null;
  created_at: string;
}

export interface NivelCamino {
  num: number;
  nombre: string;
  rangoMin: number;
  rangoMax: number;
  frecuencia: string;
  patanjali: string;
  intro: string;
  descripcion: string;
  ensenanza: string;
}
