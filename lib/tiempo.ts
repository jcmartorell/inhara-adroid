// Las clases se guardan con fecha + hora "de pared" del estudio (Hermosillo, UTC-7 todo el
// año). Nunca hay que comparar new Date(`${fecha}T${hora}`) contra "ahora": el teléfono
// puede tener otra zona horaria. Ambos lados se llevan a la hora del estudio.
export const STUDIO_TZ = 'America/Hermosillo';

const pad = (n: number) => String(n).padStart(2, '0');

function partesEstudio(d: Date) {
  try {
    const f = new Intl.DateTimeFormat('en-US', {
      timeZone: STUDIO_TZ,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const o: Record<string, number> = {};
    for (const p of f.formatToParts(d)) if (p.type !== 'literal') o[p.type] = Number(p.value);
    if (o.year && o.month && o.day) return o;
  } catch {}
  // Respaldo si el motor no soporta zonas: Hermosillo es UTC-7 fijo (sin horario de verano).
  const s = new Date(d.getTime() - 7 * 3600000);
  return {
    year: s.getUTCFullYear(), month: s.getUTCMonth() + 1, day: s.getUTCDate(),
    hour: s.getUTCHours(), minute: s.getUTCMinutes(), second: s.getUTCSeconds(),
  };
}

export function ahoraEstudioMs(now: Date = new Date()): number {
  const p = partesEstudio(now);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
}

// 'YYYY-MM-DD' de hoy en el estudio.
export function hoyEstudio(now: Date = new Date()): string {
  const p = partesEstudio(now);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function claseMs(fecha: string, hora: string | null | undefined): number {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
  const [H = '0', M = '0', S = '0'] = (hora ?? '00:00:00').split(':');
  return Date.UTC(y, m - 1, d, Number(H), Number(M), Number(S));
}

export function claseYaEmpezo(fecha: string, hora: string | null | undefined, now: Date = new Date()): boolean {
  return claseMs(fecha, hora) <= ahoraEstudioMs(now);
}
