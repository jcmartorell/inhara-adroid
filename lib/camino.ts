import { NivelCamino } from './models';

export const NIVELES: NivelCamino[] = [
  {
    num: 1, nombre: 'Base', rangoMin: 1, rangoMax: 3,
    frecuencia: '1 clase/semana',
    patanjali: 'Pranayama: Control de la energía vital',
    intro: 'Lo más importante es que ya estás aquí, entrando a tu mundo interno, y que recuerdes que tu respiración se convierte en herramienta de transformación.',
    descripcion: `Prana es la energía vital que se refiere a la energía universal que impregna todo el universo y sustenta la vida, fluyendo dentro y alrededor de lo que existe.\n\nPranayama es el control de la respiración, para regular el flujo de la energía en el cuerpo, ayudando a calmar la mente, reducir el estrés, oxigenar el cuerpo, y mejorar la concentración.\n\nUjjayi es una respiración controlada, lenta y sutil. Se realiza a través del control respiratorio de la laringe. Con este cierre, disminuimos la velocidad y aumentamos la profundidad de la respiración, produciendo un leve sonido muy característico que recuerda al sonido de las olas del mar.\n\nSi vas iniciando, lo más importante es que te enfoques primero en inhalar y exhalar por nariz, profundamente, y después en afinar tu respiración Ujjayi. Recuerda que puedes preguntarle a cualquiera de tus maestras dudas sobre cómo realizar tu respiración Ujjayi.`,
    ensenanza: 'Tu respiración es tu primer maestro.',
  },
  {
    num: 2, nombre: 'Curiosidad', rangoMin: 4, rangoMax: 8,
    frecuencia: '1–2 clases/semana',
    patanjali: '8 Principios o Ramas del Yoga',
    intro: 'El yoga es una filosofía, no es solo una práctica física, es un proceso que abarca la forma en la que te mueves, respiras, piensas y te relacionas contigo.',
    descripcion: `De acuerdo con los Yoga Sutras de Patanjali, existe un camino de ocho pasos hacia la liberación, conocido como el "Sistema de Ashtanga Yoga".\n\nYamas — ética y relación con el entorno\nNiyamas — disciplina y relación contigo mismo\nAsana — postura física y estabilidad del cuerpo\nPranayama — control y expansión de la respiración\nPratyahara — retiro de los sentidos hacia el interior\nDharana — concentración en un punto\nDhyana — meditación, flujo continuo de atención\nSamadhi — integración, unión total\n\nEste camino no es lineal, ni se recorre perfecto, se vive poco a poco, a través de tu práctica, tu constancia y tu experiencia personal.\n\nCada clase que tomas no solo trabaja tu cuerpo, también te acerca a una mayor comprensión de ti.\n\nPorque en Inhara, el yoga no es solo lo que haces en el mat… es la forma en la que empiezas a habitarte.`,
    ensenanza: 'El yoga no es solo lo que haces en el mat.',
  },
  {
    num: 3, nombre: 'Exploración', rangoMin: 9, rangoMax: 20,
    frecuencia: '2–3 clases/semana',
    patanjali: 'Yamas: Tu relación con el mundo',
    intro: 'El inicio del camino. El cuerpo descubre el movimiento consciente. Es un paso más cerca a tu armonía interior y con el mundo.',
    descripcion: `Los yamas son el primero de los 8 caminos del yoga. Son normas éticas que guían nuestra relación con los demás y el mundo exterior.\n\nAhimsa: No violencia. No desear, ni herir en palabra, pensamiento o acción.\nSatya: No mentir. Veracidad. Ser sincero y honesto en relación con lo que pienso y actúo.\nAsteya: No robar. Ni aprovecharse de una situación en la que alguien nos ha confiado.\nBrahmacarya: No desperdiciar la energía, ya que es inmensamente poderosa.\nAparigraha: No codiciar. No acumular, no aferrarse a bienes materiales ni a pensamientos o emociones.\n\n¿Cómo los integro en mi realidad?\n\nAhimsa: obsérvate en cómo te hablas cuando te equivocas, en la paciencia que tienes contigo y con otros.\nSatya: reconoce cómo te sientes realmente, incluso cuando no es cómodo.\nAsteya: respeta el tiempo, la energía y los espacios de los demás, y también los tuyos.\nAparigraha: observa eso a lo que te apegas materialmente y elige agradecer todo lo que SÍ tienes.`,
    ensenanza: 'Cada clase te acerca a tu armonía interior.',
  },
  {
    num: 4, nombre: 'Constancia', rangoMin: 21, rangoMax: 40,
    frecuencia: '3 clases/semana',
    patanjali: 'Niyamas: Disciplina personal',
    intro: 'La curiosidad despierta. Empiezas a notar los efectos de la práctica en tu vida cotidiana. Esto es tu relación contigo.',
    descripcion: `Los niyamas son prácticas internas que guían la relación del practicante consigo mismo. Ayudan a cultivar la disciplina, la pureza y la introspección.\n\nShaucha (Pureza): Mantener la limpieza del cuerpo, la mente y el entorno.\nSantosha (Contentamiento): Practicar la gratitud y estar satisfecho con lo que se tiene.\nTapas (Disciplina): Cultivar autodisciplina y fuerza de voluntad para superar los obstáculos.\nSvadhyaya (Estudio de uno mismo): Reflexionar sobre uno mismo y desarrollar el autoconocimiento.\nIshvarapranidhana (Entrega): Rendir los frutos de nuestras acciones a una fuerza superior.\n\n¿Cómo los integro en mi realidad?\n\nShaucha: obsérvate en lo que consumes — pensamientos, alimentos, contenido — y cómo influye en cómo te sientes.\nSantosha: reconoce y agradece todo lo que ya está bien en tu vida.\nTapas: regresa a tu tapete, aunque no tengas ganas. Elegirte, incluso en lo incómodo.\nSvadhyaya: cuestiona tus reacciones, tus patrones, tus pensamientos. Observa sin juicio.`,
    ensenanza: 'La constancia transforma.',
  },
  {
    num: 5, nombre: 'Disciplina', rangoMin: 41, rangoMax: 70,
    frecuencia: '3–4 clases/semana',
    patanjali: 'Asana: Postura estable y cómoda',
    intro: 'La base se construye. El cuerpo aprende patrones de movimiento. La mente empieza a aquietarse.',
    descripcion: `Asana proviene de la raíz sánscrita "as", que significa "sentarse" o "estar establecido". En los Yoga Sutras de Patanjali se refería a la postura sentada para la meditación.\n\nAsana nos enseña a encontrar un punto medio entre fuerza y suavidad, esfuerzo y calma, estructura y respiración.\n\nSthira Sukham Asanam nos recuerda que una postura debe tener dos cualidades: estabilidad y comodidad. No se trata de forzar el cuerpo, sino de habitarlo con presencia.\n\nEn esta etapa, la base se construye. El cuerpo aprende patrones de movimiento, el core comienza a despertar como centro de gravedad y la mente empieza a aquietarse a través de la repetición consciente.\n\nTambién aparece el principio de Parinamavada: avanzar de lo simple a lo complejo. Primero se construye raíz, luego dirección; primero conciencia, después profundidad.\n\nAsana no busca perfección. Busca presencia dentro del cuerpo.`,
    ensenanza: 'Busca presencia dentro del cuerpo.',
  },
  {
    num: 6, nombre: 'Raíz', rangoMin: 71, rangoMax: 110,
    frecuencia: '4 clases/semana',
    patanjali: 'Asana: Dominio del cuerpo físico',
    intro: 'La constancia es el puente entre el principiante y el practicante. La práctica se vuelve hábito.',
    descripcion: `La constancia es el puente entre el principiante y el practicante. La práctica se vuelve hábito, y el cuerpo comienza a responder desde un lugar más consciente.\n\nEn esta etapa, el trabajo deja de ser solo externo. Aparece la percepción interna.\n\nLos bandhas son cierres energéticos que regulan, contienen y dirigen la energía dentro del cuerpo. No son visibles, pero transforman profundamente la estabilidad, la respiración y la calidad de la práctica.\n\nMula Bandha — raíz de la energía. Se encuentra en la base del cuerpo. Es un sutil compromiso del suelo pélvico que genera estabilidad desde el origen.\n\nUddiyana Bandha — ascenso de la energía. Se activa en el abdomen bajo. Ayuda a aligerar el cuerpo y a dirigir la energía hacia arriba.\n\nJalandhara Bandha — cierre de la garganta. Regula la respiración y protege el flujo de energía.\n\nLos bandhas no se fuerzan. Se descubren con el tiempo, con la repetición y con la atención. A través de ellos, el cuerpo deja de colapsar y comienza a sostenerse con inteligencia.`,
    ensenanza: 'La repetición genera sabiduría corporal.',
  },
  {
    num: 7, nombre: 'Dedicación', rangoMin: 111, rangoMax: 160,
    frecuencia: '4–5 clases/semana',
    patanjali: 'Pranayamas: Profundización',
    intro: 'Entras al mundo interno. La respiración se convierte en herramienta de transformación.',
    descripcion: `En esta etapa, la respiración deja de ser solo una herramienta de acompañamiento y comienza a explorarse con mayor detalle y conciencia.\n\nEsa energía fluye a través de los nadis, canales sutiles dentro del cuerpo energético. A través de la respiración, comienzas a influir en ese flujo interno.\n\nLa respiración ya no es solo inhalar y exhalar. Se vuelve un ciclo completo compuesto por cuatro fases:\n\nPuraka — inhalación\nRechaka — exhalación\nAntara Kumbhaka — retención después de inhalar\nBahya Kumbhaka — retención después de exhalar\n\nCuando la respiración se detiene, incluso por un instante, aparece una pausa. Y en esa pausa, la mente comienza a aquietarse.\n\nKapalabhati — respiración de limpieza. Se caracteriza por exhalaciones activas y rápidas. Su objetivo es limpiar, activar y despertar el sistema energético.\n\nPranayama en esta etapa no solo regula tu respiración, refina tu atención.`,
    ensenanza: 'Entre cada respiración, existe un espacio de quietud.',
  },
  {
    num: 8, nombre: 'Fluidez', rangoMin: 161, rangoMax: 220,
    frecuencia: '5 clases/semana',
    patanjali: 'Pratyahara: Retiro de los sentidos',
    intro: 'El cuerpo ya sabe. La mente empieza a soltar el mundo exterior. La práctica se vuelve meditación en movimiento.',
    descripcion: `En este punto, algo cambia. Ya no tienes que pensar tanto en la postura. El cuerpo responde casi solo. Y eso abre un espacio nuevo: la atención deja de estar afuera y comienza a dirigirse hacia adentro.\n\nPratyahara es ese momento en el que empiezas a notar que no todo lo que sucede afuera necesita tu reacción.\n\nEn la práctica, esto se siente cuando logras mantenerte en una postura, en una respiración, aunque haya ruido, distracciones o incomodidad.\n\nPero el verdadero cambio sucede fuera del mat. Cuando empiezas a:\n— no reaccionar inmediatamente\n— observar antes de responder\n— darte espacio antes de tomar decisiones\n\nEl movimiento se convierte en un laboratorio. Cada clase es una oportunidad para observarte: cómo reaccionas cuando algo se pone difícil, si te frustras o te sostienes, si te desconectas o te quedas presente.\n\nPratyahara es ese punto donde dejas de buscar afuera lo que empiezas a encontrar adentro.`,
    ensenanza: 'La calma que sientes en la práctica también la puedes llevar contigo.',
  },
  {
    num: 9, nombre: 'Profundidad', rangoMin: 221, rangoMax: 300,
    frecuencia: '5–6 clases/semana',
    patanjali: 'Dharana: Concentración',
    intro: 'La práctica toca dimensiones más profundas. La concentración es tu superpoder.',
    descripcion: `Dharana es el 6° paso de los 8 del yoga y significa concentración. Su técnica principal es fijar la conciencia en un punto fijo.\n\nDharana viene de la raíz "dhr", que significa "llevar". Es dirigir la mente hacia un punto fijo y mantenerla allí, siendo el paso previo a la meditación.\n\nLa mente naturalmente se dispersa: se va al pasado, al futuro, a lo que falta, a lo que incomoda. Aquí es donde empieza el verdadero trabajo.\n\nEn la práctica, lo ves cuando intentas enfocarte en tu respiración o en una postura… y te das cuenta de cuántas veces te distraes. Pero no se trata de evitar distraerte, sino de darte cuenta… y regresar. Una y otra vez. Ahí se construye la concentración.\n\nFuera del mat, esta práctica se traduce en:\n— poder enfocarte en una conversación sin distraerte\n— terminar lo que empiezas\n— elegir dónde poner tu energía\n\nDharana no es controlar la mente, es aprender a dirigirla. Y en ese proceso, empiezas a ver algo con más claridad: quién eres cuando estás presente.`,
    ensenanza: 'La práctica te revela quién eres.',
  },
  {
    num: 10, nombre: 'Transformación', rangoMin: 301, rangoMax: 400,
    frecuencia: '6 clases/semana',
    patanjali: 'Dhyana: Meditación',
    intro: 'Has cambiado. La práctica no es lo que haces — es lo que eres. La meditación surge naturalmente.',
    descripcion: `Dhyana es la contemplación o meditación profunda. La mente consigue mantenerse fija en una idea de manera ininterrumpida, alcanzando una paz interior.\n\nEn la práctica, esto se siente cuando te das cuenta de que pasó el tiempo y nunca te fuiste realmente. No estabas pensando en mil cosas, no estabas reaccionando, solo estabas ahí.\n\nY eso empieza a extenderse fuera del mat. Te descubres:\n— más presente en tus conversaciones\n— más paciente en momentos incómodos\n— menos reactivo\n— más claro en tus decisiones\n\nNo porque lo estés intentando, sino porque algo en ti ya cambió.\n\nAquí es donde aparece Seva. Seva es el acto de servir desde un lugar consciente. No como obligación, sino como una extensión natural de tu práctica.\n\nLa transformación ya no es solo interna, se vuelve visible. En cómo hablas, en cómo acompañas, en cómo estás presente para alguien más.\n\nDhyana no es un estado lejano, es una forma de habitar tu vida.`,
    ensenanza: 'La transformación es visible en cómo eliges estar en el mundo.',
  },
  {
    num: 11, nombre: 'Maestro/a Interior', rangoMin: 401, rangoMax: 99999,
    frecuencia: '6–7 clases/semana · práctica integrada',
    patanjali: 'Samadhi: Integración total',
    intro: 'El camino sigue. La sabiduría que has acumulado ahora irradia. Eres guía y estudiante al mismo tiempo.',
    descripcion: `En este punto, la práctica se integra. Ya no hay una separación tan clara entre lo que haces en el mat y lo que vives afuera; todo empieza a formar parte de lo mismo.\n\nSamadhi no es un logro ni una meta a la que llegas, es un estado de conexión. Momentos donde dejas de sentirte separado de tu cuerpo, de tu respiración, de lo que estás viviendo. Momentos donde simplemente estás, sin esfuerzo y sin resistencia.\n\nLa práctica, después de todo este camino, ya no busca cambiarte, te permite reconocerte. El conocimiento que has acumulado deja de ser teoría y se convierte en una forma de vivir: en cómo te hablas, en cómo eliges, en cómo te sostienes tanto en lo difícil como en lo ligero.\n\nAquí entiendes que no hay un final, que siempre hay algo que observar, algo que aprender, algo que soltar. Y eso no pesa, al contrario, es lo que mantiene vivo el camino.\n\nSer "Maestro/a Interior" no significa tener todas las respuestas, significa confiar en tu experiencia. Escucharte, respetarte, regresar a ti una y otra vez.\n\nTodo lo que buscabas, siempre estuvo dentro de ti.`,
    ensenanza: 'El camino sigue.',
  },
];

export const PREMIUM_SLUGS = ['ilimitado', 'ilimitado-2', 'trimestral', 'semestral', 'anual'];

export function getNivel(total: number): NivelCamino {
  return NIVELES.find((n) => total >= n.rangoMin && total <= n.rangoMax) ?? NIVELES[0];
}

export function getProgresoPct(total: number): number {
  const nivel = getNivel(total);
  const siguiente = NIVELES.find((n) => n.num === nivel.num + 1);
  if (!siguiente) return 100;
  const rango = nivel.rangoMax - nivel.rangoMin;
  return Math.max(0, Math.min(100, ((total - nivel.rangoMin) / rango) * 100));
}
