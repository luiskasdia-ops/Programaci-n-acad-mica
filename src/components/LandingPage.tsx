import React, { useState } from 'react';
import { Instructor } from '../types/scheduling';
import {
  COORDINADOR_GENERAL,
  generarClaveGenerica,
  validarCredencialesCoordinador,
  autenticarInstructor,
} from '../utils/auth';
import {
  ShieldCheck,
  User,
  ArrowRight,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  BookOpen,
  Lock,
  AlertCircle,
} from 'lucide-react';

interface LandingPageProps {
  instructores: Instructor[];
  onSelectCoordinador: () => void;
  onSelectInstructor: (instructorId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  instructores,
  onSelectCoordinador,
  onSelectInstructor,
}) => {
  // Modal Coordinador
  const [modalCoordOpen, setModalCoordOpen] = useState(false);
  const [coordUser, setCoordUser] = useState('');
  const [coordPass, setCoordPass] = useState('');
  const [coordError, setCoordError] = useState('');

  // Modal Instructor
  const [modalInstOpen, setModalInstOpen] = useState(false);
  const [instUser, setInstUser] = useState('');
  const [instPass, setInstPass] = useState('');
  const [instError, setInstError] = useState('');

  const coordClaveEsperada = generarClaveGenerica(
    COORDINADOR_GENERAL.nombre,
    COORDINADOR_GENERAL.documento
  ); // "coo4567"

  const handleLoginCoordinador = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validarCredencialesCoordinador(coordUser, coordPass);
    if (!res.valido) {
      setCoordError(res.mensaje ?? 'Credenciales incorrectas');
      return;
    }
    setCoordError('');
    setModalCoordOpen(false);
    onSelectCoordinador();
  };

  const handleLoginInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    const res = autenticarInstructor(instructores, instUser, instPass);
    if (!res.instructor) {
      setInstError(res.mensaje ?? 'Usuario o contraseña incorrectos.');
      return;
    }
    setInstError('');
    setModalInstOpen(false);
    onSelectInstructor(res.instructor.id);
  };

  return (
    <div className="min-h-screen bg-[#39A103] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Contenedor central */}
      <div className="max-w-6xl mx-auto w-full space-y-8 my-auto">
        {/* Encabezado Institucional */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200 text-center relative overflow-hidden">
          <div className="flex flex-col items-center">
            <img
              src="data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27utf-8%27?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2026.0.1,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version=%271.1%27%20id=%27Capa_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20xmlns:xlink=%27http://www.w3.org/1999/xlink%27%20x=%270px%27%20y=%270px%27%20viewBox=%270%200%201000%201000%27%20style=%27enable-background:new%200%200%201000%201000;%27%20xml:space=%27preserve%27%3e%3cstyle%20type=%27text/css%27%3e%20.st0{fill:%2339a900;}%20%3c/style%3e%3cpath%20id=%27path47-5%27%20class=%27st0%27%20d=%27M504.2,20.5c-58.3,0.1-105.6,47.4-105.5,105.8c0.1,58.3,47.4,105.6,105.7,105.6%20c58.3,0,105.6-47.3,105.6-105.7V126C609.9,67.6,562.6,20.4,504.2,20.5z%20M155.6,264.6c-18.6,0.1-37.5,1.1-55.2,5.6%20c-11.7,3-23,7.8-30.3,15.4c-9.2,9.5-10.4,22.3-5.9,33.3c4,9.7,14.8,16.9,26.8,21.1c25.9,8.9,54.6,10.7,81.8,16.3%20c5,1.2,10.6,2.6,13.7,6c3.2,4.1,1.3,9.7-4,12.2c-8.8,4.5-20.1,4.5-30.4,4.4c-9.4-0.4-19.7-1.2-27.2-5.9c-5.5-3.4-6.5-9.1-5.2-14.1%20l-60.6,0c-0.2,9.2,1.6,18.9,8.4,26.8c5.6,6.8,14.8,11.5,24.6,14.4c15.7,4.6,32.7,6,49.4,6.4c22.7,0.4,45.8-0.3,67.6-5.4%20c13-3.2,25.8-8.3,34.1-16.6c14.8-14.8,11.3-38.3-8.3-49.8c-9.8-5.7-21.5-9.2-33.4-11.5c-17.5-3.6-35.3-6.3-52.9-9.2%20c-6.2-1.2-12.8-2.3-18-5.2c-5.5-2.9-5.9-9.8-0.3-12.9c7.2-4.1,16.8-4,25.4-4c9.1,0.2,19,0.7,26.5,5c4.2,2.3,5.9,6.3,5.9,10.1%20l57.6-0.1c-0.2-7.3-1.6-14.9-6.9-21.2c-6.2-7.8-17.1-12.7-28.3-15.5C192.8,265.6,174.1,264.7,155.6,264.6L155.6,264.6z%20M280.6,268.9%20l0,137.7l168.1,0l0-30H342.3v-26.7h94.9v-29.3h-94.9l0-21.9l102.6,0l-0.1-29.7L280.6,268.9z%20M557.5,269c0,0-51.9,0-77.9,0l0,137.7%20l59,0l0-92.7l80.8,92.6l81,0.1l0-137.7l-59.1,0l0.1,92L557.5,269z%20M805.6,269.2c0,0-63.6,91.9-95.6,137.7l61.9,0l14.9-24.8h95.7%20l13.9,24.9l68.8,0L874,269.2L805.6,269.2z%20M836.6,302.1l29.4,49.9l-60.7,0.1L836.6,302.1z%20M10.6,445.6l0.5,75l280.1-1%20c14.3,3.1,22.6,12.4,19.7,33.5L138.6,854.7l56.1,52.5l266.9-461.6L10.6,445.6z%20M545.2,446.2l262.4,459.6l58-52.1L691.3,552.9%20c-2.9-21.2,5.4-30.6,19.7-33.7l280.2,1l-0.1-73.7L545.2,446.2z%20M500.9,522.3L254.8,944.7l65.4,31.9L484.4,699%20c5.7-4.6,11.4-7.1,17.1-7.3c6-0.2,12.2,2,18.3,6.8l163.8,278.4l67.4-35.2L500.9,522.3z%27/%3e%3cg%20id=%27_x23_000000ff-2%27%20transform=%27matrix(0.31570611,0,0,0.23560774,-391.49698,-10.601126)%27%3e%3c/g%3e%3c/svg%3e"
              alt="Logo SENA"
              className="w-16 h-16 object-contain mb-3"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Servicio Nacional de Aprendizaje · SENA
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mt-2 tracking-tight">
              Sistema de Programación Académica
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
              Gestión centralizada y control de horarios trimestrales para instructores de planta
              y contrato, asignación de ambientes por sedes y cobertura formativa por ficha.
            </p>
          </div>

          {/* Estadísticas clave del centro */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-left">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Planta Docente
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                111 Instructores
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">30 Planta · 81 Contrato</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Fichas Formativas
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                112 Grupos
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Técnicos y Tecnólogos</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Sedes y Ambientes
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                6 Sedes
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Validación de cruces</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Jornadas
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
                3 Jornadas
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Mañana · Tarde · Noche</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Selección de Rol */}
        <div>
          <h2 className="text-white text-lg font-semibold text-center mb-4">
            Selecciona tu perfil de ingreso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta Rol Coordinador */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Coordinador Académico</h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                    Acceso Total
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  <strong>Responsable único de la programación.</strong> Gestiona la asignación
                  completa de instructores, balance de 30 de planta y 81 de contrato, control de
                  desplazamientos entre sedes y resolución de conflictos.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Planificación trimestral y demanda de fichas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Programación por instructor y validación de topes diarios/semanales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Composición 3 Técnicos + 2 Transversales + 1 Bilingüismo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Gestión de ambientes en las 6 sedes y exportación institucional</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setCoordError('');
                    setModalCoordOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-xl shadow transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Iniciar Sesión como Coordinador
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tarjeta Rol Instructor */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Instructores</h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                    111 Docentes
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  <strong>Portal de consulta individual.</strong> Accede a tu horario asignado,
                  revisa tus fichas, ambientes asignados en cada sede, materias que orientas y
                  descarga tu horario en PDF o envíalo a tu correo.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Visualización clara de horario semanal de Lunes a Sábado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Detalle de sede y ambiente asignado para cada sesión</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Descarga de comprobante en PDF y envío directo al correo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Envío de solicitudes y novedades a Coordinación Académica</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setInstError('');
                    setModalInstOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-xl shadow transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Iniciar Sesión como Instructor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Login Coordinador */}
      {modalCoordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Acceso Coordinación Académica
                  </h3>
                  <p className="text-xs text-slate-500">Único rol encargado de la programación</p>
                </div>
              </div>
              <button
                onClick={() => setModalCoordOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium px-2 py-1"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleLoginCoordinador} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuario o Cédula
                </label>
                <input
                  type="text"
                  value={coordUser}
                  onChange={(e) => {
                    setCoordUser(e.target.value);
                    setCoordError('');
                  }}
                  placeholder="Ingresa tu usuario o cédula"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={coordPass}
                  onChange={(e) => {
                    setCoordPass(e.target.value);
                    setCoordError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {coordError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{coordError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg transition-colors"
                >
                  Entrar como Coordinador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Login Instructor */}
      {modalInstOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Acceso Instructor
                  </h3>
                  <p className="text-xs text-slate-500">Portal de consulta docente</p>
                </div>
              </div>
              <button
                onClick={() => setModalInstOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium px-2 py-1"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleLoginInstructor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombres y apellidos, usuario o cédula
                </label>
                <input
                  type="text"
                  value={instUser}
                  onChange={(e) => {
                    setInstUser(e.target.value);
                    setInstError('');
                  }}
                  placeholder="Ingresa tus nombres y apellidos, usuario o cédula"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={instPass}
                  onChange={(e) => {
                    setInstPass(e.target.value);
                    setInstError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {instError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{instError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg transition-colors"
                >
                  Entrar como Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer discreto */}
      <footer className="text-center text-xs text-white/80 py-4">
        Servicio Nacional de Aprendizaje · SENA — Dirección de Formación Profesional Integral
      </footer>
    </div>
  );
};
