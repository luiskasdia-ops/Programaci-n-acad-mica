import { Instructor } from '../types/scheduling';

export interface Coordinador {
  id: string;
  nombre: string;
  documento: string;
  cargo: string;
  sede: string;
  email: string;
}

export const COORDINADOR_GENERAL: Coordinador = {
  id: 'coord-1',
  nombre: 'Coordinador Académico',
  documento: '1020304567',
  cargo: 'Coordinador de Formación Profesional Integral',
  sede: 'Torre Norte',
  email: 'luiskasdia@gmail.com',
};

/**
 * Genera la clave o usuario genérico según la regla:
 * 3 letras iniciales del nombre (sin tildes, minúsculas) + 4 últimos dígitos de la cédula.
 * Ejemplo:
 * - "Carlos Mendoza", Doc "1017200000" -> "car0000"
 * - "Coordinador Académico", Doc "1020304567" -> "coo4567"
 */
export function generarClaveGenerica(nombre: string, documento: string): string {
  const cleanName = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();

  const tresLetras = cleanName.slice(0, 3).padEnd(3, 'x');
  const cleanDoc = documento.replace(/\D/g, '');
  const cuatroDigitos = cleanDoc.slice(-4).padStart(4, '0');

  return `${tresLetras}${cuatroDigitos}`;
}

/**
 * Valida credenciales del coordinador.
 * Acepta como usuario: 'coordinador', documento, o la clave generica 'coo4567'.
 * Contraseña: 'coo4567' (insensible a mayúsculas/minúsculas).
 */
export function validarCredencialesCoordinador(
  usuario: string,
  contrasena: string
): { valido: boolean; mensaje?: string } {
  const u = usuario.trim().toLowerCase();
  const p = contrasena.trim().toLowerCase();
  const claveEsperada = generarClaveGenerica(
    COORDINADOR_GENERAL.nombre,
    COORDINADOR_GENERAL.documento
  ); // "coo4567"

  const usuarioValido =
    u === 'coordinador' ||
    u === COORDINADOR_GENERAL.documento ||
    u === claveEsperada;

  if (!usuarioValido) {
    return {
      valido: false,
      mensaje: `Usuario no reconocido. Puedes usar '${claveEsperada}' o 'coordinador'.`,
    };
  }

  if (p !== claveEsperada) {
    return {
      valido: false,
      mensaje: `Contraseña incorrecta. Debe ser 3 letras del nombre + 4 dígitos de la cédula (${claveEsperada}).`,
    };
  }

  return { valido: true };
}

function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function autenticarInstructor(
  instructores: Instructor[],
  usuario: string,
  contrasena: string
): { instructor?: Instructor; mensaje?: string } {
  const u = normalizarTexto(usuario);
  const p = contrasena.trim().toLowerCase();

  if (!u || !p) {
    return { mensaje: 'Por favor ingresa tus nombres y apellidos, usuario o cédula, y contraseña.' };
  }

  const instructor = instructores.find((inst) => {
    const clave = generarClaveGenerica(inst.nombre, inst.documento);
    const doc = inst.documento.trim();
    const nombreNorm = normalizarTexto(inst.nombre);
    return u === clave || u === doc || u === nombreNorm;
  });

  if (!instructor) {
    return { mensaje: 'Instructor no encontrado. Verifica tus nombres y apellidos, usuario o cédula.' };
  }

  const claveEsperada = generarClaveGenerica(instructor.nombre, instructor.documento);
  if (p !== claveEsperada) {
    return { mensaje: 'Contraseña incorrecta.' };
  }

  return { instructor };
}

