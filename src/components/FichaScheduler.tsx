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
} from '../types/scheduling';
import { analizarFicha, validarNuevoBloque } from '../utils/validation';
import { descargarPdfPorFicha } from '../utils/pdfExport';
import { CheckCircle2, FileDown, Plus, Search, Trash2 } from 'lucide-react';

interface FichaSchedulerProps {
  trimestre: string;
  fichas: Ficha[];
  instructores: Instructor[];
  bloques: BloqueHorario[];
  selectedFichaId: string;
  onSelectFicha: (id: string) => void;
  onAddBloque: (bloque: Omit<BloqueHorario, 'id'>) => void;
  onDeleteBloque: (id: string) => void;
}

export const FichaScheduler: React.FC<FichaSchedulerProps> = ({
  trimestre,
  fichas,
  instructores,
  bloques,
  selectedFichaId,
  onSelectFicha,
  onAddBloque,
  onDeleteBloque,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroJornada, setFiltroJornada] = useState<'Todas' | Jornada>('Todas');
  const [filtroSede, setFiltroSede] = useState<'Todas' | Sede>('Todas');

  // Formulario de asignación a ficha
  const [mostrarForm, setMostrarForm] = useState(false);
  const [instructorId, setInstructorId] = useState(instructores[0]?.id ?? '');
  const [dia, setDia] = useState<DiaSemana>('Lunes');
  const [franja, setFranja] = useState<FranjaHorario>('06:00 - 09:00');
  const [ambiente, setAmbiente] = useState<string>(AMBIENTES_POR_SEDE['Torre Norte'][0]);
  const [materia, setMateria] = useState<string>('');

  const fichasFiltradas = useMemo(() => {
    return fichas.filter((f) => {
      if (filtroJornada !== 'Todas' && f.jornada !== filtroJornada) return false;
      if (filtroSede !== 'Todas' && f.sede !== filtroSede) return false;
      if (
        busqueda &&
        !f.codigo.includes(busqueda) &&
        !f.programa.toLowerCase().includes(busqueda.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [fichas, filtroJornada, filtroSede, busqueda]);

  const fichaActual = fichas.find((f) => f.id === selectedFichaId) ?? fichas[0];
  const analisis = analizarFicha(fichaActual, bloques, trimestre);
  const bloquesFicha = bloques.filter(
    (b) => b.fichaId === fichaActual.id && b.trimestre === trimestre
  );

  const franjasFicha = FRANJAS_POR_JORNADA[fichaActual.jornada].filter((f) =>
    f.dias.includes(dia)
  );

  const handleOpenForm = () => {
    const defaultDia: DiaSemana = fichaActual.jornada === 'Noche' ? 'Lunes' : 'Lunes';
    setDia(defaultDia);
    setFranja(FRANJAS_POR_JORNADA[fichaActual.jornada][0].franja);
    setAmbiente(AMBIENTES_POR_SEDE[fichaActual.sede][0]);
    setMateria(instructorSeleccionado.materias[0]);
    setMostrarForm(true);
  };

  const handleDiaChange = (nuevoDia: DiaSemana) => {
    setDia(nuevoDia);
    if (fichaActual.jornada === 'Noche' && nuevoDia === 'Sábado') {
      setFranja('08:00 - 16:00');
    } else if (fichaActual.jornada === 'Noche') {
      setFranja('18:00 - 22:00');
    }
  };

  const instructorSeleccionado =
    instructores.find((i) => i.id === instructorId) ?? instructores[0];
  const franjaObj = FRANJAS_POR_JORNADA[fichaActual.jornada].find(
    (f) => f.franja === franja
  );

  const nuevoBloquePreview: Omit<BloqueHorario, 'id'> = {
    fichaId: fichaActual.id,
    instructorId: instructorSeleccionado.id,
    dia,
    jornada: fichaActual.jornada,
    franja,
    horas: franjaObj?.horas ?? 3,
    sede: fichaActual.sede,
    ambiente,
    competencia: instructorSeleccionado.competencia,
    materia: materia || instructorSeleccionado.materias[0],
    trimestre,
  };

  const conflictosPreview = mostrarForm
    ? validarNuevoBloque(nuevoBloquePreview, bloques, instructorSeleccionado, fichaActual)
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
      {/* Sidebar: 112 Fichas */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Fichas ({fichasFiltradas.length})
          </h3>
          <p className="text-xs text-slate-500">
            Mañana/Tarde: 30h · Noche/Sáb: 28h
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar código o programa..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['Todas', ...JORNADAS] as const).map((j) => (
            <button
              key={j}
              onClick={() => setFiltroJornada(j)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filtroJornada === j
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <select
          value={filtroSede}
          onChange={(e) => setFiltroSede(e.target.value as 'Todas' | Sede)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
        >
          <option value="Todas">Todas las sedes</option>
          {SEDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
          {fichasFiltradas.map((f) => {
            const af = analizarFicha(f, bloques, trimestre);
            const activo = f.id === fichaActual.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFicha(f.id)}
                className={`w-full text-left py-3 px-2.5 rounded-lg transition-colors ${
                  activo ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-slate-900">
                    {f.codigo}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-700">
                    {af.horasSemanales}/{f.horasSemanalesMeta}h
                  </span>
                </div>
                <div className="text-xs text-slate-700 truncate mt-0.5">{f.programa}</div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>
                    {f.jornada} · {f.sede}
                  </span>
                  <span className={af.cumpleComposicion ? 'text-emerald-700 font-medium' : ''}>
                    {af.tecnicos}T·{af.transversales}Tr·{af.bilinguismo}B
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel principal: Programación de la Ficha */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                Ficha {fichaActual.codigo} · {fichaActual.nivel} · {fichaActual.estado} ·
                Trimestre {fichaActual.trimestreActual} de {fichaActual.totalTrimestresLectiva} lectiva
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">
                {fichaActual.programa}
              </h2>
              <p className="text-sm text-slate-600">
                Jornada {fichaActual.jornada} · Sede {fichaActual.sede} · {fichaActual.aprendices} aprendices
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => descargarPdfPorFicha(fichaActual, bloques, instructores, trimestre)}
                disabled={bloquesFicha.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#39A103] hover:bg-[#2f8502] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4" />
                Descargar Horario PDF
              </button>
              <button
                onClick={handleOpenForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Programar clase
              </button>
            </div>
          </div>

          {/* Composición requerida: 3 Técnicos, 2 Transversales, 1 Bilingüismo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Horas semanales</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums">
                {analisis.horasSemanales}h / {fichaActual.horasSemanalesMeta}h
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Instructores Técnicos</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums inline-flex items-center gap-1.5">
                {analisis.tecnicos} / 3
                {analisis.tecnicos >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Transversales</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums inline-flex items-center gap-1.5">
                {analisis.transversales} / 2
                {analisis.transversales >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Bilingüismo</span>
              <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums inline-flex items-center gap-1.5">
                {analisis.bilinguismo} / 1
                {analisis.bilinguismo >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de asignación */}
        {mostrarForm && (
          <form
            onSubmit={handleGuardar}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Programar instructor en Ficha {fichaActual.codigo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Instructor</label>
                <select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {instructores.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} · C.C. {i.documento} ({i.competencia} · {i.tipo})
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
                  {DIAS_SEMANA.filter((d) =>
                    fichaActual.jornada === 'Noche' ? true : d !== 'Sábado'
                  ).map((d) => (
                    <option key={d} value={d}>
                      {d}
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
                  {franjasFicha.map((f) => (
                    <option key={f.franja} value={f.franja}>
                      {f.franja} ({f.horas}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Ambiente ({fichaActual.sede})
                </label>
                <select
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {AMBIENTES_POR_SEDE[fichaActual.sede].map((amb) => (
                    <option key={amb} value={amb}>
                      {amb}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">
                  Competencia / Materia que orienta
                </label>
                <select
                  value={materia || instructorSeleccionado.materias[0]}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {instructorSeleccionado.materias.map((m) => (
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
                Guardar clase
              </button>
            </div>
          </form>
        )}

        {/* Grilla semanal de la Ficha */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Horario Semanal de la Ficha ({trimestre})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DIAS_SEMANA.filter((d) =>
              fichaActual.jornada === 'Noche' ? true : d !== 'Sábado'
            ).map((d) => {
              const delDia = bloquesFicha.filter((b) => b.dia === d);
              return (
                <div
                  key={d}
                  className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-900">{d}</span>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {delDia.reduce((acc, b) => acc + b.horas, 0)}h
                    </span>
                  </div>

                  {delDia.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Sin programar</p>
                  ) : (
                    <div className="space-y-2">
                      {delDia.map((b) => {
                        const inst = instructores.find((x) => x.id === b.instructorId);
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
                                title="Eliminar clase"
                                className="text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="font-medium text-emerald-800 truncate">
                              {inst?.nombre}
                            </div>
                            {inst?.documento && (
                              <div className="text-[11px] font-mono text-slate-500">
                                C.C. {inst.documento}
                              </div>
                            )}
                            {b.ambiente && (
                              <div className="text-slate-600 truncate">{b.ambiente}</div>
                            )}
                            <div className="text-slate-500 truncate">
                              {b.materia ? `${b.materia} · ` : ''}{b.competencia}
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
