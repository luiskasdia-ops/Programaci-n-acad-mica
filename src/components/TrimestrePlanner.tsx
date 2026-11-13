import React from 'react';
import {
  BloqueHorario,
  Ficha,
  Instructor,
  JORNADAS,
  SEDES,
} from '../types/scheduling';
import { analizarFicha, analizarInstructor } from '../utils/validation';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface TrimestrePlannerProps {
  trimestre: string;
  instructores: Instructor[];
  fichas: Ficha[];
  bloques: BloqueHorario[];
  onSelectInstructor: (instructorId: string) => void;
  onSelectFicha: (fichaId: string) => void;
  onNavigateToPdf?: (instructorId?: string) => void;
}

export const TrimestrePlanner: React.FC<TrimestrePlannerProps> = ({
  trimestre,
  instructores,
  fichas,
  bloques,
  onSelectInstructor,
  onSelectFicha,
  onNavigateToPdf,
}) => {
  const [instructorSeleccionadoId, setInstructorSeleccionadoId] = React.useState<string>(
    instructores[0]?.id ?? ''
  );
  const instructorParaEnvio =
    instructores.find((i) => i.id === instructorSeleccionadoId) ?? instructores[0];

  const fichasContinuan = fichas.filter((f) => f.estado === 'Continúa');
  const fichasNuevas = fichas.filter((f) => f.estado === 'Nueva');
  const planta = instructores.filter((i) => i.tipo === 'Planta');
  const contrato = instructores.filter((i) => i.tipo === 'Contrato');

  const analisisInstructores = instructores.map((inst) => ({
    inst,
    ...analizarInstructor(inst, bloques, trimestre),
  }));

  const instructoresConConflicto = analisisInstructores.filter(
    (a) => a.tieneErrores || a.tieneAlertas
  );

  const fichasCompletas = fichas.filter((f) => {
    const a = analizarFicha(f, bloques, trimestre);
    return a.cumpleHoras && a.cumpleComposicion;
  });

  const capacidadTotalHoras =
    planta.length * 32 + contrato.length * 40;
  const horasProgramadas = bloques
    .filter((b) => b.trimestre === trimestre)
    .reduce((acc, b) => acc + b.horas, 0);

  return (
    <div className="space-y-8">
      {/* Encabezado de flujo */}
      <div className="bg-white text-black rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-700 tracking-wide">
            Planificación Trimestral · {trimestre}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 mt-1">
            Balance de Fichas, Instructores y Sedes
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Consolidado operativo para determinar la continuidad de grupos, la
            capacidad de planta y contrato, y la cobertura semanal por jornada.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Capacidad semanal</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {horasProgramadas}h / {capacidadTotalHoras}h
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block text-xs">Fichas completas</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {fichasCompletas.length} / {fichas.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pasos del Flujo de Trabajo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paso 1: Fichas */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              01. Demanda de Grupos
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {fichas.length} fichas
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {fichasContinuan.length} continúan · {fichasNuevas.length} nuevas en {trimestre}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Técnicos (9m lectiva / 6m práctica)</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {fichas.filter((f) => f.nivel === 'Técnico').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tecnólogos (21m lectiva / 6m práctica)</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {fichas.filter((f) => f.nivel === 'Tecnólogo').length}
              </span>
            </div>
          </div>
        </div>

        {/* Paso 2: Instructores */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              02. Planta Docente Disponible
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {instructores.length} instructores
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {planta.length} de Planta (32h/sem) · {contrato.length} de Contrato (40h/sem)
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Competencias Técnicas</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {instructores.filter((i) => i.competencia === 'Técnica').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Transversales / Bilingüismo</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {instructores.filter((i) => i.competencia === 'Transversal').length} /{' '}
                {instructores.filter((i) => i.competencia === 'Bilingüismo').length}
              </span>
            </div>
          </div>
        </div>

        {/* Paso 3: Regla por Ficha */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              03. Composición por Ficha
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              3 + 2 + 1
            </div>
            <p className="text-xs text-slate-500 mt-1">
              3 Técnicos · 2 Transversales · 1 Bilingüismo por ficha
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Mañana y Tarde (Lun–Vie)</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                30h / semana
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Noche (Lun–Vie) + Sábado</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                28h / semana
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Jornada y Sede */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Disponibilidad por Jornada
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 font-medium">Jornada</th>
                  <th className="py-2 font-medium">Horario</th>
                  <th className="py-2 font-medium text-right">Fichas</th>
                  <th className="py-2 font-medium text-right">Instructores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {JORNADAS.map((j) => {
                  const countF = fichas.filter((f) => f.jornada === j).length;
                  const countI = instructores.filter((i) => i.jornadaPreferida === j).length;
                  const horario =
                    j === 'Mañana'
                      ? '6:00 am – 12:00 m'
                      : j === 'Tarde'
                        ? '12:00 m – 6:00 pm'
                        : '6:00 pm – 10:00 pm + Sáb';
                  return (
                    <tr key={j}>
                      <td className="py-3 font-medium text-slate-900">{j}</td>
                      <td className="py-3 text-slate-600 text-xs">{horario}</td>
                      <td className="py-3 text-right font-mono tabular-nums text-slate-900">
                        {countF}
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums text-slate-900">
                        {countI}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Distribución por Sede
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 font-medium">Sede</th>
                  <th className="py-2 font-medium text-right">Fichas</th>
                  <th className="py-2 font-medium text-right">Instructores Base</th>
                  <th className="py-2 font-medium text-right">Bloques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SEDES.map((sede) => {
                  const countF = fichas.filter((f) => f.sede === sede).length;
                  const countI = instructores.filter((i) => i.sedeBase === sede).length;
                  const countB = bloques.filter(
                    (b) => b.sede === sede && b.trimestre === trimestre
                  ).length;
                  return (
                    <tr key={sede}>
                      <td className="py-2.5 font-medium text-slate-900">{sede}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                        {countF}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                        {countI}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-900">
                        {countB}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alertas y Conflictos Detectados */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Conflictos de Horario y Desplazamientos ({instructoresConConflicto.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Haz clic en un instructor para resolver en su agenda
          </span>
        </div>

        {instructoresConConflicto.length === 0 ? (
          <p className="text-sm text-slate-600 py-4">
            No se detectaron cruces de horario, excesos de jornada ni desplazamientos entre sedes en {trimestre}.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {instructoresConConflicto.map(({ inst, conflictos, horasSemanales }) => (
              <div
                key={inst.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <span>{inst.nombre}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500">C.C. {inst.documento}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-600">
                      {inst.tipo} ({horasSemanales}h/{inst.horasSemanalesMax}h)
                    </span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {conflictos.map((c, idx) => (
                      <li
                        key={idx}
                        className={`text-xs ${
                          c.severidad === 'error' ? 'text-red-600' : 'text-amber-700'
                        }`}
                      >
                        {c.mensaje}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => onSelectInstructor(inst.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-center"
                >
                  Revisar agenda
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Envío Oficial de Horarios en PDF desde luiskasdia@gmail.com */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Envío Oficial de Horarios en PDF desde luiskasdia@gmail.com
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Coordinador Académico
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Remite la programación horizontal oficial en PDF generada a los correos de los instructores directamente desde la cuenta oficial de Coordinación (<strong className="font-mono text-emerald-800">luiskasdia@gmail.com</strong>).
              </p>
            </div>
          </div>

          {onNavigateToPdf && (
            <button
              onClick={() => onNavigateToPdf(instructorSeleccionadoId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-xs"
            >
              <span>Abrir Módulo de Envíos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Pasos Clave del Envío */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-mono font-bold">1</span>
              <span>1. Elige al Instructor</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Selecciona a cualquiera de los 111 instructores. Su correo institucional (<code className="text-emerald-800 font-mono">@sena.edu.co</code>) se carga de inmediato.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-mono font-bold">2</span>
              <span>2. Generar y Descargar PDF</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              El sistema compila la matriz de horarios horizontal A4 con asignación de fichas, sedes y ambientes asignados.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-mono font-bold">3</span>
              <span>3. Despachar en Gmail</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Se abre Gmail desde <strong className="font-mono text-emerald-800">luiskasdia@gmail.com</strong> con asunto y cuerpo listos; adjuntas el PDF y envías.
            </p>
          </div>
        </div>

        {/* Selector Rápido de Instructor */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="block text-xs font-bold text-emerald-950">
              Acceso directo: Selecciona un instructor para preparar su envío:
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={instructorSeleccionadoId}
                onChange={(e) => setInstructorSeleccionadoId(e.target.value)}
                className="w-full sm:max-w-md px-3 py-2 text-xs border border-emerald-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 font-medium"
              >
                {instructores.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre} · C.C. {inst.documento} ({inst.tipo} · {inst.email})
                  </option>
                ))}
              </select>
              {instructorParaEnvio && (
                <span className="text-[11px] font-mono text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300/60 inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-700" />
                  {instructorParaEnvio.email}
                </span>
              )}
            </div>
          </div>

          {onNavigateToPdf && (
            <button
              onClick={() => onNavigateToPdf(instructorSeleccionadoId)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg shadow-sm transition-colors whitespace-nowrap self-stretch sm:self-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preparar Envío de Horario</span>
            </button>
          )}
        </div>
      </div>

      {/* Acceso rápido a fichas pendientes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Fichas Nuevas y en Continuidad (Muestra rápida)
          </h3>
          <span className="text-xs text-slate-500">
            Selecciona una ficha para programar sus 3 técnicos, 2 transversales y 1 bilingüismo
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fichas.slice(0, 6).map((f) => {
            const af = analizarFicha(f, bloques, trimestre);
            return (
              <button
                key={f.id}
                onClick={() => onSelectFicha(f.id)}
                className="text-left p-4 border border-slate-200 hover:border-emerald-500 rounded-lg transition-colors bg-slate-50/50 hover:bg-white"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-medium text-slate-900">
                    Ficha {f.codigo}
                  </span>
                  <span>
                    {f.estado} · {f.jornada}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-900 mt-1 truncate">
                  {f.programa}
                </div>
                <div className="text-xs text-slate-600 mt-2 flex items-center justify-between">
                  <span>{f.sede}</span>
                  <span className="font-mono tabular-nums">
                    {af.horasSemanales}h / {f.horasSemanalesMeta}h
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
