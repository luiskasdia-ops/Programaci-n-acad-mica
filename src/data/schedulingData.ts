import {
  AMBIENTES_POR_SEDE,
  BloqueHorario,
  Ficha,
  Instructor,
  Jornada,
  NivelPrograma,
  SEDES,
  Sede,
  TipoCompetencia,
} from '../types/scheduling';

const NOMBRES_BASE = [
  'Carlos Mendoza Ríos',
  'Laura Restrepo Giraldo',
  'Andrés Gómez Saldarriaga',
  'María Fernanda Ruiz Castro',
  'Juan Pablo Ríos Valencia',
  'Diana Carolina Vélez Ortiz',
  'Sebastián Torres Zapata',
  'Natalia Jiménez Morales',
  'Óscar Iván Salazar Mejía',
  'Paola Andrea Castro Quintero',
  'Felipe Arango Bedoya',
  'Juliana Cardona Montoya',
  'Héctor Fabio Muñoz López',
  'Camila Montoya Agudelo',
  'Mateo Bedoya Posada',
  'Valentina Ospina Ramírez',
  'Diego Alejandro Londoño Pérez',
  'Estefanía Ramírez Henao',
  'Jhonatan Pérez Aristizábal',
  'Marcela Henao Álvarez',
];

const SEGUNDOS_APELLIDOS = [
  'Giraldo',
  'Saldarriaga',
  'Valencia',
  'Ortiz',
  'Zapata',
  'Morales',
  'Mejía',
  'Quintero',
  'Agudelo',
  'Posada',
  'Aristizábal',
  'Álvarez',
  'Castaño',
  'Betancur',
  'Echeverri',
  'Naranjo',
  'Escobar',
  'Uribe',
  'Correa',
  'Velásquez',
];

const PRIMEROS_NOMBRES = [
  'Carlos',
  'Laura',
  'Andrés',
  'María Fernanda',
  'Juan Pablo',
  'Diana Carolina',
  'Sebastián',
  'Natalia',
  'Óscar Iván',
  'Paola Andrea',
  'Felipe',
  'Juliana',
  'Héctor Fabio',
  'Camila',
  'Mateo',
  'Valentina',
  'Diego Alejandro',
  'Estefanía',
  'Jhonatan',
  'Marcela',
  'Santiago',
  'Daniela',
  'Alejandro',
  'Manuela',
  'Cristian',
  'Luisa Fernanda',
  'Mauricio',
  'Tatiana',
  'Gabriel',
  'Verónica',
];

const PRIMEROS_APELLIDOS = [
  'Mendoza',
  'Restrepo',
  'Gómez',
  'Ruiz',
  'Ríos',
  'Vélez',
  'Torres',
  'Jiménez',
  'Salazar',
  'Castro',
  'Arango',
  'Cardona',
  'Muñoz',
  'Montoya',
  'Bedoya',
  'Ospina',
  'Londoño',
  'Ramírez',
  'Pérez',
  'Henao',
  'Gutiérrez',
  'Hernández',
  'Martínez',
  'Sánchez',
  'Rodríguez',
  'Vargas',
  'Patiño',
  'Marín',
  'Orozco',
  'Cifuentes',
];

const ESPECIALIDADES: Record<TipoCompetencia, string[]> = {
  Técnica: [
    'Análisis y Desarrollo de Software',
    'Gestión Contable y Financiera',
    'Automatización Industrial',
    'Logística Empresarial',
    'Redes y Telecomunicaciones',
    'Producción Multimedia',
  ],
  Transversal: [
    'Ética y Cultura de Paz',
    'Salud Ocupacional y SST',
    'Matemáticas y Razonamiento',
    'Emprendimiento e Innovación',
  ],
  Bilingüismo: ['Inglés Técnico B1/B2', 'Comunicación en Lengua Extranjera'],
};

const PROGRAMAS_TECNICO = [
  'Programación de Software',
  'Asistencia Administrativa',
  'Contabilización de Operaciones Comerciales',
  'Mantenimiento de Equipos de Cómputo',
  'Sistemas Teleinformáticos',
  'Gestión de Mercados',
];

const PROGRAMAS_TECNOLOGO = [
  'Análisis y Desarrollo de Software',
  'Gestión Empresarial',
  'Gestión Logística',
  'Gestión del Talento Humano',
  'Automatización de Sistemas Mecatrónicos',
  'Producción de Multimedia',
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Generar exactamente 111 instructores: 30 Planta + 81 Contrato
export function generarInstructores(): Instructor[] {
  const instructores: Instructor[] = [];
  const jornadas: Jornada[] = ['Mañana', 'Tarde', 'Noche'];

  for (let i = 0; i < 111; i++) {
    const esPlanta = i < 30;
    const competencia: TipoCompetencia =
      i % 6 === 0 ? 'Bilingüismo' : i % 3 === 0 ? 'Transversal' : 'Técnica';
    const espList = ESPECIALIDADES[competencia];
    const nombreCompleto =
      i < NOMBRES_BASE.length
        ? capitalize(NOMBRES_BASE[i])
        : `${PRIMEROS_NOMBRES[i % PRIMEROS_NOMBRES.length]} ${PRIMEROS_APELLIDOS[(i + Math.floor(i / 5)) % PRIMEROS_APELLIDOS.length]} ${SEGUNDOS_APELLIDOS[(i * 3 + Math.floor(i / 10)) % SEGUNDOS_APELLIDOS.length]}`;

    const especialidad = espList[i % espList.length];
    const materias =
      competencia === 'Técnica'
        ? [especialidad, 'Proyecto Formativo', 'Calidad y Normatividad']
        : competencia === 'Transversal'
          ? [especialidad, 'Competencias Ciudadanas']
          : ['Inglés Técnico B1', 'Comprensión Lectora en Inglés'];

    const emailPrefix = nombreCompleto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    const email = `${emailPrefix}@sena.edu.co`;

    instructores.push({
      id: `inst-${i + 1}`,
      nombre: nombreCompleto,
      documento: `${1017200000 + i * 137}`,
      tipo: esPlanta ? 'Planta' : 'Contrato',
      competencia,
      especialidad,
      materias,
      email,
      jornadaPreferida: jornadas[i % 3],
      sedeBase: SEDES[i % SEDES.length],
      horasSemanalesMax: esPlanta ? 32 : 40,
      horasDiariasMax: esPlanta ? 6 : 10,
    });
  }

  return instructores;
}

// Generar exactamente 112 fichas
export function generarFichas(): Ficha[] {
  const fichas: Ficha[] = [];
  const jornadas: Jornada[] = ['Mañana', 'Tarde', 'Noche'];

  for (let i = 0; i < 112; i++) {
    const nivel: NivelPrograma = i % 2 === 0 ? 'Tecnólogo' : 'Técnico';
    const jornada = jornadas[i % 3];
    const sede: Sede = SEDES[i % SEDES.length];
    const esNueva = i >= 86; // 86 continúan, 26 nuevas en el trimestre
    const totalLectiva = nivel === 'Técnico' ? 3 : 7;
    const trimestreActual = esNueva ? 1 : (i % (totalLectiva - 1)) + 2;
    const progList = nivel === 'Técnico' ? PROGRAMAS_TECNICO : PROGRAMAS_TECNOLOGO;

    fichas.push({
      id: `ficha-${i + 1}`,
      codigo: `${2890100 + i * 17}`,
      programa: progList[i % progList.length],
      nivel,
      jornada,
      sede,
      estado: esNueva ? 'Nueva' : 'Continúa',
      trimestreActual,
      totalTrimestresLectiva: totalLectiva,
      totalTrimestresPractica: 2,
      horasSemanalesMeta: jornada === 'Noche' ? 28 : 30,
      aprendices: 24 + (i % 10),
    });
  }

  return fichas;
}

// Generar programación inicial realista con algunos conflictos intencionales para demostrar detección
export function generarBloquesIniciales(
  instructores: Instructor[],
  fichas: Ficha[],
  trimestre = '2026-T4'
): BloqueHorario[] {
  const bloques: BloqueHorario[] = [];
  let counter = 1;

  // Programar las primeras 18 fichas de forma completa/parcial para tener datos ricos
  const fichasMuestra = fichas.slice(0, 18);
  const tecnicos = instructores.filter((i) => i.competencia === 'Técnica');
  const transversales = instructores.filter((i) => i.competencia === 'Transversal');
  const bilinguismo = instructores.filter((i) => i.competencia === 'Bilingüismo');

  fichasMuestra.forEach((ficha, idx) => {
    const t1 = tecnicos[(idx * 3) % tecnicos.length];
    const t2 = tecnicos[(idx * 3 + 1) % tecnicos.length];
    const t3 = tecnicos[(idx * 3 + 2) % tecnicos.length];
    const tr1 = transversales[(idx * 2) % transversales.length];
    const tr2 = transversales[(idx * 2 + 1) % transversales.length];
    const bil = bilinguismo[idx % bilinguismo.length];

    const ambList = AMBIENTES_POR_SEDE[ficha.sede];
    const amb1 = ambList[0];
    const amb2 = ambList[1 % ambList.length];
    const amb3 = ambList[2 % ambList.length];

    if (ficha.jornada === 'Mañana') {
      bloques.push(
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t1.id, dia: 'Lunes', jornada: 'Mañana', franja: '06:00 - 12:00', horas: 6, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t2.id, dia: 'Martes', jornada: 'Mañana', franja: '06:00 - 12:00', horas: 6, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t2.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t3.id, dia: 'Miércoles', jornada: 'Mañana', franja: '06:00 - 12:00', horas: 6, sede: ficha.sede, ambiente: amb2, competencia: 'Técnica', materia: t3.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr1.id, dia: 'Jueves', jornada: 'Mañana', franja: '06:00 - 09:00', horas: 3, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr2.id, dia: 'Jueves', jornada: 'Mañana', franja: '09:00 - 12:00', horas: 3, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr2.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: bil.id, dia: 'Viernes', jornada: 'Mañana', franja: '06:00 - 12:00', horas: 6, sede: ficha.sede, ambiente: amb2, competencia: 'Bilingüismo', materia: bil.materias[0], trimestre }
      );
    } else if (ficha.jornada === 'Tarde') {
      bloques.push(
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t1.id, dia: 'Lunes', jornada: 'Tarde', franja: '12:00 - 18:00', horas: 6, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t2.id, dia: 'Martes', jornada: 'Tarde', franja: '12:00 - 18:00', horas: 6, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t2.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t3.id, dia: 'Miércoles', jornada: 'Tarde', franja: '12:00 - 18:00', horas: 6, sede: ficha.sede, ambiente: amb2, competencia: 'Técnica', materia: t3.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr1.id, dia: 'Jueves', jornada: 'Tarde', franja: '12:00 - 15:00', horas: 3, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr2.id, dia: 'Jueves', jornada: 'Tarde', franja: '15:00 - 18:00', horas: 3, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr2.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: bil.id, dia: 'Viernes', jornada: 'Tarde', franja: '12:00 - 18:00', horas: 6, sede: ficha.sede, ambiente: amb2, competencia: 'Bilingüismo', materia: bil.materias[0], trimestre }
      );
    } else {
      bloques.push(
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t1.id, dia: 'Lunes', jornada: 'Noche', franja: '18:00 - 22:00', horas: 4, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t2.id, dia: 'Martes', jornada: 'Noche', franja: '18:00 - 22:00', horas: 4, sede: ficha.sede, ambiente: amb1, competencia: 'Técnica', materia: t2.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: t3.id, dia: 'Miércoles', jornada: 'Noche', franja: '18:00 - 22:00', horas: 4, sede: ficha.sede, ambiente: amb2, competencia: 'Técnica', materia: t3.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr1.id, dia: 'Jueves', jornada: 'Noche', franja: '18:00 - 22:00', horas: 4, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr1.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: bil.id, dia: 'Viernes', jornada: 'Noche', franja: '18:00 - 22:00', horas: 4, sede: ficha.sede, ambiente: amb2, competencia: 'Bilingüismo', materia: bil.materias[0], trimestre },
        { id: `b-${counter++}`, fichaId: ficha.id, instructorId: tr2.id, dia: 'Sábado', jornada: 'Noche', franja: '08:00 - 16:00', horas: 8, sede: ficha.sede, ambiente: amb3, competencia: 'Transversal', materia: tr2.materias[0], trimestre }
      );
    }
  });

  // Agregar un conflicto de ejemplo en inst-1 (Planta, máx 6h/día) para que el coordinador lo vea y pueda resolverlo
  bloques.push({
    id: `b-${counter++}`,
    fichaId: fichas[1].id,
    instructorId: 'inst-1',
    dia: 'Lunes',
    jornada: 'Tarde',
    franja: '12:00 - 15:00',
    horas: 3,
    sede: 'Bello',
    competencia: 'Técnica',
    trimestre,
  });

  return bloques;
}
