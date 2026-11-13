export type TipoContrato = 'Planta' | 'Contrato';

export type Jornada = 'Mañana' | 'Tarde' | 'Noche';

export type Sede =
  | 'Torre Norte'
  | 'IUSH'
  | 'Bello'
  | 'Copacabana'
  | 'Zamora'
  | 'San Javier';

export type TipoCompetencia = 'Técnica' | 'Transversal' | 'Bilingüismo';

export type NivelPrograma = 'Técnico' | 'Tecnólogo';

export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado';

export type FranjaHorario =
  | '06:00 - 09:00'
  | '09:00 - 12:00'
  | '06:00 - 12:00'
  | '12:00 - 15:00'
  | '15:00 - 18:00'
  | '12:00 - 18:00'
  | '18:00 - 22:00'
  | '08:00 - 16:00';

export interface Instructor {
  id: string;
  nombre: string;
  documento: string;
  tipo: TipoContrato;
  competencia: TipoCompetencia;
  especialidad: string;
  materias: string[];
  jornadaPreferida: Jornada;
  sedeBase: Sede;
  email: string;
  horasSemanalesMax: number; // 32 Planta, 40 Contrato
  horasDiariasMax: number; // 6 Planta, 10 Contrato
}

export interface Ficha {
  id: string;
  codigo: string;
  programa: string;
  nivel: NivelPrograma;
  jornada: Jornada;
  sede: Sede;
  estado: 'Continúa' | 'Nueva';
  trimestreActual: number;
  totalTrimestresLectiva: number; // 3 para Técnico (9m), 7 para Tecnólogo (21m)
  totalTrimestresPractica: number; // 2 (6m)
  horasSemanalesMeta: number; // 30 Mañana/Tarde, 28 Noche
  aprendices: number;
}

export interface BloqueHorario {
  id: string;
  fichaId: string;
  instructorId: string;
  dia: DiaSemana;
  jornada: Jornada;
  franja: FranjaHorario;
  horas: number;
  sede: Sede;
  ambiente?: string;
  competencia: TipoCompetencia;
  materia?: string;
  trimestre: string; // e.g., "2026-T4"
}

export const AMBIENTES_POR_SEDE: Record<Sede, string[]> = {
  'Torre Norte': [
    'Sala Sistemas 101',
    'Sala Sistemas 102',
    'Lab. Redes 201',
    'Ambiente Gestión 301',
    'Aula Bilingüismo 302',
  ],
  IUSH: [
    'Bloque A - Aula 104',
    'Bloque A - Lab. Software 202',
    'Bloque B - Aula 301',
    'Bloque B - Bilingüismo 305',
  ],
  Bello: [
    'Ambiente 101 - Industrial',
    'Ambiente 102 - Sistemas',
    'Taller Automatización 201',
    'Aula Transversal 204',
  ],
  Copacabana: [
    'Ambiente 101 - Logística',
    'Sala Cómputo 102',
    'Aula Múltiple 201',
  ],
  Zamora: [
    'Ambiente 101 - Contabilidad',
    'Sala Sistemas 103',
    'Aula Bilingüismo 202',
  ],
  'San Javier': [
    'Ambiente 101 - Multimedia',
    'Sala Diseño 102',
    'Aula Transversal 201',
  ],
};

export const SEDES: Sede[] = [
  'Torre Norte',
  'IUSH',
  'Bello',
  'Copacabana',
  'Zamora',
  'San Javier',
];

export const DIAS_SEMANA: DiaSemana[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const JORNADAS: Jornada[] = ['Mañana', 'Tarde', 'Noche'];

export const FRANJAS_POR_JORNADA: Record<
  Jornada,
  { franja: FranjaHorario; horas: number; dias: DiaSemana[] }[]
> = {
  Mañana: [
    { franja: '06:00 - 09:00', horas: 3, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    { franja: '09:00 - 12:00', horas: 3, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    { franja: '06:00 - 12:00', horas: 6, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
  ],
  Tarde: [
    { franja: '12:00 - 15:00', horas: 3, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    { franja: '15:00 - 18:00', horas: 3, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    { franja: '12:00 - 18:00', horas: 6, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
  ],
  Noche: [
    { franja: '18:00 - 22:00', horas: 4, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    { franja: '08:00 - 16:00', horas: 8, dias: ['Sábado'] },
  ],
};
