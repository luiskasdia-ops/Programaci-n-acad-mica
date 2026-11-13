import React, { useEffect, useMemo, useState } from 'react';
import {
  generarBloquesIniciales,
  generarFichas,
  generarInstructores,
} from './data/schedulingData';
import { BloqueHorario } from './types/scheduling';
import { TrimestrePlanner } from './components/TrimestrePlanner';
import { InstructorScheduler } from './components/InstructorScheduler';
import { FichaScheduler } from './components/FichaScheduler';
import { PdfExportModule } from './components/PdfExportModule';
import { LandingPage } from './components/LandingPage';
import { InstructorPortal } from './components/InstructorPortal';
import { AcademicDashboard } from './components/AcademicDashboard';
import { RotateCcw, LogOut, ShieldCheck, User, BarChart3 } from 'lucide-react';

type UserRole = 'landing' | 'coordinador' | 'instructor';
type ModuloCoordinador = 'dashboard' | 'planificacion' | 'instructores' | 'fichas' | 'pdf';

const STORAGE_KEY = 'sena_programacion_bloques_v1';
const ROLE_STORAGE_KEY = 'sena_active_role_v1';
const TRIMESTRES = ['2026-T4', '2027-T1', '2027-T2', '2027-T3'];

export function App() {
  const instructores = useMemo(() => generarInstructores(), []);
  const fichas = useMemo(() => generarFichas(), []);

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
      if (saved && ['landing', 'coordinador', 'instructor'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'landing';
  });

  const [trimestre, setTrimestre] = useState<string>('2026-T4');
  const [modulo, setModulo] = useState<ModuloCoordinador>('dashboard');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(
    instructores[0]?.id ?? 'inst-1'
  );
  const [selectedFichaId, setSelectedFichaId] = useState<string>(fichas[0].id);

  const [bloques, setBloques] = useState<BloqueHorario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return generarBloquesIniciales(instructores, fichas, '2026-T4');
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bloques));
    } catch {
      // ignore storage errors
    }
  }, [bloques]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    try {
      sessionStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch {
      // ignore
    }
  };

  const handleAddBloque = (nuevo: Omit<BloqueHorario, 'id'>) => {
    setBloques((prev) => [
      ...prev,
      { ...nuevo, id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
    ]);
  };

  const handleDeleteBloque = (id: string) => {
    setBloques((prev) => prev.filter((b) => b.id !== id));
  };

  const handleReset = () => {
    const iniciales = generarBloquesIniciales(instructores, fichas, '2026-T4');
    setBloques(iniciales);
  };

  // Si estamos en la Landing Page, mostrar selector de roles
  if (currentRole === 'landing') {
    return (
      <LandingPage
        instructores={instructores}
        onSelectCoordinador={() => handleRoleChange('coordinador')}
        onSelectInstructor={(instructorId) => {
          setSelectedInstructorId(instructorId);
          handleRoleChange('instructor');
        }}
      />
    );
  }

  const instructorActual =
    instructores.find((i) => i.id === selectedInstructorId) ?? instructores[0];

  return (
    <div className="min-h-screen bg-[#39A103] text-slate-900">
      {/* Navegación principal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <img
                src="data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27utf-8%27?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2026.0.1,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version=%271.1%27%20id=%27Capa_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20xmlns:xlink=%27http://www.w3.org/1999/xlink%27%20x=%270px%27%20y=%270px%27%20viewBox=%270%200%201000%201000%27%20style=%27enable-background:new%200%200%201000%201000;%27%20xml:space=%27preserve%27%3e%3cstyle%20type=%27text/css%27%3e%20.st0{fill:%2339a900;}%20%3c/style%3e%3cpath%20id=%27path47-5%27%20class=%27st0%27%20d=%27M504.2,20.5c-58.3,0.1-105.6,47.4-105.5,105.8c0.1,58.3,47.4,105.6,105.7,105.6%20c58.3,0,105.6-47.3,105.6-105.7V126C609.9,67.6,562.6,20.4,504.2,20.5z%20M155.6,264.6c-18.6,0.1-37.5,1.1-55.2,5.6%20c-11.7,3-23,7.8-30.3,15.4c-9.2,9.5-10.4,22.3-5.9,33.3c4,9.7,14.8,16.9,26.8,21.1c25.9,8.9,54.6,10.7,81.8,16.3%20c5,1.2,10.6,2.6,13.7,6c3.2,4.1,1.3,9.7-4,12.2c-8.8,4.5-20.1,4.5-30.4,4.4c-9.4-0.4-19.7-1.2-27.2-5.9c-5.5-3.4-6.5-9.1-5.2-14.1%20l-60.6,0c-0.2,9.2,1.6,18.9,8.4,26.8c5.6,6.8,14.8,11.5,24.6,14.4c15.7,4.6,32.7,6,49.4,6.4c22.7,0.4,45.8-0.3,67.6-5.4%20c13-3.2,25.8-8.3,34.1-16.6c14.8-14.8,11.3-38.3-8.3-49.8c-9.8-5.7-21.5-9.2-33.4-11.5c-17.5-3.6-35.3-6.3-52.9-9.2%20c-6.2-1.2-12.8-2.3-18-5.2c-5.5-2.9-5.9-9.8-0.3-12.9c7.2-4.1,16.8-4,25.4-4c9.1,0.2,19,0.7,26.5,5c4.2,2.3,5.9,6.3,5.9,10.1%20l57.6-0.1c-0.2-7.3-1.6-14.9-6.9-21.2c-6.2-7.8-17.1-12.7-28.3-15.5C192.8,265.6,174.1,264.7,155.6,264.6L155.6,264.6z%20M280.6,268.9%20l0,137.7l168.1,0l0-30H342.3v-26.7h94.9v-29.3h-94.9l0-21.9l102.6,0l-0.1-29.7L280.6,268.9z%20M557.5,269c0,0-51.9,0-77.9,0l0,137.7%20l59,0l0-92.7l80.8,92.6l81,0.1l0-137.7l-59.1,0l0.1,92L557.5,269z%20M805.6,269.2c0,0-63.6,91.9-95.6,137.7l61.9,0l14.9-24.8h95.7%20l13.9,24.9l68.8,0L874,269.2L805.6,269.2z%20M836.6,302.1l29.4,49.9l-60.7,0.1L836.6,302.1z%20M10.6,445.6l0.5,75l280.1-1%20c14.3,3.1,22.6,12.4,19.7,33.5L138.6,854.7l56.1,52.5l266.9-461.6L10.6,445.6z%20M545.2,446.2l262.4,459.6l58-52.1L691.3,552.9%20c-2.9-21.2,5.4-30.6,19.7-33.7l280.2,1l-0.1-73.7L545.2,446.2z%20M500.9,522.3L254.8,944.7l65.4,31.9L484.4,699%20c5.7-4.6,11.4-7.1,17.1-7.3c6-0.2,12.2,2,18.3,6.8l163.8,278.4l67.4-35.2L500.9,522.3z%27/%3e%3cg%20id=%27_x23_000000ff-2%27%20transform=%27matrix(0.31570611,0,0,0.23560774,-391.49698,-10.601126)%27%3e%3c/g%3e%3c/svg%3e"
                alt="Logo SENA"
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                SENA · Programación Académica
              </span>
            </div>

            {/* Etiqueta del rol activo */}
            {currentRole === 'coordinador' ? (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Coordinador Académico (Programador Único)
              </span>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Instructor: {instructorActual.nombre.split(' ')[0]} ({instructorActual.tipo})
              </span>
            )}

            {/* Módulos solo para el Coordinador */}
            {currentRole === 'coordinador' && (
              <nav className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
                <button
                  onClick={() => setModulo('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    modulo === 'dashboard'
                      ? 'bg-[#39A103] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setModulo('planificacion')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    modulo === 'planificacion'
                      ? 'bg-[#39A103] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Planificación Trimestral
                </button>
                <button
                  onClick={() => setModulo('instructores')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    modulo === 'instructores'
                      ? 'bg-[#39A103] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Por Instructor
                </button>
                <button
                  onClick={() => setModulo('fichas')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    modulo === 'fichas'
                      ? 'bg-[#39A103] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Por Ficha
                </button>
                <button
                  onClick={() => setModulo('pdf')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    modulo === 'pdf'
                      ? 'bg-[#39A103] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Descargar y Enviar PDF
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={trimestre}
              onChange={(e) => setTrimestre(e.target.value)}
              aria-label="Seleccionar trimestre"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {TRIMESTRES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {currentRole === 'coordinador' && (
              <button
                onClick={handleReset}
                title="Restaurar programación inicial"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>
            )}

            {/* Botón para cambiar de Rol / Volver al Landing */}
            <button
              onClick={() => handleRoleChange('landing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title={currentRole === 'coordinador' ? 'Cambiar perfil de usuario' : 'Cerrar sesión de consulta'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {currentRole === 'coordinador' ? 'Cambiar Rol' : 'Cerrar Sesión'}
              </span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación móvil para el Coordinador */}
        {currentRole === 'coordinador' && (
          <div className="md:hidden border-t border-slate-100 px-4 py-2 flex gap-1 overflow-x-auto bg-slate-50">
            <button
              onClick={() => setModulo('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                modulo === 'dashboard'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setModulo('planificacion')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                modulo === 'planificacion'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              Planificación
            </button>
            <button
              onClick={() => setModulo('instructores')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                modulo === 'instructores'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              Por Instructor
            </button>
            <button
              onClick={() => setModulo('fichas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                modulo === 'fichas'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              Por Ficha
            </button>
            <button
              onClick={() => setModulo('pdf')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                modulo === 'pdf'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              Descargar y Enviar PDF
            </button>
          </div>
        )}
      </header>

      {/* Contenido principal según rol */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'coordinador' && (
          <>
            {modulo === 'dashboard' && (
              <AcademicDashboard
                trimestre={trimestre}
                instructores={instructores}
                fichas={fichas}
                bloques={bloques}
                onSelectInstructor={(id) => {
                  setSelectedInstructorId(id);
                  setModulo('instructores');
                }}
                onSelectFicha={(id) => {
                  setSelectedFichaId(id);
                  setModulo('fichas');
                }}
                onNavigateToPlanificacion={() => setModulo('planificacion')}
              />
            )}

            {modulo === 'planificacion' && (
              <TrimestrePlanner
                trimestre={trimestre}
                instructores={instructores}
                fichas={fichas}
                bloques={bloques}
                onSelectInstructor={(id) => {
                  setSelectedInstructorId(id);
                  setModulo('instructores');
                }}
                onSelectFicha={(id) => {
                  setSelectedFichaId(id);
                  setModulo('fichas');
                }}
                onNavigateToPdf={(instructorId) => {
                  if (instructorId) {
                    setSelectedInstructorId(instructorId);
                  }
                  setModulo('pdf');
                }}
              />
            )}

            {modulo === 'instructores' && (
              <InstructorScheduler
                trimestre={trimestre}
                instructores={instructores}
                fichas={fichas}
                bloques={bloques}
                selectedInstructorId={selectedInstructorId}
                onSelectInstructor={setSelectedInstructorId}
                onAddBloque={handleAddBloque}
                onDeleteBloque={handleDeleteBloque}
              />
            )}

            {modulo === 'fichas' && (
              <FichaScheduler
                trimestre={trimestre}
                fichas={fichas}
                instructores={instructores}
                bloques={bloques}
                selectedFichaId={selectedFichaId}
                onSelectFicha={setSelectedFichaId}
                onAddBloque={handleAddBloque}
                onDeleteBloque={handleDeleteBloque}
              />
            )}

            {modulo === 'pdf' && (
              <PdfExportModule
                trimestre={trimestre}
                instructores={instructores}
                fichas={fichas}
                bloques={bloques}
                initialInstructorId={selectedInstructorId}
              />
            )}
          </>
        )}

        {currentRole === 'instructor' && (
          <InstructorPortal
            instructor={instructorActual}
            trimestre={trimestre}
            fichas={fichas}
            instructores={instructores}
            bloques={bloques}
            onExit={() => handleRoleChange('landing')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
