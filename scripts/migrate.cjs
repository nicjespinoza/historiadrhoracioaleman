/**
 * Script de Migración de Datos: Wix → Firestore
 * Dr. Horacio Aleman - Sistema de Historias Clínicas
 * 
 * Este script procesa los archivos JSON exportados de Wix y los importa
 * a Firestore respetando las interfaces definidas en src/types.ts
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ============================================
// Configuración de Firebase Admin
// ============================================
const serviceAccountPath = path.join(__dirname, 'data', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: No se encontró serviceAccountKey.json en scripts/data/');
    console.error('Por favor, descarga la clave de servicio desde Firebase Console y colócala en scripts/data/serviceAccountKey.json');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'dr-horacio-aleman'
});

const db = admin.firestore();

// ============================================
// Clase BatchManager - Manejo de lotes de Firestore
// ============================================
class BatchManager {
    constructor(batchSize = 400) {
        this.batchSize = batchSize;
        this.currentBatch = db.batch();
        this.operationCount = 0;
        this.totalCommits = 0;
    }

    async add(docRef, data) {
        this.currentBatch.set(docRef, data);
        this.operationCount++;

        if (this.operationCount >= this.batchSize) {
            await this.commit();
        }
    }

    async commit() {
        if (this.operationCount > 0) {
            await this.currentBatch.commit();
            this.totalCommits++;
            console.log(`   ✓ Lote ${this.totalCommits} confirmado (${this.operationCount} documentos)`);
            this.currentBatch = db.batch();
            this.operationCount = 0;
        }
    }

    async finalize() {
        await this.commit();
        return this.totalCommits;
    }
}

// ============================================
// Funciones de Utilidad
// ============================================

/**
 * Limpia y normaliza strings
 */
function cleanString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return String(value);
    if (typeof value !== 'string') return '';
    return value.trim();
}

/**
 * Convierte fechas de Wix (ISO string) a Timestamp de Firestore
 */
function parseWixDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return admin.firestore.Timestamp.fromDate(date);
    } catch (error) {
        return null;
    }
}

/**
 * Convierte fechas de Wix a string ISO para campos que usan string
 */
function parseWixDateToString(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (error) {
        return '';
    }
}

/**
 * Convierte valores "Si"/"Yes" a boolean true, todo lo demás a false
 */
function mapBoolean(value) {
    if (!value) return false;
    const normalized = String(value).toLowerCase().trim();
    return normalized === 'si' || normalized === 'sí' || normalized === 'yes' || normalized === 'true';
}

/**
 * Calcula la edad detallada a partir de fecha de nacimiento
 */
function calculateAgeDetails(birthDateString) {
    if (!birthDateString) return '';
    try {
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return '';

        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} años, ${months} meses, ${days} días`;
    } catch (error) {
        return '';
    }
}

/**
 * Genera un ID único si no existe uno válido
 */
function generateId() {
    return db.collection('_temp').doc().id;
}

/**
 * Extrae hora de una fecha ISO
 */
function extractTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toTimeString().substring(0, 5); // HH:MM
    } catch (error) {
        return '';
    }
}

// ============================================
// Mapeo de Pacientes (wix_pacientes.json → patients)
// ============================================
function mapPatient(wixPatient) {
    const firstName = cleanString(wixPatient['Nombre']);
    const lastName = cleanString(wixPatient['Apellidos']);

    // Determinar patientType basado en 'status'
    const status = cleanString(wixPatient['status']).toLowerCase();
    const patientType = status === 'recetario' ? 'Recetario' : 'Historia Clinica';

    return {
        id: wixPatient['ID'] || generateId(),
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate: parseWixDateToString(wixPatient['fechanacimiento']),
        ageDetails: calculateAgeDetails(wixPatient['fechanacimiento']),
        sex: cleanString(wixPatient['Sexo']) || 'Masculino',
        profession: cleanString(wixPatient['Ocupacion']),
        email: cleanString(wixPatient['Email']),
        phone: cleanString(wixPatient['telefono']),
        address: cleanString(wixPatient['direccion']),
        initialReason: '', // Se puede completar con la primera historia
        createdAt: parseWixDateToString(wixPatient['Created Date']) || new Date().toISOString(),
        registrationSource: 'manual',
        isOnline: false,

        // Campos adicionales
        civilStatus: cleanString(wixPatient['Estado civil']) || 'Soltero',
        occupation: cleanString(wixPatient['Ocupacion']),
        religion: cleanString(wixPatient['Religion']),
        origin: cleanString(wixPatient['procedencia']),
        companion: cleanString(wixPatient['acompañante']),
        patientType: patientType,

        // Campo legacy para trazabilidad
        legacyId: cleanString(wixPatient['idunico']),
        legacyWixId: wixPatient['ID']
    };
}

// ============================================
// Mapeo de Historias Iniciales (wix_historias.json → initialHistories)
// ============================================
function mapInitialHistory(wixHistory, patientIdMap) {
    const legacyPatientId = cleanString(wixHistory['idunico']);
    const patientId = patientIdMap.get(legacyPatientId) || '';

    if (!patientId) {
        console.warn(`   ⚠ Historia sin paciente válido: ${legacyPatientId}`);
    }

    // Crear objeto de motivos de consulta
    const motives = {};
    const quejaPrincipal = cleanString(wixHistory['quejaPrincipal']);
    if (quejaPrincipal) {
        motives[quejaPrincipal] = true;
    }

    // Vital Signs vacíos por defecto
    const vitalSigns = {
        fc: cleanString(wixHistory['FC']),
        fr: cleanString(wixHistory['FR']),
        temp: cleanString(wixHistory['Temp']),
        pa: cleanString(wixHistory['P/A']),
        pam: '',
        sat02: cleanString(wixHistory['Spo2'])
    };

    // Antropometría
    const anthropometrics = {
        weight: cleanString(wixHistory['PesoKG']),
        height: cleanString(wixHistory['AlturaCM']),
        imc: cleanString(wixHistory['IMC'])
    };

    return {
        id: wixHistory['ID'] || generateId(),
        patientId: patientId,
        date: parseWixDateToString(wixHistory['creacion'] || wixHistory['Created Date']),
        time: extractTime(wixHistory['creacion'] || wixHistory['Created Date']),

        // Motivo de consulta
        motives: motives,
        otherMotive: quejaPrincipal,
        evolutionTime: '',
        historyOfPresentIllness: cleanString(wixHistory['Historia de la Enfermedad Actual']),

        // Antecedentes Patológicos (convertir de Si/No a boolean)
        diabetes: mapBoolean(wixHistory['Diabetes Mellitus']),
        hypertension: mapBoolean(wixHistory['Hipertension arterial']),
        cardiopathy: mapBoolean(wixHistory['Cardiopatias']),
        allergies: mapBoolean(wixHistory['Alergias']),
        surgeries: mapBoolean(wixHistory['cirugiasAnteriores1']),
        otherPathological: cleanString(wixHistory['Otros1']) || cleanString(wixHistory['cirugiasAnteriores']),

        // Antecedentes No Patológicos
        smoking: mapBoolean(wixHistory['Tabaco']),
        alcohol: mapBoolean(wixHistory['Alcohol']),
        drugs: mapBoolean(wixHistory['Drogas']),
        medications: mapBoolean(wixHistory['Medicamentos']),

        // Examen Físico y Notas
        currentIllnessHistory: cleanString(wixHistory['Historia de la Enfermedad Actual']),
        physicalExamGeneral: cleanString(wixHistory['Examen Fisico']),
        abdomen: cleanString(wixHistory['Abdomen']),
        tdr: cleanString(wixHistory['Tdr']),
        genitals: cleanString(wixHistory['Genitales']),
        limbs: cleanString(wixHistory['Miembro']),
        neurological: cleanString(wixHistory['Neurologico']),
        assessment: cleanString(wixHistory['Avaluo']),
        diagnosis: cleanString(wixHistory['Diagnostico']),
        labStudies: cleanString(wixHistory['estudiolaboratorio']),
        examOrders: cleanString(wixHistory['Examen']),
        radiologyStudies: cleanString(wixHistory['Radio']),

        // Signos vitales y antropometría
        vitalSigns: vitalSigns,
        anthropometrics: anthropometrics,

        // Campos legacy opcionales
        isValidated: true,

        // Metadata
        legacyHistoryId: cleanString(wixHistory['idrandom']),
        legacyPatientId: legacyPatientId,
        prescriptionNotes: cleanString(wixHistory['recetas'])
    };
}

// ============================================
// Mapeo de Seguimientos (wix_seguimientos.json → subsequentConsults)
// ============================================
function mapSubsequentConsult(wixSeguimiento, patientIdMap) {
    const legacyPatientId = cleanString(wixSeguimiento['Idunico']);
    const patientId = patientIdMap.get(legacyPatientId) || '';

    if (!patientId) {
        console.warn(`   ⚠ Seguimiento sin paciente válido: ${legacyPatientId}`);
    }

    // Motivos de consulta
    const motives = {};
    const seguimiento = cleanString(wixSeguimiento['seguimiento']);
    if (seguimiento) {
        motives[seguimiento] = true;
    }

    // Vital Signs
    const vitalSigns = {
        fc: cleanString(wixSeguimiento['Fc']),
        fr: cleanString(wixSeguimiento['Fr']),
        temp: cleanString(wixSeguimiento['Temp']),
        pa: cleanString(wixSeguimiento['Pa']),
        pam: '',
        sat02: cleanString(wixSeguimiento['Spo2'])
    };

    // Antropometría
    const anthropometrics = {
        weight: cleanString(wixSeguimiento['Pesokg']),
        height: cleanString(wixSeguimiento['Alturacm']),
        imc: cleanString(wixSeguimiento['Imc'])
    };

    return {
        id: wixSeguimiento['ID'] || generateId(),
        patientId: patientId,
        date: parseWixDateToString(wixSeguimiento['creacion'] || wixSeguimiento['Created Date']),
        time: extractTime(wixSeguimiento['creacion'] || wixSeguimiento['Created Date']),

        // Motivo y evolución
        motives: motives,
        otherMotive: seguimiento,
        evolutionTime: '',
        historyOfPresentIllness: cleanString(wixSeguimiento['enfermedad']),

        // Signos vitales
        vitalSigns: vitalSigns,
        anthropometrics: anthropometrics,

        // Examen físico
        physicalExamGeneral: cleanString(wixSeguimiento['Examenfisico']),
        abdomen: '',
        tdr: '',
        genitals: '',
        limbs: '',
        neurological: '',
        assessment: cleanString(wixSeguimiento['avaluo']),
        diagnosis: cleanString(wixSeguimiento['Diagnostico']),
        labStudies: cleanString(wixSeguimiento['Hallazgosadicionales']),
        examOrders: '',
        radiologyStudies: '',

        // Legacy
        comments: cleanString(wixSeguimiento['enfermedad']),
        legacyFollowUpId: cleanString(wixSeguimiento['idunix']),
        legacyPatientId: legacyPatientId
    };
}

// ============================================
// Mapeo de Recetas (wix_recetas.json → prescriptions)
// ============================================
function mapPrescription(wixReceta, patientIdMap) {
    const legacyPatientId = cleanString(wixReceta['Idunico']);
    const patientId = patientIdMap.get(legacyPatientId) || '';

    if (!patientId) {
        console.warn(`   ⚠ Receta sin paciente válido: ${legacyPatientId}`);
    }

    // Tipos de receta
    const tipos = wixReceta['Tipo'] || [];
    const tiposNormalized = Array.isArray(tipos) ? tipos : [];

    return {
        id: wixReceta['ID'] || generateId(),
        patientId: patientId,
        patientName: cleanString(wixReceta['User Name']),
        date: parseWixDateToString(wixReceta['fecharegistro'] || wixReceta['Created Date']),
        createdAt: parseWixDateToString(wixReceta['Created Date']),

        // Contenido de la receta
        prescriptionText: cleanString(wixReceta['Recetas']),
        labOrders: cleanString(wixReceta['Examen']),
        imagingOrders: cleanString(wixReceta['Radio']),
        diagnosis: cleanString(wixReceta['diagnostico']),
        procedure: cleanString(wixReceta['procedimiento']),
        instructions: cleanString(wixReceta['indicaciones']),
        certificate: cleanString(wixReceta['constancia']),

        // Tipos de documento
        documentTypes: tiposNormalized,

        // Metadata
        sex: cleanString(wixReceta['Sexo']),
        birthDate: parseWixDateToString(wixReceta['Fechanacimiento']),
        status: cleanString(wixReceta['usuario']) || 'Activo',

        // Legacy
        legacyId: cleanString(wixReceta['Generatedid']),
        legacyPatientId: legacyPatientId,
        legacyWixId: wixReceta['Idpaciente']
    };
}

// ============================================
// Función Principal de Migración
// ============================================
async function migrate() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   MIGRACIÓN DE DATOS: Wix → Firestore');
    console.log('   Dr. Horacio Aleman - Sistema de Historias Clínicas');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const dataPath = path.join(__dirname, 'data');

    // Verificar que existan los archivos
    const requiredFiles = ['wix_pacientes.json', 'wix_historias.json', 'wix_seguimientos.json', 'wix_recetas.json'];
    for (const file of requiredFiles) {
        const filePath = path.join(dataPath, file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ERROR: No se encontró ${file}`);
            process.exit(1);
        }
    }

    // Cargar datos
    console.log('📂 Cargando archivos JSON...');
    const pacientes = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_pacientes.json'), 'utf8'));
    const historias = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_historias.json'), 'utf8'));
    const seguimientos = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_seguimientos.json'), 'utf8'));
    const recetas = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_recetas.json'), 'utf8'));

    console.log(`   ✓ Pacientes: ${pacientes.length} registros`);
    console.log(`   ✓ Historias: ${historias.length} registros`);
    console.log(`   ✓ Seguimientos: ${seguimientos.length} registros`);
    console.log(`   ✓ Recetas: ${recetas.length} registros\n`);

    // Mapa para vincular legacyId (idunico) con el nuevo ID de Firestore
    const patientIdMap = new Map();

    let successCount = 0;
    let errorCount = 0;

    // ========================================
    // 1. MIGRAR PACIENTES
    // ========================================
    console.log('👤 [1/4] Migrando PACIENTES a colección "patients"...');
    const patientBatch = new BatchManager(400);

    for (const wixPatient of pacientes) {
        try {
            const patient = mapPatient(wixPatient);
            const docId = wixPatient['ID']; // Usar ID original de Wix

            // Guardar mapeo para referencias posteriores
            if (patient.legacyId) {
                patientIdMap.set(patient.legacyId, docId);
            }

            const docRef = db.collection('patients').doc(docId);
            await patientBatch.add(docRef, patient);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Error en paciente ${wixPatient['idunico']}: ${error.message}`);
            errorCount++;
        }
    }
    await patientBatch.finalize();
    console.log(`   ✅ Pacientes migrados: ${successCount} exitosos, ${errorCount} errores\n`);

    // ========================================
    // 2. MIGRAR HISTORIAS INICIALES
    // ========================================
    console.log('📋 [2/4] Migrando HISTORIAS INICIALES a colección "initialHistories"...');
    const historyBatch = new BatchManager(400);
    successCount = 0;
    errorCount = 0;

    for (const wixHistory of historias) {
        try {
            const history = mapInitialHistory(wixHistory, patientIdMap);
            const docId = wixHistory['ID'];

            const docRef = db.collection('initialHistories').doc(docId);
            await historyBatch.add(docRef, history);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Error en historia ${wixHistory['idrandom']}: ${error.message}`);
            errorCount++;
        }
    }
    await historyBatch.finalize();
    console.log(`   ✅ Historias migradas: ${successCount} exitosos, ${errorCount} errores\n`);

    // ========================================
    // 3. MIGRAR SEGUIMIENTOS
    // ========================================
    console.log('🔄 [3/4] Migrando SEGUIMIENTOS a colección "subsequentConsults"...');
    const followUpBatch = new BatchManager(400);
    successCount = 0;
    errorCount = 0;

    for (const wixSeguimiento of seguimientos) {
        try {
            const followUp = mapSubsequentConsult(wixSeguimiento, patientIdMap);
            const docId = wixSeguimiento['ID'];

            const docRef = db.collection('subsequentConsults').doc(docId);
            await followUpBatch.add(docRef, followUp);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Error en seguimiento ${wixSeguimiento['idunix']}: ${error.message}`);
            errorCount++;
        }
    }
    await followUpBatch.finalize();
    console.log(`   ✅ Seguimientos migrados: ${successCount} exitosos, ${errorCount} errores\n`);

    // ========================================
    // 4. MIGRAR RECETAS
    // ========================================
    console.log('💊 [4/4] Migrando RECETAS a colección "prescriptions"...');
    const prescriptionBatch = new BatchManager(400);
    successCount = 0;
    errorCount = 0;

    for (const wixReceta of recetas) {
        try {
            const prescription = mapPrescription(wixReceta, patientIdMap);
            const docId = wixReceta['ID'];

            const docRef = db.collection('prescriptions').doc(docId);
            await prescriptionBatch.add(docRef, prescription);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Error en receta ${wixReceta['Generatedid']}: ${error.message}`);
            errorCount++;
        }
    }
    await prescriptionBatch.finalize();
    console.log(`   ✅ Recetas migradas: ${successCount} exitosos, ${errorCount} errores\n`);

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ MIGRACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   📊 Total pacientes procesados: ${pacientes.length}`);
    console.log(`   📊 Total historias procesadas: ${historias.length}`);
    console.log(`   📊 Total seguimientos procesados: ${seguimientos.length}`);
    console.log(`   📊 Total recetas procesadas: ${recetas.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
}

// Ejecutar migración
migrate().catch((error) => {
    console.error('❌ Error fatal en migración:', error);
    process.exit(1);
});
