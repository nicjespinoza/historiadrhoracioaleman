/**
 * Definiciones de Tipos para los JSON Legacy de Wix
 * Dr. Horacio Aleman - Migración de Datos
 * 
 * Estas interfaces documentan la estructura de los archivos JSON
 * exportados desde Wix antes de la migración a Firestore.
 */

// ============================================
// wix_pacientes.json
// ============================================
interface WixPaciente {
    ID: string;
    "Created Date": string;
    "Updated Date": string;
    Owner: string;
    Nombre: string;
    idunico: string;           // ID único legacy (ej: "HA82700")
    Apellidos: string;
    telefono: string | number;
    registrarCliente: "Activo" | "Pendiente";
    status: "Paciente" | "Recetario";
    userName: string;
    Generatedid: string;
    Sexo: "Masculino" | "Femenino";
    Ocupacion: string;
    Religion: string;
    fechanacimiento: string;   // ISO date string
    edad: string;
    Email: string;
    Guardado: string;
    "Estado civil": "Casado" | "Soltero" | string;
    direccion: string;
    procedencia: string;
    "acompañante": string;
}

// ============================================
// wix_historias.json
// ============================================
interface WixHistoria {
    ID: string;
    "Created Date": string;
    "Updated Date": string;
    Owner: string;
    idunico: string;           // Referencia al paciente (legacyId)
    idrandom: string;          // ID único de la historia (ej: "HI15468")

    // Antecedentes
    "Antecedentes patologicos personales": "Si" | "No" | "";
    "Antecedente personales no patalogicos": "Si" | "No" | "";
    "Historia de la Enfermedad Actual": string;

    // Antropometría
    PesoKG: string;
    AlturaCM: string;
    IMC: string;
    bmiText: string;

    idpaciente: string;        // UUID del paciente en Wix
    Historiapos: "Pendiente" | "Seguimiento";
    creacion: string;          // ISO date string
    quejaPrincipal: string;

    // Ginecología (solo para mujeres)
    Gesta: string | number;
    Para: string | number;
    Aborto: string | number;
    Cesarea: string | number;
    FUR: string;
    FUP: string;
    Menarca: string;
    Menopausia: string;

    // Signos Vitales
    "P/A": string;
    FC: string;
    FR: string;
    Temp: string;
    Spo2: string;

    // Examen Físico
    "Examen Fisico": string;
    Diagnostico: string;
    Pago: "Pendiente" | "Pagado";
    Username: string;
    Sexo: "Masculino" | "Femenino";

    // Patológicos (booleanos como string)
    "Diabetes Mellitus": "Si" | "No" | "";
    "Hipertension arterial": "Si" | "No" | "";
    Alergias: "Si" | "No" | "";
    Cardiopatias: "Si" | "No" | "";
    diabetesMellitus1: string;
    hipertensionArterial1: string;
    cardiopatia1: string;
    cirugiasAnteriores1: "Si" | "No" | "";
    cirugiasAnteriores: string;
    Otros: "Si" | "No" | "";
    Otros1: string;

    // No Patológicos
    Tabaco: "Si" | "No" | "";
    tabaco1: string;
    Alcohol: "Si" | "No" | "";
    alcohol1: string;
    Drogas: "Si" | "No" | "";
    drogas1: string;
    Medicamentos: "Si" | "No" | "";
    Medicamentos1: string;

    // Examen por sistemas
    Neurologico: string;
    Abdomen: string;
    alergias1: string;
    Genitales: string;
    Genitales1: string;
    Miembro: string;
    Tdr: string;

    // Estudios y tratamiento
    Examen: string;
    Radio: string;
    Avaluo: string;
    recetas: string;
    estudiolaboratorio: string;

    // Gráficos
    grafico: "Si" | "No";
    tipografico: string;
    Orden: string;

    historia: "Activo" | "Pendiente";
    Operacion: "Pendiente" | string;
    fechanacimiento: string;
}

// ============================================
// wix_seguimientos.json
// ============================================
interface WixSeguimiento {
    ID: string;
    "Created Date": string;
    "Updated Date": string;
    Owner: string;
    Idrandom: string;          // Referencia a historia
    Idpaciente: string;        // UUID del paciente
    Idunico: string;           // Legacy ID del paciente (ej: "HA18978")
    UserName: string;
    pago: "Pendiente" | "Pagado";
    idunix: string;            // ID único del seguimiento (ej: "S-20145")
    Imagenes: string | object[];
    pdf: string;

    // Signos Vitales
    Fr: string | number;
    Fc: string | number;
    Pa: string;
    Spo2: string | number;
    Temp: string | number;

    // Antropometría
    Imc: string | number;
    Bmitext: string;
    Alturacm: string | number;
    Pesokg: string | number;

    Modo: "Si" | "No";
    seguimiento: string;
    creacion: string;          // ISO date string
    Examenfisico: string;
    enfermedad: string;
    avaluo: string;
    fechanacimiento: string;
    Diagnostico: string;
    Hallazgosadicionales: string;
}

// ============================================
// wix_recetas.json
// ============================================
interface WixReceta {
    ID: string;
    "Created Date": string;
    "Updated Date": string;
    Owner: string;
    "User Name": string;
    Registrarcliente: "Paciente historia" | "Paciente Seguimiento" | "Paciente recetas";
    Generatedid: string;       // ID generado (ej: "HI21594", "S-80800", "RE60082")
    Sexo: "Masculino" | "Femenino";
    Idunico: string;           // Legacy ID del paciente
    usuario: "Activo" | "Pendiente";

    // Tipos de documento (array de strings)
    Tipo: (
        | "Recetario medico"
        | "Estudios radiologicos"
        | "Examen de laboratorio"
        | "Constancia"
        | "Orden de ingreso"
    )[];

    fecharegistro: string;     // ISO date string
    Examen: string;            // Órdenes de laboratorio
    Radio: string;             // Órdenes de radiología
    Recetas: string;           // Texto de medicamentos
    Fechanacimiento: string;
    Idpaciente: string;        // UUID del paciente
    constancia: string;        // Texto de constancia médica
    diagnostico: string;
    procedimiento: string;
    indicaciones: string;      // Indicaciones de ingreso/procedimiento
}

// ============================================
// Tipos exportados para uso en migración
// ============================================
export type {
    WixPaciente,
    WixHistoria,
    WixSeguimiento,
    WixReceta
};
