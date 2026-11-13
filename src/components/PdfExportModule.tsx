import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BloqueHorario,
  DIAS_SEMANA,
  Ficha,
  Instructor,
} from '../types/scheduling';
import { COORDINADOR_GENERAL } from '../utils/auth';
import { FileDown, Mail, Search, CheckCircle2, ExternalLink, Info } from 'lucide-react';

interface PdfExportModuleProps {
  trimestre: string;
  instructores: Instructor[];
  fichas: Ficha[];
  bloques: BloqueHorario[];
  initialInstructorId?: string;
}

export const PdfExportModule: React.FC<PdfExportModuleProps> = ({
  trimestre,
  instructores,
  fichas,
  bloques,
  initialInstructorId,
}) => {
  const [modo, setModo] = useState<'instructor' | 'ficha'>('instructor');
  const [busqueda, setBusqueda] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState(
    initialInstructorId || (instructores[0]?.id ?? '')
  );
  const [selectedFichaId, setSelectedFichaId] = useState(fichas[0]?.id ?? '');

  // Si cambia initialInstructorId desde el exterior, sincronizarlo
  useEffect(() => {
    if (initialInstructorId && instructores.some((i) => i.id === initialInstructorId)) {
      setSelectedInstructorId(initialInstructorId);
      setModo('instructor');
    }
  }, [initialInstructorId, instructores]);

  const instructorActual =
    instructores.find((i) => i.id === selectedInstructorId) ?? instructores[0];
  const fichaActual =
    fichas.find((f) => f.id === selectedFichaId) ?? fichas[0];

  const [correoDestino, setCorreoDestino] = useState(instructorActual?.email ?? '');
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);
  const [lastGmailUrl, setLastGmailUrl] = useState<string | null>(null);

  // Sincronizar correo al cambiar de instructor
  useEffect(() => {
    if (modo === 'instructor' && instructorActual) {
      setCorreoDestino(instructorActual.email);
      setMensajeEstado(null);
      setLastGmailUrl(null);
    }
  }, [selectedInstructorId, modo, instructorActual]);

  const instructoresFiltrados = useMemo(() => {
    if (!busqueda) return instructores;
    const q = busqueda.toLowerCase();
    return instructores.filter(
      (i) =>
        i.nombre.toLowerCase().includes(q) ||
        i.documento.includes(busqueda.trim()) ||
        i.especialidad.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
    );
  }, [instructores, busqueda]);

  const fichasFiltradas = useMemo(() => {
    if (!busqueda) return fichas;
    const q = busqueda.toLowerCase();
    return fichas.filter(
      (f) =>
        f.codigo.includes(busqueda) || f.programa.toLowerCase().includes(q)
    );
  }, [fichas, busqueda]);

  const bloquesActuales = useMemo(() => {
    const filtrados = bloques.filter((b) => {
      if (b.trimestre !== trimestre) return false;
      return modo === 'instructor'
        ? b.instructorId === instructorActual.id
        : b.fichaId === fichaActual.id;
    });
    return [...filtrados].sort(
      (a, b) => DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia)
    );
  }, [bloques, trimestre, modo, instructorActual.id, fichaActual.id]);

  const totalHoras = bloquesActuales.reduce((acc, b) => acc + b.horas, 0);

  const generarPDFDoc = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(15);
    doc.setTextColor(57, 161, 3); // #39A103
    doc.text('SENA · Programación Académica Trimestral', 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    if (modo === 'instructor') {
      doc.text(
        `Instructor: ${instructorActual.nombre} · C.C. ${instructorActual.documento} (${instructorActual.tipo} · ${instructorActual.competencia})`,
        14,
        24
      );
      doc.text(
        `Trimestre: ${trimestre}   |   Sede base: ${instructorActual.sedeBase}   |   Carga programada: ${totalHoras}h / ${instructorActual.horasSemanalesMax}h   |   Correo: ${instructorActual.email}`,
        14,
        30
      );

      autoTable(doc, {
        startY: 36,
        head: [
          [
            'Día',
            'Jornada',
            'Franja',
            'Horas',
            'Ficha',
            'Programa',
            'Sede',
            'Ambiente',
            'Materia / Competencia',
          ],
        ],
        body: bloquesActuales.map((b) => {
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
    } else {
      doc.text(
        `Ficha: ${fichaActual.codigo} · ${fichaActual.programa} (${fichaActual.nivel})`,
        14,
        24
      );
      doc.text(
        `Trimestre: ${trimestre}   |   Jornada: ${fichaActual.jornada}   |   Sede: ${fichaActual.sede}   |   Horas: ${totalHoras}h / ${fichaActual.horasSemanalesMeta}h`,
        14,
        30
      );

      autoTable(doc, {
        startY: 36,
        head: [
          [
            'Día',
            'Franja',
            'Horas',
            'Instructor',
            'Cédula',
            'Vinculación',
            'Competencia',
            'Materia',
            'Ambiente',
          ],
        ],
        body: bloquesActuales.map((b) => {
          const inst = instructores.find((x) => x.id === b.instructorId);
          return [
            b.dia,
            b.franja,
            `${b.horas}h`,
            inst?.nombre ?? '-',
            inst?.documento ?? '-',
            inst?.tipo ?? '-',
            b.competencia,
            b.materia ?? '-',
            b.ambiente ?? '-',
          ];
        }),
        headStyles: { fillColor: [57, 161, 3], textColor: 255 },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
      });
    }

    return doc;
  };

  const handleDescargarPDF = () => {
    const doc = generarPDFDoc();
    const filename =
      modo === 'instructor'
        ? `Programacion_${instructorActual.nombre.replace(/\s+/g, '_')}_${trimestre}.pdf`
        : `Programacion_Ficha_${fichaActual.codigo}_${trimestre}.pdf`;
    doc.save(filename);
  };

  // Enviar desde luiskasdia@gmail.com a través de Gmail Web
  const handleDescargarYEnviarGmail = () => {
    if (!correoDestino.trim() || bloquesActuales.length === 0) return;

    // 1. Descargar el PDF
    handleDescargarPDF();

    // 2. Preparar asunto y cuerpo formal
    const asunto = `SENA · Programación Académica Trimestral ${trimestre} - ${
      modo === 'instructor' ? instructorActual.nombre : `Ficha ${fichaActual.codigo}`
    }`;

    const detalleBloques = bloquesActuales
      .map(
        (b) =>
          `• ${b.dia} ${b.franja} (${b.horas}h) | Sede: ${b.sede} | Ambiente: ${
            b.ambiente ?? 'Por asignar'
          } | Materia: ${b.materia ?? b.competencia}`
      )
      .join('\n');

    const cuerpo = `Apreciado(a) ${
      modo === 'instructor' ? instructorActual.nombre : `Equipo de la Ficha ${fichaActual.codigo}`
    },\n\nReciba un cordial saludo desde la Coordinación Académica.\n\nPor medio del presente correo remitimos su programación académica oficial para el trimestre ${trimestre} (Total horas asignadas: ${totalHoras}h):\n\n${detalleBloques}\n\nAdjunto a este correo encontrará el archivo PDF oficial con el formato institucional completo.\n\nAtentamente,\n\nLuis Carlos Díaz\nCoordinador Académico\nCorreo: luiskasdia@gmail.com\nServicio Nacional de Aprendizaje - SENA`;

    // 3. Abrir redacción directa en Gmail Web con la cuenta luiskasdia@gmail.com
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      correoDestino.trim()
    )}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      cuerpo
    )}&authuser=${encodeURIComponent(COORDINADOR_GENERAL.email)}`;

    setLastGmailUrl(gmailUrl);

    // Despacho seguro mediante anchor click para evitar bloqueos de ventana
    const link = document.createElement('a');
    link.href = gmailUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMensajeEstado(
      `PDF oficial descargado y redacción en Gmail lista con remitente luiskasdia@gmail.com hacia ${correoDestino.trim()}. ¡Adjunta el PDF descargado y presiona Enviar!`
    );
  };

  // Enviar por cliente de correo nativo (Outlook, Thunderbird o Mail app)
  const handleEnviarMailto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoDestino.trim() || bloquesActuales.length === 0) return;

    handleDescargarPDF();

    const asunto = encodeURIComponent(
      `SENA · Programación Académica ${trimestre} - ${
        modo === 'instructor' ? instructorActual.nombre : `Ficha ${fichaActual.codigo}`
      }`
    );

    const cuerpo = encodeURIComponent(
      `Apreciado(a) instructor(a),\n\nAdjunto remitimos su programación académica oficial para el trimestre ${trimestre} (${totalHoras} horas semanales).\n\nAtentamente,\nCoordinación Académica\nluiskasdia@gmail.com`
    );

    window.location.href = `mailto:${encodeURIComponent(
      correoDestino.trim()
    )}?subject=${asunto}&body=${cuerpo}`;

    setMensajeEstado(
      `PDF descargado y cliente de correo abierto hacia ${correoDestino.trim()}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white text-black rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            Exportación Oficial y Envío de Horarios · {trimestre}
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Descargar y Enviar Programación en PDF
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Remitir el horario oficial en PDF desde el correo del Coordinador (
            <strong className="text-emerald-800">luiskasdia@gmail.com</strong>) a los correos de los
            instructores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => {
              setModo('instructor');
              setBusqueda('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              modo === 'instructor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Por Instructor (111)
          </button>
          <button
            onClick={() => {
              setModo('ficha');
              setBusqueda('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              modo === 'ficha'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Por Ficha (112)
          </button>
        </div>
      </div>

      {/* Banner Explicativo de Envío desde luiskasdia@gmail.com */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 space-y-1">
            <p className="font-bold text-sm text-emerald-900">
              ¿Cómo se envía la programación desde luiskasdia@gmail.com?
            </p>
            <p>
              1. Selecciona al instructor en la lista (su correo institucional se carga automáticamente).
            </p>
            <p>
              2. Al presionar <strong>"Descargar PDF y Enviar por Gmail"</strong>, el sistema descarga el PDF institucional oficial e inmediatamente abre tu Gmail con la cuenta <strong>luiskasdia@gmail.com</strong>, con el destinatario, asunto y resumen ya redactados.
            </p>
            <p>
              3. Simplemente adjuntas el archivo PDF descargado y haces clic en <strong>Enviar</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Selector y Vista Previa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista de selección */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={
                modo === 'instructor'
                  ? 'Buscar por nombre, apellido, cédula o correo...'
                  : 'Buscar código o programa...'
              }
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
            {modo === 'instructor'
              ? instructoresFiltrados.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstructorId(inst.id)}
                    className={`w-full text-left py-2.5 px-2.5 rounded-lg text-sm transition-colors ${
                      inst.id === instructorActual.id
                        ? 'bg-emerald-50 font-medium text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate font-semibold">{inst.nombre}</div>
                    <div className="text-xs text-slate-500">
                      C.C. {inst.documento} · {inst.tipo} · {inst.competencia}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-mono truncate">
                      {inst.email}
                    </div>
                  </button>
                ))
              : fichasFiltradas.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFichaId(f.id)}
                    className={`w-full text-left py-2.5 px-2.5 rounded-lg text-sm transition-colors ${
                      f.id === fichaActual.id
                        ? 'bg-emerald-50 font-medium text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold">{f.codigo}</div>
                    <div className="text-xs truncate">{f.programa}</div>
                    <div className="text-xs text-slate-500">
                      {f.jornada} · {f.sede}
                    </div>
                  </button>
                ))}
          </div>
        </div>

        {/* Panel de Envio y Vista previa */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tarjeta de Envío desde luiskasdia@gmail.com */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500">Remitente oficial de Coordinación:</span>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  luiskasdia@gmail.com
                </p>
              </div>
              <div className="text-xs text-slate-500">
                Trimestre lectivo: <strong className="text-slate-800">{trimestre}</strong>
              </div>
            </div>

            {/* Formulario de Correo del Instructor Destinatario */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo destinatario del {modo === 'instructor' ? 'instructor' : 'grupo'}:
                </label>
                <input
                  type="email"
                  value={correoDestino}
                  onChange={(e) => {
                    setCorreoDestino(e.target.value);
                    if (mensajeEstado) setMensajeEstado(null);
                  }}
                  placeholder="ejemplo@sena.edu.co"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-mono"
                />
              </div>

              <div className="sm:col-span-4 flex flex-col gap-1.5 pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleDescargarYEnviarGmail}
                  disabled={!correoDestino.trim() || bloquesActuales.length === 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#39A103] hover:bg-[#2f8502] rounded-lg shadow-sm transition-colors disabled:opacity-40"
                  title="Descarga el PDF y abre Gmail redactado con luiskasdia@gmail.com"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Enviar por Gmail
                </button>

                <button
                  type="button"
                  onClick={handleDescargarPDF}
                  disabled={bloquesActuales.length === 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors disabled:opacity-40"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Solo Descargar PDF
                </button>
              </div>
            </div>

            {mensajeEstado && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{mensajeEstado}</span>
                </div>
                {lastGmailUrl && (
                  <a
                    href={lastGmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#39A103] text-white font-semibold rounded-md shadow-xs hover:bg-[#2f8502] transition-colors whitespace-nowrap self-start sm:self-center shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir Gmail redactado
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Vista previa de la tabla a exportar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modo === 'instructor'
                    ? instructorActual.nombre
                    : `Ficha ${fichaActual.codigo} · ${fichaActual.programa}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modo === 'instructor'
                    ? `C.C. ${instructorActual.documento} · ${instructorActual.tipo} · ${instructorActual.competencia} · ${totalHoras}h programadas de ${instructorActual.horasSemanalesMax}h`
                    : `${fichaActual.jornada} · ${fichaActual.sede} · ${totalHoras}h programadas de ${fichaActual.horasSemanalesMeta}h`}
                </p>
              </div>
            </div>

            {bloquesActuales.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No hay bloques programados en {trimestre} para esta selección.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 font-medium">Día</th>
                      <th className="py-2 font-medium">Franja</th>
                      <th className="py-2 font-medium">Horas</th>
                      <th className="py-2 font-medium">
                        {modo === 'instructor' ? 'Ficha' : 'Instructor'}
                      </th>
                      <th className="py-2 font-medium">Sede / Ambiente</th>
                      <th className="py-2 font-medium">Materia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bloquesActuales.map((b) => {
                      const f = fichas.find((x) => x.id === b.fichaId);
                      const inst = instructores.find((x) => x.id === b.instructorId);
                      return (
                        <tr key={b.id}>
                          <td className="py-2.5 font-medium text-slate-900">{b.dia}</td>
                          <td className="py-2.5 font-mono text-slate-700">{b.franja}</td>
                          <td className="py-2.5 font-mono text-slate-700">{b.horas}h</td>
                          <td className="py-2.5 text-slate-800">
                            {modo === 'instructor'
                              ? `${f?.codigo} · ${f?.programa.slice(0, 20)}`
                              : `${inst?.nombre ?? '-'} (C.C. ${inst?.documento ?? '-'})`}
                          </td>
                          <td className="py-2.5 text-slate-600">
                            {b.sede} {b.ambiente ? `· ${b.ambiente}` : ''}
                          </td>
                          <td className="py-2.5 text-slate-600">
                            {b.materia ?? b.competencia}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
