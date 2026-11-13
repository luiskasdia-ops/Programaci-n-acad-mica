import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BloqueHorario,
  DIAS_SEMANA,
  Ficha,
  Instructor,
} from '../types/scheduling';
import { analizarInstructor } from '../utils/validation';
import {
  Calendar,
  Clock,
  Building2,
  FileDown,
  Send,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { descargarPdfPorFicha } from '../utils/pdfExport';

interface InstructorPortalProps {
  instructor: Instructor;
  trimestre: string;
  fichas: Ficha[];
  instructores: Instructor[];
  bloques: BloqueHorario[];
  onExit: () => void;
}

export const InstructorPortal: React.FC<InstructorPortalProps> = ({
  instructor,
  trimestre,
  fichas,
  instructores,
  bloques,
  onExit,
}) => {
  // Vista activa dentro del portal del instructor
  const [vista, setVista] = useState<'mi-horario' | 'por-ficha'>('mi-horario');
  // Solicitud o novedad al coordinador
  const [novedadTexto, setNovedadTexto] = useState('');
  const [novedadEnviada, setNovedadEnviada] = useState(false);

  const analisis = analizarInstructor(instructor, bloques, trimestre);
  const bloquesPropios = useMemo(() => {
    return bloques
      .filter((b) => b.instructorId === instructor.id && b.trimestre === trimestre)
      .sort((a, b) => DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia));
  }, [bloques, instructor.id, trimestre]);

  const totalHoras = bloquesPropios.reduce((acc, b) => acc + b.horas, 0);

  // Fichas únicas en las que orienta
  const fichasAsignadas = useMemo(() => {
    const ids = Array.from(new Set(bloquesPropios.map((b) => b.fichaId)));
    return ids.map((id) => fichas.find((f) => f.id === id)).filter(Boolean) as Ficha[];
  }, [bloquesPropios, fichas]);

  const [selectedFichaId, setSelectedFichaId] = useState<string>('');

  const fichaSeleccionada = useMemo(() => {
    if (fichasAsignadas.length === 0) return undefined;
    return (
      fichasAsignadas.find((f) => f.id === selectedFichaId) ?? fichasAsignadas[0]
    );
  }, [fichasAsignadas, selectedFichaId]);

  const bloquesFichaSeleccionada = useMemo(() => {
    if (!fichaSeleccionada) return [];
    return bloques.filter(
      (b) => b.fichaId === fichaSeleccionada.id && b.trimestre === trimestre
    );
  }, [bloques, fichaSeleccionada, trimestre]);

  const totalHorasFicha = bloquesFichaSeleccionada.reduce((acc, b) => acc + b.horas, 0);

  const handleDescargarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.setTextColor(57, 161, 3);
    doc.text('SENA · Horario Individual del Instructor', 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Instructor (Nombres y Apellidos): ${instructor.nombre} (${instructor.tipo} · ${instructor.competencia})`,
      14,
      24
    );
    doc.text(
      `Cédula (C.C.): ${instructor.documento}   |   Trimestre: ${trimestre}   |   Sede base: ${instructor.sedeBase}`,
      14,
      30
    );
    doc.text(
      `Carga programada: ${totalHoras}h / ${instructor.horasSemanalesMax}h semanales   |   Materias: ${instructor.materias.join(', ')}`,
      14,
      36
    );

    autoTable(doc, {
      startY: 42,
      head: [
        [
          'Día',
          'Jornada',
          'Franja',
          'Horas',
          'Ficha',
          'Programa Formativo',
          'Sede',
          'Ambiente',
          'Materia Orientada',
        ],
      ],
      body: bloquesPropios.map((b) => {
        const f = fichas.find((x) => x.id === b.fichaId);
        return [
          b.dia,
          b.jornada,
          b.franja,
          `${b.horas}h`,
          f?.codigo ?? '-',
          f?.programa ?? '-',
          b.sede,
          b.ambiente ?? '-',
          b.materia ?? b.competencia,
        ];
      }),
      headStyles: { fillColor: [57, 161, 3], textColor: 255 },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
    });

    doc.save(`Horario_${instructor.nombre.replace(/\s+/g, '_')}_${trimestre}.pdf`);
  };

  const handleEnviarNovedad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novedadTexto.trim()) return;
    const asunto = encodeURIComponent(
      `Novedad de Programación - Instructor ${instructor.nombre} (${trimestre})`
    );
    const cuerpo = encodeURIComponent(
      `Cordial saludo Coordinación Académica,\n\nEl instructor ${instructor.nombre} (Documento: ${instructor.documento}, ${instructor.tipo}) remite la siguiente observación sobre su programación de ${trimestre}:\n\n"${novedadTexto.trim()}"\n\nAtentamente,\n${instructor.nombre}`
    );
    window.location.href = `mailto:luiskasdia@gmail.com?subject=${asunto}&body=${cuerpo}`;
    setNovedadEnviada(true);
    setNovedadTexto('');
  };

  return (
    <div className="space-y-6">
      {/* Barra de identificación del instructor */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
              Instructor {instructor.tipo}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-600 font-medium">{instructor.competencia}</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-600 font-mono">C.C. {instructor.documento}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mt-1">{instructor.nombre}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Especialidad: <strong>{instructor.especialidad}</strong> · Sede Base:{' '}
            <strong>{instructor.sedeBase}</strong> · Jornada preferida:{' '}
            <strong>{instructor.jornadaPreferida}</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Materias que orienta: {instructor.materias.join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sesión Personal Activa
            </span>
            <span className="text-[11px] text-slate-500">
              Acceso privado y confidencial
            </span>
          </div>

          <button
            onClick={onExit}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors shadow-xs"
            title="Cerrar sesión de consulta y volver al inicio"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Nota informativa de confidencialidad */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>Horario Individual Privado:</strong> Estás consultando exclusivamente tu programación académica asignada para el trimestre <strong>{trimestre}</strong>. De acuerdo con las políticas de privacidad y control institucional del SENA, cada instructor visualiza únicamente su agenda propia. Para solicitar modificaciones de franjas, días o sedes, utiliza la sección de novedades dirigida a la <strong>Coordinación Académica</strong> en la parte inferior.
        </div>
      </div>

      {/* Tarjetas de Métricas de Horas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Carga Semanal</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalHoras}h / {instructor.horasSemanalesMax}h
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full ${
                totalHoras > instructor.horasSemanalesMax
                  ? 'bg-red-500'
                  : totalHoras === instructor.horasSemanalesMax
                    ? 'bg-emerald-600'
                    : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (totalHoras / instructor.horasSemanalesMax) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {instructor.tipo === 'Planta'
              ? 'Tope legal: 32h directas de formación'
              : 'Tope contractual: 40h semanales'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Máximo Diario</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {instructor.horasDiariasMax}h máx / día
          </div>
          <span className="text-xs text-slate-600 block mt-2">
            {instructor.tipo === 'Planta'
              ? 'Límite de 6 horas diarias'
              : 'Límite de 10 horas diarias'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Protege contra jornadas excesivas
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Fichas Asignadas</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {fichasAsignadas.length} Fichas
          </div>
          <span className="text-xs text-slate-600 block mt-2">
            Grupos con formación programada
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Trimestre lectivo: {trimestre}
          </span>
        </div>
      </div>

      {/* Alertas del horario si existen */}
      {analisis.conflictos.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Observaciones detectadas en tu agenda:
          </div>
          {analisis.conflictos.map((c, i) => (
            <p
              key={i}
              className={`text-xs ${
                c.severidad === 'error' ? 'text-red-700 font-semibold' : 'text-amber-800'
              }`}
            >
              • {c.mensaje}
            </p>
          ))}
        </div>
      )}

      {/* Selector de vista del Instructor: Mi Horario vs Por Ficha */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm inline-flex items-center gap-1">
        <button
          onClick={() => setVista('mi-horario')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            vista === 'mi-horario'
              ? 'bg-[#39A103] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Mi Horario
        </button>
        <button
          onClick={() => setVista('por-ficha')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            vista === 'por-ficha'
              ? 'bg-[#39A103] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Por Ficha ({fichasAsignadas.length})
        </button>
      </div>

      {vista === 'mi-horario' ? (
        <>
          {/* Grilla Semanal: Lunes a Sábado */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Mi Agenda Semanal ({trimestre})
                </h2>
                <p className="text-xs text-slate-500">
                  Distribución de clases asignadas por día, jornada, sede y ambiente físico
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDescargarPDF}
                  disabled={bloquesPropios.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg shadow-sm transition-colors disabled:opacity-40"
                >
                  <FileDown className="w-4 h-4" />
                  Descargar Horario PDF
                </button>
              </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DIAS_SEMANA.map((dia) => {
            const delDia = bloquesPropios.filter((b) => b.dia === dia);
            const horasDia = delDia.reduce((acc, b) => acc + b.horas, 0);
            return (
              <div
                key={dia}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">{dia}</span>
                    <span
                      className={`font-mono text-xs tabular-nums font-semibold ${
                        horasDia > instructor.horasDiariasMax ? 'text-red-600' : 'text-slate-600'
                      }`}
                    >
                      {horasDia}h / {instructor.horasDiariasMax}h máx
                    </span>
                  </div>

                  {delDia.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Sin sesiones programadas
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {delDia.map((b) => {
                        const f = fichas.find((x) => x.id === b.fichaId);
                        return (
                          <div
                            key={b.id}
                            className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900">
                                {b.franja}
                              </span>
                              <span className="font-mono px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {b.horas}h
                              </span>
                            </div>

                            <div className="font-semibold text-emerald-800">
                              Ficha {f?.codigo} · {f?.nivel}
                            </div>
                            <div className="text-slate-600 truncate">{f?.programa}</div>

                            <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                              <div>
                                <span className="text-slate-400 block">Sede:</span>
                                <span className="font-medium text-slate-800">{b.sede}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Ambiente:</span>
                                <span className="font-medium text-slate-800 truncate block">
                                  {b.ambiente ?? 'Por definir'}
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-500 pt-1">
                              <span className="text-slate-400">Materia: </span>
                              <span className="font-medium text-slate-700">
                                {b.materia ?? b.competencia}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
          {fichasAsignadas.length === 0 || !fichaSeleccionada ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No tienes fichas asignadas en el trimestre {trimestre}.
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                      Ficha {fichaSeleccionada.codigo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {fichaSeleccionada.nivel}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {fichaSeleccionada.jornada} · {fichaSeleccionada.sede}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Horario Por Ficha · {fichaSeleccionada.programa}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Carga total de la ficha en {trimestre}:{' '}
                    <strong className="font-mono text-slate-700">
                      {totalHorasFicha}h / {fichaSeleccionada.horasSemanalesMeta}h
                    </strong>{' '}
                    semanales · {fichaSeleccionada.aprendices} aprendices
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={fichaSeleccionada.id}
                    onChange={(e) => setSelectedFichaId(e.target.value)}
                    aria-label="Seleccionar ficha asignada"
                    className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-800"
                  >
                    {fichasAsignadas.map((f) => (
                      <option key={f.id} value={f.id}>
                        Ficha {f.codigo} · {f.programa}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      descargarPdfPorFicha(
                        fichaSeleccionada,
                        bloques,
                        instructores,
                        trimestre
                      )
                    }
                    disabled={bloquesFichaSeleccionada.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg shadow-sm transition-colors disabled:opacity-40"
                  >
                    <FileDown className="w-4 h-4" />
                    Descargar Horario PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {DIAS_SEMANA.map((dia) => {
                  const delDia = bloquesFichaSeleccionada.filter((b) => b.dia === dia);
                  const horasDia = delDia.reduce((acc, b) => acc + b.horas, 0);
                  return (
                    <div
                      key={dia}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-900">{dia}</span>
                          <span className="font-mono text-xs tabular-nums text-slate-500">
                            {horasDia}h
                          </span>
                        </div>

                        {delDia.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Sin sesiones programadas
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {delDia.map((b) => {
                              const inst = instructores.find(
                                (x) => x.id === b.instructorId
                              );
                              const esPropio = b.instructorId === instructor.id;
                              return (
                                <div
                                  key={b.id}
                                  className={`rounded-lg p-3 text-xs space-y-1 shadow-xs border ${
                                    esPropio
                                      ? 'bg-emerald-50/70 border-emerald-200'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-slate-900">
                                      {b.franja}
                                    </span>
                                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                                      {b.horas}h
                                    </span>
                                  </div>
                                  <div className="font-semibold text-slate-900 truncate">
                                    {inst?.nombre ?? 'Sin asignar'}
                                    {esPropio && (
                                      <span className="ml-1.5 text-[10px] font-semibold text-emerald-700">
                                        (Tú)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    C.C. {inst?.documento ?? '-'} · {inst?.tipo ?? '-'}
                                  </div>
                                  <div className="text-[11px] text-slate-600 truncate">
                                    {b.materia ?? b.competencia}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {b.ambiente ?? b.sede}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Acciones del Instructor: Envío de novedades a Coordinación */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Notificar novedad a Coordinación Académica
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Si detectas un cruce, incompatibilidad de sede o requieres un cambio de ambiente,
            escríbelo aquí para que el coordinador lo gestione.
          </p>

          <form onSubmit={handleEnviarNovedad} className="space-y-2">
            <textarea
              value={novedadTexto}
              onChange={(e) => {
                setNovedadTexto(e.target.value);
                setNovedadEnviada(false);
              }}
              rows={2}
              placeholder="Ej: Solicito cambio de ambiente en Torre Norte debido a necesidad de software especializado..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              required
            />
            <button
              type="submit"
              disabled={!novedadTexto.trim()}
              className="w-full px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-40"
            >
              Enviar solicitud a Coordinación
            </button>
          </form>

          {novedadEnviada && (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solicitud redactada. Se abrirá tu cliente de correo para enviar a Coordinación.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
