import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BloqueHorario,
  DIAS_SEMANA,
  Ficha,
  Instructor,
} from '../types/scheduling';

export function descargarPdfPorFicha(
  ficha: Ficha,
  bloques: BloqueHorario[],
  instructores: Instructor[],
  trimestre: string
) {
  const bloquesFicha = bloques
    .filter((b) => b.fichaId === ficha.id && b.trimestre === trimestre)
    .sort((a, b) => DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia));

  const totalHoras = bloquesFicha.reduce((acc, b) => acc + b.horas, 0);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setTextColor(57, 161, 3);
  doc.text('SENA · Horario Académico por Ficha', 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Ficha: ${ficha.codigo} · ${ficha.programa} (${ficha.nivel} · ${ficha.estado})`,
    14,
    24
  );
  doc.text(
    `Trimestre: ${trimestre}   |   Jornada: ${ficha.jornada}   |   Sede: ${ficha.sede}   |   Aprendices: ${ficha.aprendices}   |   Carga: ${totalHoras}h / ${ficha.horasSemanalesMeta}h semanales`,
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
        'Instructor (Nombres y Apellidos)',
        'Cédula',
        'Vinculación',
        'Competencia',
        'Materia',
        'Ambiente',
      ],
    ],
    body: bloquesFicha.map((b) => {
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

  doc.save(`Horario_Ficha_${ficha.codigo}_${trimestre}.pdf`);
}
