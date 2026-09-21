// Criterio ÚNICO para decidir cuál paquete se usa/muestra cuando una alumna tiene más de
// uno "activo". Lo usan el servidor (reservas) y todas las pantallas, para que lo que se
// muestra sea siempre el paquete del que realmente se descuenta.
// Seguro para el navegador (no importa nada del servidor).

export interface SubOrdenable {
  fecha_fin: string
  clases_restantes: number | null
  created_at?: string
}

// La que vence primero; en empate, la ilimitada (no gasta créditos); en empate, la más antigua.
export function ordenarSubs<T extends SubOrdenable>(subs: T[]): T[] {
  return [...subs].sort((a, b) => {
    if (a.fecha_fin !== b.fecha_fin) return a.fecha_fin < b.fecha_fin ? -1 : 1
    const ua = a.clases_restantes === null ? 0 : 1
    const ub = b.clases_restantes === null ? 0 : 1
    if (ua !== ub) return ua - ub
    const ca = a.created_at ?? '', cb = b.created_at ?? ''
    return ca < cb ? -1 : ca > cb ? 1 : 0
  })
}

export const tieneCupo = (s: { clases_restantes: number | null }) =>
  s.clases_restantes === null || s.clases_restantes > 0

// Paquete a mostrar: el que se usaría para la próxima reserva; si todos están agotados,
// el que vence primero (se muestra con 0 clases).
export function elegirSuscripcionActual<T extends SubOrdenable>(subs: T[] | null | undefined): T | null {
  const ordenadas = ordenarSubs(subs ?? [])
  return ordenadas.find(tieneCupo) ?? ordenadas[0] ?? null
}
