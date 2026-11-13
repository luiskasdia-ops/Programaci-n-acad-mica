import {
  BloqueHorario,
  DiaSemana,
  Ficha,
  FranjaHorario,
  Instructor,
  Sede,
} from '../types/scheduling';

export interface ConflictoHorario {
  tipo: 'cruce' | 'limite_diario' | 'limite_semanal' | 'desplazamiento_sede';
  severidad: 'error' | 'alerta';
  mensaje: string;
  dia?: DiaSemana;
  instructorId: string;
}

function parseFranja(franja: FranjaHorario): [number, number] {
  const [inicio, fin] = franja.split(' - ').map((t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  });
  return [inicio, fin];
}

export function franjasSeCruzan(a: FranjaHorario, b: FranjaHorario): boolean {
  const [aStart, aEnd] = parseFranja(a);
  const [bStart, bEnd] = parseFranja(b);
  return aStart < bEnd && bStart < aEnd;
}

export function validarNuevoBloque(
  nuevo: Omit<BloqueHorario, 'id'>,
  bloquesExistentes: BloqueHorario[],
  instructor: Instructor,
  ficha: Ficha
): ConflictoHorario[] {
  const conflictos: ConflictoHorario[] = [];
  const bloquesInstructor = bloquesExistentes.filter(
    (b) => b.instructorId === instructor.id && b.trimestre === nuevo.trimestre
  );

  // 1. Cruce de horario del instructor en el mismo día
  const bloquesMismoDia = bloquesInstructor.filter((b) => b.dia === nuevo.dia);
  for (const b of bloquesMismoDia) {
    if (franjasSeCruzan(b.franja, nuevo.franja)) {
      conflictos.push({
        tipo: 'cruce',
        severidad: 'error',
        instructorId: instructor.id,
        dia: nuevo.dia,
        mensaje: `Cruce de horario el ${nuevo.dia} (${nuevo.franja} se solapa con ${b.franja}).`,
      });
    }
  }

  // 2. Cruce de horario en la misma ficha
  const bloquesFichaMismoDia = bloquesExistentes.filter(
    (b) =>
      b.fichaId === ficha.id &&
      b.trimestre === nuevo.trimestre &&
      b.dia === nuevo.dia
  );
  for (const b of bloquesFichaMismoDia) {
    if (franjasSeCruzan(b.franja, nuevo.franja)) {
      conflictos.push({
        tipo: 'cruce',
        severidad: 'error',
        instructorId: instructor.id,
        dia: nuevo.dia,
        mensaje: `La ficha ${ficha.codigo} ya tiene clase el ${nuevo.dia} en ${b.franja}.`,
      });
    }
  }

  // 3. Límite diario del instructor (6h Planta, 10h Contrato)
  const horasDiaActual = bloquesMismoDia.reduce((acc, b) => acc + b.horas, 0);
  if (horasDiaActual + nuevo.horas > instructor.horasDiariasMax) {
    conflictos.push({
      tipo: 'limite_diario',
      severidad: 'error',
      instructorId: instructor.id,
      dia: nuevo.dia,
      mensaje: `Excede el máximo diario de ${instructor.horasDiariasMax}h para ${instructor.tipo} (${horasDiaActual + nuevo.horas}h el ${nuevo.dia}).`,
    });
  }

  // 4. Límite semanal del instructor (32h Planta, 40h Contrato)
  const horasSemanaActual = bloquesInstructor.reduce((acc, b) => acc + b.horas, 0);
  if (horasSemanaActual + nuevo.horas > instructor.horasSemanalesMax) {
    conflictos.push({
      tipo: 'limite_semanal',
      severidad: 'error',
      instructorId: instructor.id,
      mensaje: `Excede la carga semanal de ${instructor.horasSemanalesMax}h (${horasSemanaActual + nuevo.horas}h asignadas).`,
    });
  }

  // 5. Desplazamiento entre sedes en el mismo día
  const sedesDia = new Set<Sede>(bloquesMismoDia.map((b) => b.sede));
  if (sedesDia.size > 0 && !sedesDia.has(nuevo.sede)) {
    conflictos.push({
      tipo: 'desplazamiento_sede',
      severidad: 'alerta',
      instructorId: instructor.id,
      dia: nuevo.dia,
      mensaje: `Desplazamiento el ${nuevo.dia}: ya tiene clase en ${Array.from(sedesDia).join(', ')} y se asigna a ${nuevo.sede}.`,
    });
  }

  // 6. Cruce de ambiente en la misma sede
  if (nuevo.ambiente) {
    const bloquesAmbiente = bloquesExistentes.filter(
      (b) =>
        b.trimestre === nuevo.trimestre &&
        b.dia === nuevo.dia &&
        b.sede === nuevo.sede &&
        b.ambiente === nuevo.ambiente
    );
    for (const b of bloquesAmbiente) {
      if (franjasSeCruzan(b.franja, nuevo.franja)) {
        conflictos.push({
          tipo: 'cruce',
          severidad: 'error',
          instructorId: instructor.id,
          dia: nuevo.dia,
          mensaje: `El ambiente ${nuevo.ambiente} (${nuevo.sede}) ya está ocupado el ${nuevo.dia} en ${b.franja}.`,
        });
      }
    }
  }

  return conflictos;
}

export function analizarInstructor(
  instructor: Instructor,
  bloques: BloqueHorario[],
  trimestre: string
) {
  const propios = bloques.filter(
    (b) => b.instructorId === instructor.id && b.trimestre === trimestre
  );
  const horasSemanales = propios.reduce((acc, b) => acc + b.horas, 0);
  const conflictos: ConflictoHorario[] = [];

  const porDia = new Map<DiaSemana, BloqueHorario[]>();
  for (const b of propios) {
    const lista = porDia.get(b.dia) ?? [];
    lista.push(b);
    porDia.set(b.dia, lista);
  }

  for (const [dia, lista] of porDia.entries()) {
    const horasDia = lista.reduce((acc, b) => acc + b.horas, 0);
    if (horasDia > instructor.horasDiariasMax) {
      conflictos.push({
        tipo: 'limite_diario',
        severidad: 'error',
        instructorId: instructor.id,
        dia,
        mensaje: `${dia}: ${horasDia}h programadas (máx. ${instructor.horasDiariasMax}h ${instructor.tipo}).`,
      });
    }

    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        if (franjasSeCruzan(lista[i].franja, lista[j].franja)) {
          conflictos.push({
            tipo: 'cruce',
            severidad: 'error',
            instructorId: instructor.id,
            dia,
            mensaje: `${dia}: cruce entre ${lista[i].franja} y ${lista[j].franja}.`,
          });
        }
      }
    }

    const sedes = new Set(lista.map((b) => b.sede));
    if (sedes.size > 1) {
      conflictos.push({
        tipo: 'desplazamiento_sede',
        severidad: 'alerta',
        instructorId: instructor.id,
        dia,
        mensaje: `${dia}: desplazamiento entre sedes (${Array.from(sedes).join(' → ')}).`,
      });
    }
  }

  if (horasSemanales > instructor.horasSemanalesMax) {
    conflictos.push({
      tipo: 'limite_semanal',
      severidad: 'error',
      instructorId: instructor.id,
      mensaje: `Carga semanal de ${horasSemanales}h supera el límite de ${instructor.horasSemanalesMax}h.`,
    });
  }

  return {
    horasSemanales,
    porcentajeUso: Math.round((horasSemanales / instructor.horasSemanalesMax) * 100),
    conflictos,
    tieneErrores: conflictos.some((c) => c.severidad === 'error'),
    tieneAlertas: conflictos.some((c) => c.severidad === 'alerta'),
  };
}

export function analizarFicha(
  ficha: Ficha,
  bloques: BloqueHorario[],
  trimestre: string
) {
  const propios = bloques.filter(
    (b) => b.fichaId === ficha.id && b.trimestre === trimestre
  );
  const horasSemanales = propios.reduce((acc, b) => acc + b.horas, 0);

  const tecnicos = new Set(
    propios.filter((b) => b.competencia === 'Técnica').map((b) => b.instructorId)
  ).size;
  const transversales = new Set(
    propios.filter((b) => b.competencia === 'Transversal').map((b) => b.instructorId)
  ).size;
  const bilinguismo = new Set(
    propios.filter((b) => b.competencia === 'Bilingüismo').map((b) => b.instructorId)
  ).size;

  return {
    horasSemanales,
    cumpleHoras: horasSemanales === ficha.horasSemanalesMeta,
    tecnicos, // Meta: 3
    transversales, // Meta: 2
    bilinguismo, // Meta: 1
    cumpleComposicion: tecnicos >= 3 && transversales >= 2 && bilinguismo >= 1,
  };
}
