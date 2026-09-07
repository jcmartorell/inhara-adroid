import { NivelCamino } from './models';

export const NIVELES: NivelCamino[] = [
  { num: 1, nombre: 'Exploración', rangoMin: 1, rangoMax: 3, frecuencia: '1 clase/semana', ensenanza: 'Cada clase es un primer paso.', patanjali: 'Yamas: Ética y conducta', descripcion: 'El inicio del camino. El cuerpo descubre el movimiento consciente.' },
  { num: 2, nombre: 'Curiosidad', rangoMin: 4, rangoMax: 8, frecuencia: '1–2 clases/semana', ensenanza: 'La curiosidad es el mejor motor.', patanjali: 'Niyamas: Disciplina personal', descripcion: 'La curiosidad despierta. Empiezas a notar los efectos en tu vida cotidiana.' },
  { num: 3, nombre: 'Base', rangoMin: 9, rangoMax: 20, frecuencia: '2 clases/semana', ensenanza: 'Construir una base requiere repetición.', patanjali: 'Asana: Postura estable y cómoda', descripcion: 'La base se construye. La mente empieza a aquietarse.' },
  { num: 4, nombre: 'Constancia', rangoMin: 21, rangoMax: 40, frecuencia: '2–3 clases/semana', ensenanza: 'La constancia transforma.', patanjali: 'Asana: Dominio del cuerpo físico', descripcion: 'La práctica se vuelve hábito. La constancia es el puente.' },
  { num: 5, nombre: 'Dedicación', rangoMin: 41, rangoMax: 70, frecuencia: '3 clases/semana', ensenanza: 'La dedicación es compromiso.', patanjali: 'Pranayama: Control de la energía vital', descripcion: 'La respiración se convierte en herramienta de transformación.' },
  { num: 6, nombre: 'Fluidez', rangoMin: 71, rangoMax: 110, frecuencia: '3–4 clases/semana', ensenanza: 'El cuerpo ya sabe.', patanjali: 'Pratyahara: Retiro de los sentidos', descripcion: 'La práctica se vuelve meditación en movimiento.' },
  { num: 7, nombre: 'Profundidad', rangoMin: 111, rangoMax: 160, frecuencia: '4 clases/semana', ensenanza: 'La profundidad se descubre.', patanjali: 'Dharana: Concentración', descripcion: 'La concentración es tu superpoder.' },
  { num: 8, nombre: 'Transformación', rangoMin: 161, rangoMax: 220, frecuencia: '4–5 clases/semana', ensenanza: 'Has cambiado. Y lo sabes.', patanjali: 'Dhyana: Meditación', descripcion: 'La meditación surge naturalmente.' },
  { num: 9, nombre: 'Maestra/o Interior', rangoMin: 221, rangoMax: 9999, frecuencia: 'Como quieras', ensenanza: 'El camino sigue.', patanjali: 'Samadhi: Integración total', descripcion: 'La sabiduría que has acumulado ahora irradia.' },
];

export const PREMIUM_SLUGS = ['ilimitado', 'ilimitado-2', 'trimestral', 'semestral', 'anual'];

export function getNivel(total: number): NivelCamino {
  return NIVELES.find((n) => total >= n.rangoMin && total <= n.rangoMax) ?? NIVELES[NIVELES.length - 1];
}

export function getProgresoPct(total: number): number {
  const nivel = getNivel(total);
  const siguiente = NIVELES.find((n) => n.num === nivel.num + 1);
  if (!siguiente) return 100;
  const rango = nivel.rangoMax - nivel.rangoMin;
  return Math.min(100, ((total - nivel.rangoMin) / rango) * 100);
}
