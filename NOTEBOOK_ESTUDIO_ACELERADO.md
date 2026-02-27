# 📓 NOTEBOOK DE ESTUDIO ACELERADO — MediRecord Pro
## ¡Practica, Domina, Despliega! 🚀

> **Meta:** Entender el 100% del proyecto en 21 días con ejercicios prácticos diarios.
> **Requisitos:** Node.js 20+, VS Code, Firebase CLI, Git

---

## 🏁 DÍA 1: Primeros Pasos (Setup + Exploración)

### 📖 Teoría Rápida (15 min)
El proyecto tiene 3 capas:
1. **Frontend:** Next.js + React → lo que ve el usuario
2. **Backend:** Firebase Cloud Functions → lógica del servidor
3. **Database:** Firestore → donde se guardan los datos

### 🏋️ EJERCICIO 1.1 — Levantar el proyecto
```bash
# 1. Instalar dependencias
npm install

# 2. Verificar el archivo .env.local existe
cat .env.local

# 3. Levantar el servidor de desarrollo
npm run dev

# 4. Abrir http://localhost:3000 en el navegador
# 5. Abrir http://localhost:3000/app/doctor/login
```

### 🏋️ EJERCICIO 1.2 — Mapear las pantallas
Visita CADA una de estas URLs y anota qué hace:
```
http://localhost:3000                    → ¿Qué ves? _______________
http://localhost:3000/app/doctor/login   → ¿Qué ves? _______________
http://localhost:3000/app/patient/login  → ¿Qué ves? _______________
```

### 🏋️ EJERCICIO 1.3 — Explorar archivos clave
Abre estos archivos en VS Code y lee los primeros 20 líneas de cada uno:
```
□ package.json          → ¿Cuántas dependencias tiene? ____
□ api.ts                → ¿Cuántas funciones exporta el objeto api? ____
□ src/types.ts          → ¿Cuántas interfaces tiene? ____
□ firestore.rules       → ¿Cuántas líneas tiene? ____
□ src/AppRoutes.tsx     → ¿Cuántas rutas define? ____
```

### ✅ Autoevaluación Día 1:
```
□ Puedo levantar el proyecto con `npm run dev`
□ Conozco las 3 URLs principales
□ Sé dónde están los archivos más importantes
```

---

## 🔥 DÍA 2: La Base de Datos (Firestore)

### 📖 Teoría Rápida (10 min)
Firestore organiza datos en **Colecciones** → **Documentos** → **Campos**
```
patients (Colección)
  ├── abc123 (Documento)
  │     ├── firstName: "Juan"
  │     ├── lastName: "Pérez"
  │     └── email: "juan@example.com"
  └── def456 (Documento)
        ├── firstName: "María"
        └── ...
```

### 🏋️ EJERCICIO 2.1 — Leer el modelo de datos
Abre `src/types.ts` y responde:

```
1. ¿Qué campos tiene la interfaz Patient?
   Enumera al menos 10: _______________________________________________

2. ¿Qué campos tiene InitialHistory?
   Enumera los de "Antecedentes Patológicos": ___________________________

3. ¿Qué campos tiene SubsequentConsult?
   ¿Tiene los mismos signos vitales que InitialHistory? (Sí/No): ____

4. ¿Qué campos tiene Appointment?
   ¿Cuáles son los tipos de cita? ____________________________________
```

### 🏋️ EJERCICIO 2.2 — Explorar Firestore Console
```
1. Ir a https://console.firebase.google.com
2. Seleccionar el proyecto "dr-horacio-aleman"
3. Ir a Firestore Database
4. Explorar la colección "patients"
5. ¿Cuántos pacientes hay? ____
6. Abrir un paciente y explorar sus sub-colecciones
7. ¿Tiene historial? (Sí/No): ____
8. ¿Tiene consultas? (Sí/No): ____
```

### 🏋️ EJERCICIO 2.3 — Trazar una operación CRUD
Abre `api.ts` y sigue la función `createPatient`:

```javascript
// Pregunta: ¿Qué hace cada línea?
createPatient: async (data: Omit<Patient, 'id'> | Patient): Promise<Patient> => {
    // Línea 1: ¿Qué hace? ___________________________________
    const { id, ...patientData } = data as Patient;

    // Línea 2: ¿A qué colección escribe? ____________________
    const docRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: new Date().toISOString()
    });

    // Línea 3: ¿Qué retorna? ________________________________
    return { id: docRef.id, ...patientData } as Patient;
}
```

### ✅ Autoevaluación Día 2:
```
□ Sé cuántas colecciones tiene la base de datos
□ Entiento la estructura Patient → histories → consults
□ Puedo leer y entender funciones CRUD en api.ts
```

---

## 🔒 DÍA 3: Seguridad (Firestore Rules)

### 📖 Teoría Rápida (10 min)
Las Firestore Rules son el **guardián** de la base de datos. Cada operación (leer, escribir, crear, borrar) pasa por estas reglas ANTES de ejecutarse.

### 🏋️ EJERCICIO 3.1 — Entender las funciones helper
Abre `firestore.rules` y traduce estas funciones:

```
isAuthenticated() → ¿Qué verifica? _________________________________
getUserRole()     → ¿De dónde obtiene el rol? _______________________
isDoctor()        → ¿Qué combina? __________________________________
isPrivileged()    → ⚠️ ¿Qué problema tiene ACTUALMENTE? _____________
isOwner(userId)   → ¿Cómo compara? _________________________________
```

### 🏋️ EJERCICIO 3.2 — Analizar reglas de pacientes
Lee las reglas de `match /patients/{patientId}` y responde:

```
1. ¿Quién puede CREAR un paciente?
   R: _______________________________________________________________

2. ¿Quién puede LEER un paciente?
   R: _______________________________________________________________

3. ¿Se pueden BORRAR pacientes?
   R: _________ ¿Por qué? ___________________________________________

4. ¿Qué validaciones tiene el CREATE?
   R: _______________________________________________________________
```

### 🏋️ EJERCICIO 3.3 — Encontrar la vulnerabilidad
```
🔴 RETO: Encuentra la línea en isPrivileged() que permite acceso
   a CUALQUIER usuario autenticado.
   
   Línea #: ____
   ¿Qué cambiarías para corregirlo? ________________________________
```

### ✅ Autoevaluación Día 3:
```
□ Entiendo el concepto de Firestore Security Rules
□ Puedo leer y entender cada función helper
□ Encontré la vulnerabilidad de seguridad
□ Sé cómo corregirla
```

---

## ⚛️ DÍA 4: React Fundamentals en el Proyecto

### 📖 Teoría Rápida (10 min)
React usa **componentes** (funciones que retornan HTML/JSX).
Cada componente puede tener:
- `useState` → datos que cambian
- `useEffect` → código que se ejecuta al montar/actualizar
- `props` → datos que recibe de su padre

### 🏋️ EJERCICIO 4.1 — Anatomía de un Screen
Abre `src/screens/LoginScreen.tsx` y identifica:

```
1. ¿Qué hooks usa? (useState, useEffect, custom hooks)
   R: _______________________________________________________________

2. ¿Qué importa de react-router-dom?
   R: _______________________________________________________________

3. ¿Cómo maneja el submit del formulario?
   R: _______________________________________________________________

4. ¿Usa React Hook Form? (Sí/No): ____
```

### 🏋️ EJERCICIO 4.2 — Trazar el flujo de datos
Abre `src/screens/DoctorDashboard.tsx` y traza:

```
1. ¿Qué estado (useState) mantiene?
   - patients: _____
   - selectedPatient: _____
   - ¿otros?: _______________________________________________

2. ¿Cuándo carga los datos? (useEffect)
   R: _______________________________________________________________

3. ¿Cómo pasa datos a las sub-pantallas?
   R: _______________________________________________________________
```

### 🏋️ EJERCICIO 4.3 — RETO PRÁCTICO
```
Modifica LoginScreen.tsx para agregar un texto de bienvenida:
  "Bienvenido al Sistema de Historia Clínica"
  debajo del formulario de login.

¿Funcionó? (Sí/No): ____
¿Qué aprendiste? ________________________________________________
```

### ✅ Autoevaluación Día 4:
```
□ Entiendo la estructura de un componente React en el proyecto
□ Puedo identificar useState, useEffect, y props
□ Puedo hacer modificaciones simples al JSX
```

---

## 📝 DÍA 5: Forms + Validación (Zod + React Hook Form)

### 🏋️ EJERCICIO 5.1 — Analizar el esquema de paciente
Abre `src/schemas/patientSchemas.ts` y responde:

```
1. ¿Cuántos campos tiene patientSchema?
   R: ____

2. ¿Cuáles son obligatorios (min(1))?
   R: _______________________________________________________________

3. ¿Cuál es el default de patientType?
   R: ____________________

4. ¿Cuántos esquemas exporta el archivo en total?
   R: ____
```

### 🏋️ EJERCICIO 5.2 — Trazar el RegisterScreen
Abre `src/screens/RegisterScreen.tsx` y identifica:

```
1. ¿Qué schema usa para validación?
   R: ____________________

2. ¿Cómo initializa el form?
   R: useForm<____>({ resolver: zodResolver(____) })

3. ¿Qué pasa cuando se envía el formulario?
   R: api._________(data) → navega a _______________

4. ¿Cuáles son los departamentos de Nicaragua listados?
   R: (Lista al menos 5) ____________________________________________
```

### 🏋️ EJERCICIO 5.3 — RETO: Agregar campo nuevo
```
Agregar "Tipo de Sangre" al formulario de registro:
1. Agregar al schema en patientSchemas.ts:
   bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional()

2. Agregar al tipo Patient en types.ts:
   bloodType?: string;

3. Agregar el campo visual en RegisterScreen.tsx

¿Funcionó? (Sí/No): ____
```

---

## ☁️ DÍA 6: Cloud Functions

### 🏋️ EJERCICIO 6.1 — Inventario de funciones
Abre `functions/src/index.ts` y lista TODAS las funciones exportadas:

```
Funciones callable (onCall):
1. createPaymentIntent → ________________________________
2. initiatePayment → ____________________________________
3. generateAIAnalysis → _________________________________
4. getDashboardAdvancedStats → ___________________________

Funciones HTTP (onRequest):
5. stripeWebhook → ______________________________________
6. tilopayWebhook → _____________________________________

Funciones Scheduled (onSchedule):
7. sendAppointmentReminders → ____________________________

Funciones importadas de admin.ts:
8-15: _____________________________________________________
```

### 🏋️ EJERCICIO 6.2 — Trazar el flujo de pagos
```
Flujo de un pago con Stripe:
1. Frontend llama → ____________________
2. Cloud Function verifica → ____________________
3. Cloud Function llama a Stripe → ____________________
4. Stripe devuelve → ____________________
5. Se retorna al frontend → ____________________
```

### 🏋️ EJERCICIO 6.3 — Entender los roles
```
Abre functions/src/roles.ts:

1. ¿Cuáles son los 4 roles?
   R: _____________, _____________, _____________, _____________

2. ¿Qué permisos tiene 'patient'?
   R: _______________________________________________________________

3. ¿Qué permisos tiene 'doctor'?
   R: _______________________________________________________________

4. ¿Cómo se asigna un rol? (Custom Claims vs. Firestore)
   R: _______________________________________________________________
```

---

## 🚀 DÍA 7-14: Práctica Intensiva

### 🏋️ RETOS DIARIOS

```
Día 7:  Modifica la Landing Page → cambia el título principal
Día 8:  Crea un nuevo componente "PatientCard" reutilizable
Día 9:  Agrega un filtro por sexo en PatientListScreen
Día 10: Crea una Cloud Function que cuente citas del mes
Día 11: Agrega una columna "Edad" a la lista de pacientes
Día 12: Implementa paginación en la lista de citas
Día 13: Crea un test unitario para `api.createPatient`
Día 14: MEGA RETO: Crea una pantalla "Notas Quirúrgicas"
```

---

## 🎯 DÍA 15-21: Producción & Deploy

### 🏋️ EJERCICIO 15 — Build de producción
```bash
# Construir el proyecto
npm run build

# ¿Hay errores? (Sí/No): ____
# Si sí, ¿cuáles? ________________________________________________
```

### 🏋️ EJERCICIO 16 — Deploy a Firebase
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo functions
cd functions && npm run build && cd ..
firebase deploy --only functions

# Deploy todo
firebase deploy
```

### 🏋️ EJERCICIO 17 — Monitorear costos
```
1. Ir a Firebase Console → Usage and billing
2. ¿Cuántas lecturas de Firestore hubo hoy? ____
3. ¿Cuántas invocaciones de Functions? ____
4. ¿Cuál es el costo estimado del mes? ____
```

---

## 📊 EXAMEN FINAL

Responde sin ver el código:

```
1. ¿Cuántas colecciones principales tiene Firestore?
   R: ____

2. ¿Cuáles son las 3 sub-colecciones de patients?
   R: _____________, _____________, _____________

3. ¿En qué archivo está la función createPatient?
   R: ____________________

4. ¿Qué archivo define las reglas de seguridad?
   R: ____________________

5. ¿Cuántos roles de usuario tiene el sistema?
   R: ____ (nómbralos: _______________________________________)

6. ¿Qué pasarelas de pago están integradas?
   R: _____________, _____________, _____________

7. ¿Qué hace el modelo 3D (Body3DDesigner)?
   R: _______________________________________________________________

8. ¿Qué framework CSS usa el proyecto?
   R: ____________________

9. ¿Dónde se ejecutan las Cloud Functions?
   R: ____________________

10. ¿Cuál es la vulnerabilidad más crítica que encontramos?
    R: _______________________________________________________________
```

**Puntuación:**
- 10/10 = ¡Eres un experto! 🏆
- 7-9/10 = Muy bien, repasa los puntos que fallaste
- 4-6/10 = Necesitas repasar los días correspondientes
- 0-3/10 = Vuelve a empezar desde el Día 1

---

## 🔑 RESPUESTAS DEL EXAMEN

<details>
<summary>Click para ver respuestas (¡solo después de intentar!)</summary>

```
1. 5 colecciones: patients, appointments, users, chatRooms, auditLogs
2. histories, consults, observations (también: prescriptions, snapshots)
3. api.ts
4. firestore.rules
5. 4: admin, doctor, assistant, patient
6. Stripe, TiloPay, PowerTranz
7. Modelo 3D del cuerpo para marcar observaciones anatómicas
8. TailwindCSS (v4)
9. Firebase Cloud Functions (Node.js 20)
10. `true ||` en isPrivileged() permite acceso a cualquier usuario autenticado
```

</details>

---

*¡Éxito en tu aprendizaje! 💪*
