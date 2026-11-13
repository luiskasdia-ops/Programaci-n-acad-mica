# Manual de Programación Académica · SENA

## 1. Propósito de la herramienta
La aplicación **SENA · Programación Académica** permite planificar, validar y exportar la programación trimestral de instructores y fichas, evitando cruces de horarios, sobrecargas diarias y conflictos de ambientes entre sedes.

---

## 2. Roles de acceso y Landing Page

La herramienta cuenta con una **página de bienvenida (Landing Page)** que permite seleccionar el perfil de ingreso adecuado:

### 2.1 Rol Coordinador Académico (Único Programador)
- **Perfil único:** Encargado oficial de estructurar, balancear y mantener la programación académica trimestral.
- **Permisos de Edición:**
  - Crear, editar y eliminar bloques de horario en las agendas de los instructores y fichas.
  - Resolver alertas de desplazamiento entre sedes y cruces de ambientes.
  - Planificar trimestres lectivos y supervisar la cobertura de fichas nuevas y en continuidad.
  - Exportar consolidados en PDF y remitir horarios por correo.
  - Restaurar o reiniciar la programación base en cualquier momento.

### 2.2 Rol Instructor (111 Instructores)
- **Acceso de Consulta Individual:** Los 111 instructores (30 de planta y 81 de contrato) ingresan mediante su **Usuario o Cédula** y su **Contraseña**, identificando automáticamente su perfil docente.
- **Funcionalidades del Portal del Instructor:**
  - Consulta en tiempo real de su horario semanal (Lunes a Sábado) por franjas, sedes y ambientes asignados.
  - Resumen de carga semanal (horas programadas vs. tope de 32h para planta o 40h para contrato) y cumplimiento del límite diario (máximo 6h planta o 10h contrato).
  - Consulta de las fichas asignadas y de las materias que orienta.
  - Descarga directa de su horario en formato PDF con diseño institucional.
  - Envío automático de copia de horario a su correo electrónico.
  - Envío de novedades o solicitudes de ajuste dirigidas a la Coordinación Académica.
### 2.3 Regla institucional de Usuario y Contraseña Genérica
Para facilitar el acceso y autenticación tanto del Coordinador como de los 111 Instructores, el sistema implementa la siguiente fórmula automática:
- **Estructura de la clave:** **3 primeras letras del nombre** (en minúsculas, sin tildes) + **4 últimos dígitos de la cédula**.
- **Ejemplos prácticos:**
  - **Coordinador Académico** (Cédula: `1020304567`):
    - Usuario: `coo4567`, `1020304567` o `coordinador`.
    - Contraseña: `coo4567` (3 letras de "Coordinador" + últimos 4 dígitos "4567").
  - **Instructor Carlos Mendoza** (Cédula: `1017200000`):
    - Usuario / Contraseña: `car0000` (3 letras de "Carlos" + últimos 4 dígitos "0000").
  - **Instructora Laura Restrepo** (Cédula: `1017200137`):
    - Usuario / Contraseña: `lau0137` (3 letras de "Laura" + últimos 4 dígitos "0137").
- **Validación flexible:** El sistema es tolerante a mayúsculas/minúsculas y ofrece una opción de autocompletado en el modal de inicio para pruebas ágiles.

---

## 3. Reglas y parámetros del sistema

### 3.1 Planta docente (111 instructores)
- **Instructores de Planta (30):**
  - Carga semanal máxima: **32 horas** directas a formación.
  - Límite diario máximo: **6 horas por día**.
- **Instructores de Contrato (81):**
  - Carga semanal máxima: **40 horas**.
  - Límite diario máximo: **10 horas por día**.
- **Competencias:** Técnica, Transversal y Bilingüismo, con materias específicas asignadas a cada instructor.

### 3.2 Jornadas y franjas horarias
- **Mañana (Lunes a Viernes, 6:00 am – 12:00 m):**
  - Franjas de 3h (`06:00 - 09:00`, `09:00 - 12:00`) o 6h (`06:00 - 12:00`).
  - Meta semanal por ficha: **30 horas**.
- **Tarde (Lunes a Viernes, 12:00 m – 6:00 pm):**
  - Franjas de 3h (`12:00 - 15:00`, `15:00 - 18:00`) o 6h (`12:00 - 18:00`).
  - Meta semanal por ficha: **30 horas**.
- **Noche / Sábado:**
  - Lunes a Viernes de 6:00 pm a 10:00 pm (`18:00 - 22:00`, 4h/día).
  - Sábados de 8:00 am a 4:00 pm (`08:00 - 16:00`, 8h).
  - Meta semanal por ficha: **28 horas**.

### 3.3 Fichas y duración de programas (112 fichas)
- **Programas Técnicos:** 9 meses de etapa lectiva (3 trimestres) + 6 meses de etapa práctica (2 trimestres).
- **Programas Tecnólogos:** 21 meses de etapa lectiva (7 trimestres) + 6 meses de etapa práctica (2 trimestres).
- **Composición semanal requerida por ficha (3 + 2 + 1):**
  - **3** instructores de competencias **Técnicas**.
  - **2** instructores de competencias **Transversales**.
  - **1** instructor de **Bilingüismo**.

### 3.4 Sedes y ambientes
Cada una de las 6 sedes cuenta con ambientes físicos catalogados para evitar cruces de espacios:
- **Torre Norte:** Sala Sistemas 101, Sala Sistemas 102, Lab. Redes 201, Ambiente Gestión 301, Aula Bilingüismo 302.
- **IUSH:** Bloque A - Aula 104, Bloque A - Lab. Software 202, Bloque B - Aula 301, Bloque B - Bilingüismo 305.
- **Bello:** Ambiente 101 - Industrial, Ambiente 102 - Sistemas, Taller Automatización 201, Aula Transversal 204.
- **Copacabana:** Ambiente 101 - Logística, Sala Cómputo 102, Aula Múltiple 201.
- **Zamora:** Ambiente 101 - Contabilidad, Sala Sistemas 103, Aula Bilingüismo 202.
- **San Javier:** Ambiente 101 - Multimedia, Sala Diseño 102, Aula Transversal 201.

---

## 4. Módulos de la aplicación

### 4.1 Planificación Trimestral (Coordinador)
1. Selecciona el trimestre en la esquina superior derecha (`2026-T4`, `2027-T1`, `2027-T2`, `2027-T3`).
2. Revisa el **Balance de Fichas, Instructores y Sedes**:
   - Cantidad de fichas que continúan vs. fichas nuevas.
   - Disponibilidad de instructores por jornada y sede.
   - Panel de **Conflictos de Horario y Desplazamientos**, con acceso directo a la agenda de cada instructor con alertas.

### 4.2 Programación por Instructor (Coordinador)
1. Filtra o busca instructores por nombre, especialidad, tipo de vinculación (**Planta** / **Contrato**), competencia o estado de alertas.
2. Consulta en la parte superior las **materias que orienta** el instructor, su carga semanal y su límite diario.
3. Haz clic en **Asignar bloque** para programar una clase indicando ficha, día, jornada, franja, sede, ambiente y materia.
4. El sistema valida en tiempo real:
   - **Error bloqueante:** Cruce de horario del instructor, cruce en la ficha, cruce de ambiente en la misma sede, o exceso del límite diario/semanal.
   - **Alerta preventiva:** Desplazamiento entre dos sedes distintas en un mismo día.

### 4.3 Programación por Ficha (Coordinador)
1. Busca o filtra las 112 fichas por código, programa, jornada o sede.
2. Verifica el cumplimiento de horas semanales (`30h` o `28h`) y el indicador de composición **3 Técnicos · 2 Transversales · 1 Bilingüismo**.
3. Haz clic en **Programar clase** para asignar un instructor, día, franja, ambiente de la sede y materia.

### 4.4 Descargar PDF y envío de horarios desde luiskasdia@gmail.com
La plataforma incluye un flujo automatizado para remitir los horarios oficiales en PDF desde la cuenta del Coordinador (**luiskasdia@gmail.com**) a los correos de los instructores:
1. **Selección del Instructor:**
   - En el módulo **Descargar PDF**, selecciona el modo **Por Instructor**.
   - Haz clic en cualquiera de los 111 instructores; el sistema carga automáticamente su correo institucional oficial (ejemplo: `carlos.mendoza@sena.edu.co`).
2. **Envío con un solo clic:**
   - Haz clic en el botón verde **"Enviar por Gmail"**.
   - El sistema realiza dos acciones automáticas:
     1. Genera y descarga a tu computador el PDF oficial en formato horizontal institucional (`Programacion_Carlos_Mendoza_2026-T4.pdf`).
     2. Abre directamente la ventana de redacción de Gmail con tu cuenta remitente **luiskasdia@gmail.com**, cargando el destinatario, el asunto institucional y el cuerpo del mensaje con el resumen detallado de clases, ambientes y sedes.
3. **Adjuntar y despachar:**
   - En la ventana abierta de Gmail, arrastra o adjunta el archivo PDF que se acaba de descargar y haz clic en **Enviar**.
4. **Envío por cliente alternativo:**
   - Si prefieres usar Outlook u otra aplicación de correo, puedes usar el botón alternativo de cliente local o simplemente descargar el PDF para anexarlo en tu aplicación preferida.

---

## 5. Guardado, persistencia y retorno al inicio
Los cambios realizados en la programación se guardan automáticamente en el navegador (`localStorage`). En cualquier momento, tanto el coordinador como los instructores pueden hacer clic en el botón **Cambiar Rol** / **Salir al Inicio** de la barra superior para volver a la Landing Page y alternar de usuario.
