import React, { useMemo, useState } from 'react';
import {
  AMBIENTES_POR_SEDE,
  BloqueHorario,
  DIAS_SEMANA,
  DiaSemana,
  FRANJAS_POR_JORNADA,
  Ficha,
  FranjaHorario,
  Instructor,
  JORNADAS,
  Jornada,
  SEDES,
  Sede,
  TipoCompetencia,
  TipoContrato,
} from '../types/scheduling';
import { analizarInstructor, validarNuevoBloque } from '../utils/validation';
import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-react';

interface InstructorSchedulerProps {
  trimestre: string;
  instructores: Instructor[];
  fichas: Ficha[];
  bloques: BloqueHorario[];
  selectedInstructorId: string;
  onSelectInstructor: (id: string) => void;
  onAddBloque: (bloque: Omit<BloqueHorario, 'id'>) => void;
  onDeleteBloque: (id: string) => void;
}

export const InstructorScheduler: React.FC<InstructorSchedulerProps> = ({
  trimestre,
  instructores,
  fichas,
  bloques,
  selectedInstructorId,
  onSelectInstructor,
  onAddBloque,
  onDeleteBloque,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | TipoContrato>('Todos');
  const [filtroComp, setFiltroComp] = useState<'Todas' | TipoCompetencia>('Todas');
  const [soloConflictos, setSoloConflictos] = useState(false);

  // Formulario de nueva asignación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [fichaId, setFichaId] = useState(fichas[0]?.id ?? '');
  const [dia, setDia] = useState<DiaSemana>('Lunes');
  const [jornada, setJornada] = useState<Jornada>('Mañana');
  const [franja, setFranja] = useState<FranjaHorario>('06:00 - 09:00');
  const [sede, setSede] = useState<Sede>('Torre Norte');
  const [ambiente, setAmbiente] = useState<string>(AMBIENTES_POR_SEDE['Torre Norte'][0]);
  const [materia, setMateria] = useState<string>('');

  const instructoresFiltrados = useMemo(() => {
    return instructores.filter((inst) => {
      if (filtroTipo !== 'Todos' && inst.tipo !== filtroTipo) return false;
      if (filtroComp !== 'Todas' && inst.competencia !== filtroComp) return false;
      if (
        busqueda &&
        !inst.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        !inst.documento.includes(busqueda.trim()) &&
        !inst.especialidad.toLowerCase().includes(busqueda.toLowerCase())
      ) {
        return false;
      }
      if (soloConflictos) {
        const a = analizarInstructor(inst, bloques, trimestre);
        if (!a.tieneErrores && !a.tieneAlertas) return false;
      }
      return true;
    });
  }, [instructores, filtroTipo, filtroComp, busqueda, soloConflictos, bloques, trimestre]);

  const instructorActual =
    instructores.find((i) => i.id === selectedInstructorId) ?? instructores[0];

  const analisis = analizarInstructor(instructorActual, bloques, trimestre);
  const bloquesInstructor = bloques.filter(
    (b) => b.instructorId === instructorActual.id && b.trimestre === trimestre
  );

  const franjasDisponibles = FRANJAS_POR_JORNADA[jornada].filter((f) =>
    f.dias.includes(dia)
  );

  const handleJornadaChange = (nuevaJornada: Jornada) => {
    setJornada(nuevaJornada);
    const opciones = FRANJAS_POR_JORNADA[nuevaJornada];
    if (nuevaJornada === 'Noche' && dia === 'Sábado') {
      setFranja('08:00 - 16:00');
    } else {
      if (dia === 'Sábado' && nuevaJornada !== 'Noche') {
        setDia('Lunes');
      }
      setFranja(opciones[0].franja);
    }
  };

  const handleDiaChange = (nuevoDia: DiaSemana) => {
    setDia(nuevoDia);
    if (nuevoDia === 'Sábado') {
      setJornada('Noche');
      setFranja('08:00 - 16:00');
    } else if (jornada === 'Noche') {
      setFranja('18:00 - 22:00');
    }
  };

  const franjaObj = FRANJAS_POR_JORNADA[jornada].find((f) => f.franja === franja);
  const horasNuevo = franjaObj?.horas ?? 3;
  const fichaSeleccionada = fichas.find((f) => f.id === fichaId) ?? fichas[0];

  const nuevoBloquePreview: Omit<BloqueHorario, 'id'> = {
    fichaId: fichaSeleccionada.id,
    instructorId: instructorActual.id,
    dia,
    jornada,
    franja,
    horas: horasNuevo,
    sede,
    ambiente,
    competencia: instructorActual.competencia,
    materia: materia || instructorActual.materias[0],
    trimestre,
  };

  const conflictosPreview = mostrarForm
    ? validarNuevoBloque(nuevoBloquePreview, bloques, instructorActual, fichaSeleccionada)
    : [];
  const tieneErrorBloqueante = conflictosPreview.some((c) => c.severidad === 'error');

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (tieneErrorBloqueante) return;
    onAddBloque(nuevoBloquePreview);
    setMostrarForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar: Lista de 84 instructores */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Instructores ({instructoresFiltrados.length})
          </h3>
          <p className="text-xs text-slate-500">
            30 Planta (32h/sem) · 81 Contrato (40h/sem)
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido, cédula o especialidad..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['Todos', 'Planta', 'Contrato'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filtroTipo === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setSoloConflictos(!soloConflictos)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              soloConflictos
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Con alertas
          </button>
        </div>

        <div className="flex gap-1.5">
          {(['Todas', 'Técnica', 'Transversal', 'Bilingüismo'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFiltroComp(c)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filtroComp === c
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto pr-1">
          {instructoresFiltrados.map((inst) => {
            const a = analizarInstructor(inst, bloques, trimestre);
            const activo = inst.id === instructorActual.id;
            return (
              <button
                key={inst.id}
                onClick={() => onSelectInstructor(inst.id)}
                className={`w-full text-left py-3 px-2.5 rounded-lg transition-colors ${
                  activo ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {inst.nombre}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-700">
                    {a.horasSemanales}/{inst.horasSemanalesMax}h
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>
                    C.C. {inst.documento} · {inst.tipo} · {inst.competencia}
                  </span>
                  {(a.tieneErrores || a.tieneAlertas) && (
                    <span
                      className={
                        a.tieneErrores ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'
                      }
                    >
                      {a.tieneErrores ? 'Conflicto' : 'Desplazamiento'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel principal: Agenda del Instructor */}
      <div className="lg:col-span-8 space-y-6">
        {/* Cabecera del Instructor */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                C.C. {instructorActual.documento} · {instructorActual.tipo} · {instructorActual.competencia} · Sede base:{' '}
                {instructorActual.sedeBase}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">
                {instructorActual.nombre}
              </h2>
              <p className="text-sm text-slate-600">{instructorActual.especialidad}</p>
              <p className="text-xs text-slate-500 mt-1">
                Materias que orienta: {instructorActual.materias.join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors self-start"
            >
              <Plus className="w-4 h-4" />
              Asignar bloque
            </button>
          </div>

          {/* Métricas de carga */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Carga semanal</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums">
                {analisis.horasSemanales}h / {instructorActual.horasSemanalesMax}h
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Máximo diario</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums">
                {instructorActual.horasDiariasMax}h / día
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Jornada preferida</span>
              <span className="text-lg font-semibold text-slate-900">
                {instructorActual.jornadaPreferida}
              </span>
            </div>
          </div>

          {/* Alertas activas */}
          {analisis.conflictos.length > 0 && (
            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alertas detectadas en la agenda
              </div>
              {analisis.conflictos.map((c, i) => (
                <p
                  key={i}
                  className={`text-xs ${
                    c.severidad === 'error' ? 'text-red-700 font-medium' : 'text-amber-800'
                  }`}
                >
                  {c.mensaje}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de asignación */}
        {mostrarForm && (
          <form
            onSubmit={handleGuardar}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Nueva asignación para {instructorActual.nombre}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Ficha</label>
                <select
                  value={fichaId}
                  onChange={(e) => {
                    setFichaId(e.target.value);
                    const f = fichas.find((x) => x.id === e.target.value);
                    if (f) setSede(f.sede);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {fichas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codigo} · {f.programa.slice(0, 22)} ({f.jornada})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Día</label>
                <select
                  value={dia}
                  onChange={(e) => handleDiaChange(e.target.value as DiaSemana)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Jornada</label>
                <select
                  value={jornada}
                  onChange={(e) => handleJornadaChange(e.target.value as Jornada)}
                  disabled={dia === 'Sábado'}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
                >
                  {JORNADAS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Franja</label>
                <select
                  value={franja}
                  onChange={(e) => setFranja(e.target.value as FranjaHorario)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {franjasDisponibles.map((f) => (
                    <option key={f.franja} value={f.franja}>
                      {f.franja} ({f.horas}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Sede</label>
                <select
                  value={sede}
                  onChange={(e) => {
                    const nuevaSede = e.target.value as Sede;
                    setSede(nuevaSede);
                    setAmbiente(AMBIENTES_POR_SEDE[nuevaSede][0]);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {SEDES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Ambiente</label>
                <select
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {AMBIENTES_POR_SEDE[sede].map((amb) => (
                    <option key={amb} value={amb}>
                      {amb}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Competencia / Materia</label>
                <select
                  value={materia || instructorActual.materias[0]}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {instructorActual.materias.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {conflictosPreview.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                {conflictosPreview.map((c, idx) => (
                  <p
                    key={idx}
                    className={`text-xs ${
                      c.severidad === 'error' ? 'text-red-600 font-medium' : 'text-amber-700'
                    }`}
                  >
                    {c.mensaje}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={tieneErrorBloqueante}
                className="px-4 py-2 text-sm font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Guardar bloque
              </button>
            </div>
          </form>
        )}

        {/* Grilla semanal Lunes - Sábado */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Horario Semanal ({trimestre})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DIAS_SEMANA.map((d) => {
              const delDia = bloquesInstructor.filter((b) => b.dia === d);
              const horasDia = delDia.reduce((acc, b) => acc + b.horas, 0);
              const excede = horasDia > instructorActual.horasDiariasMax;
              return (
                <div
                  key={d}
                  className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-900">{d}</span>
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        excede ? 'text-red-600 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {horasDia}h / {instructorActual.horasDiariasMax}h
                    </span>
                  </div>

                  {delDia.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Sin bloques</p>
                  ) : (
                    <div className="space-y-2">
                      {delDia.map((b) => {
                        const f = fichas.find((x) => x.id === b.fichaId);
                        return (
                          <div
                            key={b.id}
                            className="bg-white border border-slate-200 rounded-md p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-medium text-slate-900">
                                {b.franja}
                              </span>
                              <button
                                onClick={() => onDeleteBloque(b.id)}
                                title="Eliminar bloque"
                                className="text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="font-medium text-emerald-800">
                              Ficha {f?.codigo} · {b.sede}
                            </div>
                            {b.ambiente && (
                              <div className="text-slate-600 truncate">{b.ambiente}</div>
                            )}
                            <div className="text-slate-500 truncate">
                              {b.materia ? `${b.materia} · ` : ''}{f?.programa}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
