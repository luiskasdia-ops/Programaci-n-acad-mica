import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BloqueHorario,
  Ficha,
  Instructor,
  Jornada,
  Sede,
  SEDES,
  JORNADAS,
  DIAS_SEMANA,
  DiaSemana,
  TipoCompetencia,
} from '../types/scheduling';
import { analizarFicha, analizarInstructor } from '../utils/validation';
import {
  BarChart3,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AcademicDashboardProps {
  trimestre: string;
  instructores: Instructor[];
  fichas: Ficha[];
  bloques: BloqueHorario[];
  onSelectInstructor: (id: string) => void;
  onSelectFicha: (id: string) => void;
  onNavigateToPlanificacion: () => void;
}

export const AcademicDashboard: React.FC<AcademicDashboardProps> = ({
  trimestre,
  instructores,
  fichas,
  bloques,
  onSelectInstructor,
  onSelectFicha,
  onNavigateToPlanificacion,
}) => {
  // Filtros interactivos del Dashboard
  const [filtroSede, setFiltroSede] = useState<string>('todas');
  const [filtroTipoContrato, setFiltroTipoContrato] = useState<string>('todos');
  const [filtroJornada, setFiltroJornada] = useState<string>('todas');
  const [tabActiva, setTabActiva] = useState<'general' | 'instructores' | 'fichas' | 'ambientes'>('general');

  // Filtrado de bloques por trimestre y filtros locales
  const bloquesTrimestre = useMemo(() => {
    return bloques.filter((b) => b.trimestre === trimestre);
  }, [bloques, trimestre]);

  const bloquesFiltrados = useMemo(() => {
    return bloquesTrimestre.filter((b) => {
      if (filtroSede !== 'todas' && b.sede !== filtroSede) return false;
      if (filtroJornada !== 'todas' && b.jornada !== filtroJornada) return false;
      if (filtroTipoContrato !== 'todos') {
        const inst = instructores.find((i) => i.id === b.instructorId);
        if (inst && inst.tipo !== filtroTipoContrato) return false;
      }
      return true;
    });
  }, [bloquesTrimestre, filtroSede, filtroJornada, filtroTipoContrato, instructores]);

  // Cálculos de instructores
  const instructoresFiltrados = useMemo(() => {
    return instructores.filter((i) => {
      if (filtroSede !== 'todas' && i.sedeBase !== filtroSede) return false;
      if (filtroTipoContrato !== 'todos' && i.tipo !== filtroTipoContrato) return false;
      if (filtroJornada !== 'todas' && i.jornadaPreferida !== filtroJornada) return false;
      return true;
    });
  }, [instructores, filtroSede, filtroTipoContrato, filtroJornada]);

  const analisisInstructores = useMemo(() => {
    return instructores.map((inst) => {
      const analisis = analizarInstructor(inst, bloquesTrimestre, trimestre);
      return {
        inst,
        ...analisis,
      };
    });
  }, [instructores, bloquesTrimestre, trimestre]);

  // Cálculos de fichas
  const analisisFichas = useMemo(() => {
    return fichas.map((f) => {
      const analisis = analizarFicha(f, bloquesTrimestre, trimestre);
      return {
        ficha: f,
        ...analisis,
      };
    });
  }, [fichas, bloquesTrimestre, trimestre]);

  // KPIs Globales
  const totalHorasProgramadas = bloquesTrimestre.reduce((acc, b) => acc + b.horas, 0);

  const planta = instructores.filter((i) => i.tipo === 'Planta');
  const contrato = instructores.filter((i) => i.tipo === 'Contrato');

  const capacidadTotalHoras = planta.length * 32 + contrato.length * 40;
  const porcentajeOcupacion = Math.round((totalHorasProgramadas / Math.max(1, capacidadTotalHoras)) * 100);

  const horasPlanta = bloquesTrimestre
    .filter((b) => {
      const inst = instructores.find((i) => i.id === b.instructorId);
      return inst?.tipo === 'Planta';
    })
    .reduce((acc, b) => acc + b.horas, 0);

  const horasContrato = bloquesTrimestre
    .filter((b) => {
      const inst = instructores.find((i) => i.id === b.instructorId);
      return inst?.tipo === 'Contrato';
    })
    .reduce((acc, b) => acc + b.horas, 0);

  const fichasCompletas = analisisFichas.filter((af) => af.cumpleHoras);
  const porcentajeFichasCompletas = Math.round((fichasCompletas.length / Math.max(1, fichas.length)) * 100);

  const totalAprendicesImpactados = useMemo(() => {
    const fichasConHoras = new Set(bloquesTrimestre.map((b) => b.fichaId));
    return fichas
      .filter((f) => fichasConHoras.has(f.id))
      .reduce((acc, f) => acc + f.aprendices, 0);
  }, [bloquesTrimestre, fichas]);

  // Conflictos globales
  const totalConflictos = useMemo(() => {
    return analisisInstructores.reduce((acc, a) => acc + a.conflictos.length, 0);
  }, [analisisInstructores]);

  // Gráfico 1: Horas por Sede
  const datosPorSede = useMemo(() => {
    return SEDES.map((sede) => {
      const horas = bloquesTrimestre
        .filter((b) => b.sede === sede)
        .reduce((acc, b) => acc + b.horas, 0);
      const fichasEnSede = new Set(
        bloquesTrimestre.filter((b) => b.sede === sede).map((b) => b.fichaId)
      ).size;
      const instructoresEnSede = new Set(
        bloquesTrimestre.filter((b) => b.sede === sede).map((b) => b.instructorId)
      ).size;
      const ambientesEnSede = new Set(
        bloquesTrimestre
          .filter((b) => b.sede === sede && b.ambiente)
          .map((b) => b.ambiente)
      ).size;

      return {
        sede,
        horas,
        fichasCount: fichasEnSede,
        instructoresCount: instructoresEnSede,
        ambientesCount: ambientesEnSede,
        porcentaje: totalHorasProgramadas > 0 ? Math.round((horas / totalHorasProgramadas) * 100) : 0,
      };
    }).sort((a, b) => b.horas - a.horas);
  }, [bloquesTrimestre, totalHorasProgramadas]);

  const maxHorasSede = Math.max(...datosPorSede.map((d) => d.horas), 1);

  // Gráfico 2: Composición por Competencia
  const datosCompetencia = useMemo(() => {
    const tipos: TipoCompetencia[] = ['Técnica', 'Transversal', 'Bilingüismo'];
    return tipos.map((t) => {
      const horas = bloquesTrimestre
        .filter((b) => b.competencia === t)
        .reduce((acc, b) => acc + b.horas, 0);
      const porcentaje = totalHorasProgramadas > 0 ? Math.round((horas / totalHorasProgramadas) * 100) : 0;
      return {
        tipo: t,
        horas,
        porcentaje,
      };
    });
  }, [bloquesTrimestre, totalHorasProgramadas]);

  // Gráfico 3: Carga por Jornada
  const datosJornada = useMemo(() => {
    return JORNADAS.map((j) => {
      const horas = bloquesTrimestre
        .filter((b) => b.jornada === j)
        .reduce((acc, b) => acc + b.horas, 0);
      const bloquesCount = bloquesTrimestre.filter((b) => b.jornada === j).length;
      const porcentaje = totalHorasProgramadas > 0 ? Math.round((horas / totalHorasProgramadas) * 100) : 0;
      return {
        jornada: j,
        horas,
        bloquesCount,
        porcentaje,
      };
    });
  }, [bloquesTrimestre, totalHorasProgramadas]);

  // Gráfico 4: Distribución por Día de la Semana
  const datosDiaSemana = useMemo(() => {
    return DIAS_SEMANA.map((dia) => {
      const horas = bloquesTrimestre
        .filter((b) => b.dia === dia)
        .reduce((acc, b) => acc + b.horas, 0);
      const porcentaje = totalHorasProgramadas > 0 ? Math.round((horas / totalHorasProgramadas) * 100) : 0;
      return {
        dia,
        horas,
        porcentaje,
      };
    });
  }, [bloquesTrimestre, totalHorasProgramadas]);

  const maxHorasDia = Math.max(...datosDiaSemana.map((d) => d.horas), 1);

  // Gráfico 5: Distribución de la Carga de los 111 Instructores
  const cohortesCarga = useMemo(() => {
    const completa = analisisInstructores.filter((a) => a.horasSemanales === a.inst.horasSemanalesMax);
    const sobrecarga = analisisInstructores.filter((a) => a.horasSemanales > a.inst.horasSemanalesMax);
    const media = analisisInstructores.filter(
      (a) => a.horasSemanales > 0 && a.horasSemanales < a.inst.horasSemanalesMax
    );
    const sinCarga = analisisInstructores.filter((a) => a.horasSemanales === 0);

    return [
      {
        nombre: 'Carga Óptima (100%)',
        count: completa.length,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        bgLight: 'bg-emerald-50',
        instructores: completa,
      },
      {
        nombre: 'Sobrecarga (>100%)',
        count: sobrecarga.length,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        bgLight: 'bg-red-50',
        instructores: sobrecarga,
      },
      {
        nombre: 'Parcial (1% - 99%)',
        count: media.length,
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        bgLight: 'bg-amber-50',
        instructores: media,
      },
      {
        nombre: 'Sin Asignar (0h)',
        count: sinCarga.length,
        color: 'bg-slate-400',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-200',
        bgLight: 'bg-slate-50',
        instructores: sinCarga,
      },
    ];
  }, [analisisInstructores]);

  // Ocupación de ambientes físicos más concurridos
  const rankingAmbientes = useMemo(() => {
    const map = new Map<string, { sede: Sede; ambiente: string; horas: number; sesiones: number }>();
    for (const b of bloquesTrimestre) {
      if (!b.ambiente) continue;
      const key = `${b.sede} - ${b.ambiente}`;
      const actual = map.get(key) ?? { sede: b.sede, ambiente: b.ambiente, horas: 0, sesiones: 0 };
      actual.horas += b.horas;
      actual.sesiones += 1;
      map.set(key, actual);
    }
    return Array.from(map.values()).sort((a, b) => b.horas - a.horas).slice(0, 8);
  }, [bloquesTrimestre]);

  // Exportar Resumen Ejecutivo a PDF
  const handleExportarResumenPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.setTextColor(57, 161, 3);
    doc.text('SENA · Informe Ejecutivo de Programación Académica', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Trimestre Lectivo: ${trimestre}   |   Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 14, 25);
    doc.text('Centro de Formación Profesional Integral — Dirección de Coordinación Académica', 14, 30);

    // Resumen KPI en tabla
    autoTable(doc, {
      startY: 36,
      head: [['Indicador Estratégico', 'Valor Registrado', 'Meta / Capacidad', 'Cumplimiento']],
      body: [
        ['Horas Programadas Totales', `${totalHorasProgramadas}h`, `${capacidadTotalHoras}h`, `${porcentajeOcupacion}%`],
        ['Horas Instructores de Planta (30)', `${horasPlanta}h`, `${planta.length * 32}h`, `${Math.round((horasPlanta / (planta.length * 32)) * 100)}%`],
        ['Horas Instructores de Contrato (81)', `${horasContrato}h`, `${contrato.length * 40}h`, `${Math.round((horasContrato / (contrato.length * 40)) * 100)}%`],
        ['Fichas con Horario Completo', `${fichasCompletas.length} fichas`, `${fichas.length} fichas`, `${porcentajeFichasCompletas}%`],
        ['Población Aprendices Atendida', `${totalAprendicesImpactados} aprendices`, '100% de la matrícula', 'Activo'],
        ['Alertas y Conflictos en Agenda', `${totalConflictos} novedades`, '0 incidencias', totalConflictos === 0 ? 'Excelente' : 'Observación'],
      ],
      headStyles: { fillColor: [57, 161, 3], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Distribución por Sedes
    const finalY1 = (doc as any).lastAutoTable?.finalY ?? 90;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Distribución Operativa por Sedes', 14, finalY1 + 10);

    autoTable(doc, {
      startY: finalY1 + 14,
      head: [['Sede', 'Horas Semanales', '% Carga Total', 'Fichas Atendidas', 'Instructores Asignados', 'Ambientes Activos']],
      body: datosPorSede.map((d) => [
        d.sede,
        `${d.horas}h`,
        `${d.porcentaje}%`,
        d.fichasCount,
        d.instructoresCount,
        d.ambientesCount,
      ]),
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
    });

    doc.save(`Resumen_Ejecutivo_Programacion_${trimestre}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
              Tablero de Indicadores
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-600">Trimestre lectivo: {trimestre}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">111 Instructores · 112 Fichas · 6 Sedes</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
            Dashboard de Programación Académica
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Consolidado estratégico de horas programadas, balance de carga docente (Planta y Contrato),
            cobertura formativa por ficha, utilización de ambientes y salud de la programación.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportarResumenPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Resumen PDF
          </button>
          <button
            onClick={onNavigateToPlanificacion}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
          >
            Ver Planificación
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros interactivos del Dashboard */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filtros de visualización:</span>
          </div>

          {/* Filtro Sede */}
          <div className="flex items-center gap-1">
            <label className="text-slate-600 font-medium text-[11px]">Sede:</label>
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="todas">Todas las 6 Sedes</option>
              {SEDES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Contrato */}
          <div className="flex items-center gap-1">
            <label className="text-slate-600 font-medium text-[11px]">Docente:</label>
            <select
              value={filtroTipoContrato}
              onChange={(e) => setFiltroTipoContrato(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="todos">Planta y Contrato</option>
              <option value="Planta">Solo Planta (30)</option>
              <option value="Contrato">Solo Contrato (81)</option>
            </select>
          </div>

          {/* Filtro Jornada */}
          <div className="flex items-center gap-1">
            <label className="text-slate-600 font-medium text-[11px]">Jornada:</label>
            <select
              value={filtroJornada}
              onChange={(e) => setFiltroJornada(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="todas">Todas las jornadas</option>
              {JORNADAS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {(filtroSede !== 'todas' || filtroTipoContrato !== 'todos' || filtroJornada !== 'todas') && (
            <button
              onClick={() => {
                setFiltroSede('todas');
                setFiltroTipoContrato('todos');
                setFiltroJornada('todas');
              }}
              className="text-emerald-700 hover:text-emerald-800 underline font-medium text-[11px] ml-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Mostrando:</span>
          <strong className="text-slate-800">{bloquesFiltrados.length}</strong>
          <span>bloques asignados</span>
        </div>
      </div>

      {/* 4 KPIs de Alto Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ocupación Horaria */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Ocupación Horaria</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {porcentajeOcupacion}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({totalHorasProgramadas}h / {capacidadTotalHoras}h)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                porcentajeOcupacion > 100
                  ? 'bg-red-500'
                  : porcentajeOcupacion >= 80
                  ? 'bg-[#39A103]'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, porcentajeOcupacion)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span>Planta: <strong>{horasPlanta}h</strong> ({planta.length * 32}h)</span>
            <span>Contrato: <strong>{horasContrato}h</strong> ({contrato.length * 40}h)</span>
          </div>
        </div>

        {/* KPI 2: Fichas Completas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Cobertura de Fichas</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {fichasCompletas.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {fichas.length} ({porcentajeFichasCompletas}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full bg-[#39A103] transition-all duration-500"
              style={{ width: `${porcentajeFichasCompletas}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span>Técnicos: <strong>{fichas.filter((f) => f.nivel === 'Técnico').length}</strong></span>
            <span>Tecnólogos: <strong>{fichas.filter((f) => f.nivel === 'Tecnólogo').length}</strong></span>
          </div>
        </div>

        {/* KPI 3: Población Impactada */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Aprendices con Horario</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalAprendicesImpactados.toLocaleString('es-CO')}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Activos</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: '100%' }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span>Promedio por grupo: <strong>~28 aprendices</strong></span>
            <span>6 Sedes</span>
          </div>
        </div>

        {/* KPI 4: Salud de la Programación / Semáforo */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Salud de Programación</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                totalConflictos === 0 ? 'text-[#39A103]' : totalConflictos < 5 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {totalConflictos === 0 ? 'Óptima' : `${totalConflictos} alertas`}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                totalConflictos === 0 ? 'bg-[#39A103]' : totalConflictos < 5 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: totalConflictos === 0 ? '100%' : `${Math.max(20, 100 - totalConflictos * 10)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span>Cruces: <strong>0</strong></span>
            <span>Topes legales: <strong>{totalConflictos === 0 ? 'Cumplidos' : 'Revisar'}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Composición por Tipo de Competencia (3 Técnicos + 2 Transversales + 1 Bilingüe) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Equilibrio Curricular por Competencia
              </h3>
              <p className="text-xs text-slate-500">
                Distribución pedagógica: 3 Técnicos, 2 Transversales y 1 Bilingüismo
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Regla 3:2:1
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {datosCompetencia.map((comp) => {
              const bg =
                comp.tipo === 'Técnica'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : comp.tipo === 'Transversal'
                  ? 'border-indigo-200 bg-indigo-50/50'
                  : 'border-amber-200 bg-amber-50/50';
              const text =
                comp.tipo === 'Técnica'
                  ? 'text-emerald-800'
                  : comp.tipo === 'Transversal'
                  ? 'text-indigo-800'
                  : 'text-amber-800';
              const barColor =
                comp.tipo === 'Técnica'
                  ? 'bg-emerald-600'
                  : comp.tipo === 'Transversal'
                  ? 'bg-indigo-600'
                  : 'bg-amber-500';

              return (
                <div key={comp.tipo} className={`p-4 rounded-xl border ${bg} flex flex-col justify-between`}>
                  <div>
                    <span className="text-xs text-slate-600 font-medium block">
                      {comp.tipo}
                    </span>
                    <span className={`text-2xl font-bold font-mono tabular-nums ${text} mt-1 block`}>
                      {comp.horas}h
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {comp.porcentaje}% del total
                    </span>
                  </div>

                  <div className="w-full bg-white/70 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${comp.porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra proporcional visual */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Representación proporcional de la carga trimestral:
            </span>
            <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-100">
              {datosCompetencia.map((comp) => {
                const color =
                  comp.tipo === 'Técnica'
                    ? 'bg-emerald-600'
                    : comp.tipo === 'Transversal'
                    ? 'bg-indigo-600'
                    : 'bg-amber-500';
                return (
                  <div
                    key={comp.tipo}
                    className={`${color} h-full transition-all`}
                    style={{ width: `${comp.porcentaje}%` }}
                    title={`${comp.tipo}: ${comp.horas}h (${comp.porcentaje}%)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                Técnica (~50%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
                Transversal (~33%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                Bilingüismo (~17%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fila 2 de Gráficos: Distribución por Jornada & Días de la Semana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 3: Horas por Jornada */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Volumen Horario por Jornada
              </h3>
              <p className="text-xs text-slate-500">
                Distribución entre Mañana (06:00-12:00), Tarde (12:00-18:00) y Noche (18:00-22:00 / Sábado)
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {datosJornada.map((item) => (
              <div key={item.jornada} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Jornada {item.jornada}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.bloquesCount} bloques
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {item.horas}h ({item.porcentaje}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#39A103] rounded-full transition-all duration-500"
                    style={{ width: `${item.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 4: Distribución por Día de la Semana (Lunes a Sábado) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Carga Semanal por Día (Lunes a Sábado)
              </h3>
              <p className="text-xs text-slate-500">
                Nivel de saturación e intensidad horaria de cada jornada semanal
              </p>
            </div>
          </div>

          {/* Gráfico de Columnas Verticales SVG / Flex */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
            {datosDiaSemana.map((d) => {
              const alturaPorc = maxHorasDia > 0 ? Math.round((d.horas / maxHorasDia) * 100) : 0;
              return (
                <div key={d.dia} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip flotante */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums pointer-events-none whitespace-nowrap z-10">
                    {d.horas}h ({d.porcentaje}%)
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-700 tabular-nums">
                    {d.horas}h
                  </span>

                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md h-28 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-[#39A103] group-hover:bg-[#2f8502] transition-all rounded-t-md"
                      style={{ height: `${Math.max(6, alturaPorc)}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">
                    {d.dia.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Días regulares: Lunes a Viernes</span>
            <span>Jornada extendida nocturna / especial: Sábados</span>
          </div>
        </div>
      </div>

      {/* Cohortes de Carga de los 111 Instructores */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Estado de la Carga de los 111 Instructores
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de la planta docente según su nivel de cumplimiento de carga contractual
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            30 Planta (32h máx) · 81 Contrato (40h máx)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {cohortesCarga.map((c) => (
            <div
              key={c.nombre}
              className={`p-4 rounded-xl border ${c.borderColor} ${c.bgLight} flex flex-col justify-between`}
            >
              <div>
                <span className="text-xs font-semibold text-slate-700 block">
                  {c.nombre}
                </span>
                <span className={`text-2xl font-bold font-mono tabular-nums ${c.textColor} mt-1 block`}>
                  {c.count} docentes
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {Math.round((c.count / instructores.length) * 100)}% de la planta
                </span>
              </div>

              <div className="w-full bg-white/80 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className={`h-full ${c.color}`}
                  style={{ width: `${(c.count / instructores.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablas de Acción Rápida: Ambientes más demandados & Fichas con Horas Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ambientes físicos más concurridos */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Ambientes con Mayor Ocupación
              </h3>
              <p className="text-xs text-slate-500">
                Aulas y laboratorios especializados con mayor demanda semanal
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Ambiente</th>
                  <th className="py-2.5 px-3">Sede</th>
                  <th className="py-2.5 px-3 text-right">Sesiones</th>
                  <th className="py-2.5 px-3 text-right">Horas/Sem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankingAmbientes.map((amb, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {amb.ambiente}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {amb.sede}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {amb.sesiones}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      {amb.horas}h
                    </td>
                  </tr>
                ))}
                {rankingAmbientes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No se registran asignaciones de ambiente en este trimestre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fichas con Horas Pendientes de Cobertura */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Fichas con Horas por Completar
              </h3>
              <p className="text-xs text-slate-500">
                Grupos formativos que aún no alcanzan la meta de 30h o 28h semanales
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold sticky top-0">
                  <th className="py-2.5 px-3">Ficha</th>
                  <th className="py-2.5 px-3">Programa</th>
                  <th className="py-2.5 px-3 text-right">Asignado</th>
                  <th className="py-2.5 px-3 text-right">Meta</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analisisFichas
                  .filter((af) => !af.cumpleHoras)
                  .slice(0, 7)
                  .map((af) => (
                    <tr key={af.ficha.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {af.ficha.codigo}
                      </td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">
                        {af.ficha.programa}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">
                        {af.horasSemanales}h
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">
                        {af.ficha.horasSemanalesMeta}h
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => onSelectFicha(af.ficha.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded"
                        >
                          Programar
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                {analisisFichas.filter((af) => !af.cumpleHoras).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-emerald-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 inline-block mr-1 text-emerald-600" />
                      ¡Todas las fichas tienen su horario completo asignado!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
