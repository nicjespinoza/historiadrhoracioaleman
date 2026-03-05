/**
 * Script de Re-Migración Limpia v2
 * AHORA: Usa idunico como doc ID del paciente (para que /app/profile/HA17176 funcione directamente)
 * 1. Borra datos migrados de colecciones raíz
 * 2. Borra subcolecciones migradas
 * 3. Re-crea pacientes con idunico como doc ID
 * 4. Migra historias, seguimientos y recetas a las subcolecciones correspondientes
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'data', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ No se encontró serviceAccountKey.json');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    projectId: 'dr-horacio-aleman'
});

const db = admin.firestore();

// ====== UTILIDADES ======
function cleanString(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return String(v);
    if (typeof v !== 'string') return '';
    return v.trim();
}

function parseDate(d) {
    if (!d) return '';
    try {
        const date = new Date(d);
        return isNaN(date.getTime()) ? '' : date.toISOString();
    } catch { return ''; }
}

function extractTime(d) {
    if (!d) return '';
    try {
        const date = new Date(d);
        return isNaN(date.getTime()) ? '' : date.toTimeString().substring(0, 5);
    } catch { return ''; }
}

function mapBoolean(v) {
    if (!v) return false;
    const n = String(v).toLowerCase().trim();
    return n === 'si' || n === 'sí' || n === 'yes' || n === 'true';
}

// ====== BATCH HELPER ======
class BatchManager {
    constructor(maxOps = 400) {
        this.maxOps = maxOps;
        this.batch = db.batch();
        this.count = 0;
        this.totalCommits = 0;
    }
    async add(ref, data) {
        this.batch.set(ref, data);
        this.count++;
        if (this.count >= this.maxOps) await this.commit();
    }
    async del(ref) {
        this.batch.delete(ref);
        this.count++;
        if (this.count >= this.maxOps) await this.commit();
    }
    async commit() {
        if (this.count > 0) {
            await this.batch.commit();
            this.totalCommits++;
            console.log(`   ✓ Lote ${this.totalCommits} (${this.count} ops)`);
            this.batch = db.batch();
            this.count = 0;
        }
    }
    async finalize() { await this.commit(); }
}

// ====== DELETE COLLECTION ======
async function deleteCollection(collPath) {
    let total = 0;
    let snap;
    do {
        snap = await db.collection(collPath).limit(400).get();
        if (snap.empty) break;
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        total += snap.size;
        console.log(`   ... ${total} eliminados de ${collPath}`);
    } while (snap.size === 400);
    return total;
}

// ====== DELETE ALL PATIENT DOCS AND SUBCOLLECTIONS ======
async function deleteAllPatients() {
    let total = 0;
    let snap;
    do {
        snap = await db.collection('patients').limit(100).get();
        if (snap.empty) break;

        for (const patDoc of snap.docs) {
            // Delete subcollections
            for (const subName of ['histories', 'consults', 'prescriptions', 'observations', 'snapshots']) {
                const subSnap = await patDoc.ref.collection(subName).get();
                if (!subSnap.empty) {
                    const batch = db.batch();
                    subSnap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            }
            // Delete patient doc
            await patDoc.ref.delete();
            total++;
        }
        console.log(`   ... ${total} pacientes eliminados`);
    } while (snap.size === 100);
    return total;
}

// ====== MAIN ======
async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('   RE-MIGRACIÓN LIMPIA v2 (idúnico como ID)');
    console.log('═══════════════════════════════════════════\n');

    const dataPath = path.join(__dirname, 'data');
    const pacientes = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_pacientes.json'), 'utf8'));
    const historias = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_historias.json'), 'utf8'));
    const seguimientos = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_seguimientos.json'), 'utf8'));
    const recetas = JSON.parse(fs.readFileSync(path.join(dataPath, 'wix_recetas.json'), 'utf8'));

    console.log(`📂 Pacientes: ${pacientes.length}`);
    console.log(`📂 Historias: ${historias.length}`);
    console.log(`📂 Seguimientos: ${seguimientos.length}`);
    console.log(`📂 Recetas: ${recetas.length}\n`);

    // === PASO 1: LIMPIAR COLECCIONES RAÍZ LEGACY ===
    console.log('🗑️ [1/6] Limpiando colecciones raíz...');
    let d1 = await deleteCollection('initialHistories');
    console.log(`   ✅ initialHistories: ${d1}`);
    let d2 = await deleteCollection('subsequentConsults');
    console.log(`   ✅ subsequentConsults: ${d2}`);
    let d3 = await deleteCollection('prescriptions');
    console.log(`   ✅ prescriptions: ${d3}\n`);

    // === PASO 2: ELIMINAR TODOS LOS PACIENTES (con subcollecciones) ===
    console.log('🗑️ [2/6] Eliminando TODOS los pacientes existentes...');
    let pDeleted = await deleteAllPatients();
    console.log(`   ✅ ${pDeleted} pacientes eliminados\n`);

    // === PASO 3: CREAR PACIENTES con idunico como doc ID ===
    console.log('👤 [3/6] Creando pacientes con idunico como ID...');
    const patientBatch = new BatchManager(400);
    let pCount = 0;
    const processedIdunicos = new Set();

    for (const wp of pacientes) {
        const idunico = cleanString(wp['idunico']);
        if (!idunico) continue;
        // Skip duplicates (HA52990, HA65510 tienen 2 registros)
        if (processedIdunicos.has(idunico)) {
            console.log(`   ⚠️ Duplicado saltado: ${idunico}`);
            continue;
        }
        processedIdunicos.add(idunico);

        const firstName = cleanString(wp['Nombre']);
        const lastName = cleanString(wp['Apellidos']);
        const status = cleanString(wp['status']).toLowerCase();

        const patientData = {
            firstName, lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            birthDate: parseDate(wp['fechanacimiento']),
            sex: cleanString(wp['Sexo']) || 'Masculino',
            profession: cleanString(wp['Ocupacion']),
            email: cleanString(wp['Email']),
            phone: cleanString(wp['telefono']),
            address: cleanString(wp['direccion']),
            createdAt: parseDate(wp['Created Date']) || new Date().toISOString(),
            registrationSource: 'manual',
            isOnline: false,
            migrated: true,
            civilStatus: cleanString(wp['Estado civil']) || 'Soltero',
            occupation: cleanString(wp['Ocupacion']),
            religion: cleanString(wp['Religion']),
            origin: cleanString(wp['procedencia']),
            companion: cleanString(wp['acompañante']),
            patientType: status === 'recetario' ? 'Recetario' : 'Historia Clinica',
            legacyId: idunico,
            Idunico: idunico,
            legacyWixId: wp['ID'],
            initialReason: ''
        };

        // USE idunico as document ID!
        await patientBatch.add(db.collection('patients').doc(idunico), patientData);
        pCount++;
    }
    await patientBatch.finalize();
    console.log(`   ✅ ${pCount} pacientes creados\n`);

    // === PASO 4: MIGRAR HISTORIAS → patients/{idunico}/histories ===
    console.log('📋 [4/6] Migrando HISTORIAS...');
    const histBatch = new BatchManager(400);
    let hCount = 0, hSkip = 0;

    for (const wh of historias) {
        const idunico = cleanString(wh['idunico']);
        if (!idunico || !processedIdunicos.has(idunico)) { hSkip++; continue; }

        const quejaPrincipal = cleanString(wh['quejaPrincipal']);
        const motives = {};
        if (quejaPrincipal) motives[quejaPrincipal] = true;

        const historyData = {
            patientId: idunico, // patientId = idunico = doc ID
            date: parseDate(wh['creacion'] || wh['Created Date']),
            time: extractTime(wh['creacion'] || wh['Created Date']),
            motives,
            otherMotive: quejaPrincipal,
            evolutionTime: '',
            historyOfPresentIllness: cleanString(wh['Historia de la Enfermedad Actual']),
            currentIllnessHistory: cleanString(wh['Historia de la Enfermedad Actual']),
            // Antecedentes Patológicos
            diabetes: mapBoolean(wh['Diabetes Mellitus']),
            diabetesText: cleanString(wh['diabetesMellitus1']),
            hypertension: mapBoolean(wh['Hipertension arterial']),
            hypertensionText: cleanString(wh['hipertensionArterial1']),
            cardiopathy: mapBoolean(wh['Cardiopatias']),
            cardiopathyText: cleanString(wh['cardiopatia1']),
            allergies: mapBoolean(wh['Alergias']),
            allergiesText: cleanString(wh['alergias1']),
            surgeries: mapBoolean(wh['cirugiasAnteriores1']),
            surgeriesText: cleanString(wh['cirugiasAnteriores']),
            otherPathological: cleanString(wh['Otros1']),
            // Antecedentes No Patológicos
            smoking: mapBoolean(wh['Tabaco']),
            smokingText: cleanString(wh['tabaco1']),
            alcohol: mapBoolean(wh['Alcohol']),
            alcoholText: cleanString(wh['alcohol1']),
            drugs: mapBoolean(wh['Drogas']),
            drugsText: cleanString(wh['drogas1']),
            medications: mapBoolean(wh['Medicamentos']),
            medicationsText: cleanString(wh['Medicamentos1']),
            // Examen Físico
            physicalExamGeneral: cleanString(wh['Examen Fisico']),
            abdomen: cleanString(wh['Abdomen']),
            tdr: cleanString(wh['Tdr']),
            genitals: cleanString(wh['Genitales']),
            limbs: cleanString(wh['Miembro']),
            neurological: cleanString(wh['Neurologico']),
            assessment: cleanString(wh['Avaluo']),
            diagnosis: cleanString(wh['Diagnostico']),
            labStudies: cleanString(wh['estudiolaboratorio']),
            examOrders: cleanString(wh['Examen']),
            radiologyStudies: cleanString(wh['Radio']),
            // Signos Vitales
            vitalSigns: {
                fc: cleanString(wh['FC']),
                fr: cleanString(wh['FR']),
                temp: cleanString(wh['Temp']),
                pa: cleanString(wh['P/A']),
                pam: '',
                sat02: cleanString(wh['Spo2'])
            },
            anthropometrics: {
                weight: cleanString(wh['PesoKG']),
                height: cleanString(wh['AlturaCM']),
                imc: cleanString(wh['IMC'])
            },
            prescriptionNotes: cleanString(wh['recetas']),
            isValidated: true,
            legacyHistoryId: cleanString(wh['idrandom']),
            legacyPatientId: idunico,
            Idunico: idunico,
            idrandom: cleanString(wh['idrandom']),
            Generatedid: cleanString(wh['idrandom'])
        };

        // doc ID = Wix ID for idempotency
        const docRef = db.collection('patients').doc(idunico).collection('histories').doc(wh['ID']);
        await histBatch.add(docRef, historyData);
        hCount++;
    }
    await histBatch.finalize();
    console.log(`   ✅ ${hCount} historias migradas, ${hSkip} sin paciente`);

    // === PASO 5: MIGRAR SEGUIMIENTOS → patients/{idunico}/consults ===
    console.log('📋 [5/6] Migrando SEGUIMIENTOS...');
    const consBatch = new BatchManager(400);
    let cCount = 0, cSkip = 0;

    for (const ws of seguimientos) {
        const idunico = cleanString(ws['Idunico']);
        if (!idunico || !processedIdunicos.has(idunico)) { cSkip++; continue; }

        const seguimiento = cleanString(ws['seguimiento']);
        const motives = {};
        if (seguimiento) motives[seguimiento] = true;

        const consultData = {
            patientId: idunico,
            date: parseDate(ws['creacion'] || ws['Created Date']),
            time: extractTime(ws['creacion'] || ws['Created Date']),
            motives,
            otherMotive: seguimiento,
            evolutionTime: '',
            historyOfPresentIllness: cleanString(ws['enfermedad']),
            physicalExamGeneral: cleanString(ws['Examenfisico']),
            abdomen: '', tdr: '', genitals: '', limbs: '', neurological: '',
            assessment: cleanString(ws['avaluo']),
            diagnosis: cleanString(ws['Diagnostico']),
            labStudies: cleanString(ws['Hallazgosadicionales']),
            examOrders: '', radiologyStudies: '',
            comments: cleanString(ws['enfermedad']),
            vitalSigns: {
                fc: cleanString(ws['Fc']),
                fr: cleanString(ws['Fr']),
                temp: cleanString(ws['Temp']),
                pa: cleanString(ws['Pa']),
                pam: '',
                sat02: cleanString(ws['Spo2'])
            },
            anthropometrics: {
                weight: cleanString(ws['Pesokg']),
                height: cleanString(ws['Alturacm']),
                imc: cleanString(ws['Imc'])
            },
            legacyFollowUpId: cleanString(ws['idunix']),
            legacyPatientId: idunico,
            Idunico: idunico,
            idunix: cleanString(ws['idunix'])
        };

        const docRef = db.collection('patients').doc(idunico).collection('consults').doc(ws['ID']);
        await consBatch.add(docRef, consultData);
        cCount++;
    }
    await consBatch.finalize();
    console.log(`   ✅ ${cCount} seguimientos migrados, ${cSkip} sin paciente\n`);

    // === PASO 6: MIGRAR RECETAS → patients/{idunico}/prescriptions ===
    console.log('💊 [6/6] Migrando RECETAS...');
    const rxBatch = new BatchManager(400);
    let rCount = 0, rSkip = 0;

    for (const wr of recetas) {
        const idunico = cleanString(wr['Idunico']);
        if (!idunico || !processedIdunicos.has(idunico)) { rSkip++; continue; }

        const tipos = wr['Tipo'] || [];

        const rxData = {
            patientId: idunico,
            patientName: cleanString(wr['User Name']),
            date: parseDate(wr['fecharegistro'] || wr['Created Date']),
            createdAt: parseDate(wr['Created Date']),
            prescriptionText: cleanString(wr['Recetas']),
            Recetas: cleanString(wr['Recetas']),
            Examen: cleanString(wr['Examen']),
            Radio: cleanString(wr['Radio']),
            constancia: cleanString(wr['constancia']),
            diagnostico: cleanString(wr['diagnostico']),
            procedimiento: cleanString(wr['procedimiento']),
            indicaciones: cleanString(wr['indicaciones']),
            documentTypes: Array.isArray(tipos) ? tipos : [],
            Tipo: Array.isArray(tipos) ? tipos : [],
            sex: cleanString(wr['Sexo']),
            birthDate: parseDate(wr['Fechanacimiento']),
            status: cleanString(wr['usuario']) || 'Activo',
            legacyId: cleanString(wr['Generatedid']),
            legacyPatientId: idunico,
            Idunico: idunico,
            Generatedid: cleanString(wr['Generatedid']),
            legacyWixId: wr['Idpaciente']
        };

        const docRef = db.collection('patients').doc(idunico).collection('prescriptions').doc(wr['ID']);
        await rxBatch.add(docRef, rxData);
        rCount++;
    }
    await rxBatch.finalize();
    console.log(`   ✅ ${rCount} recetas migradas, ${rSkip} sin paciente\n`);

    console.log('═══════════════════════════════════════════');
    console.log('   ✅ RE-MIGRACIÓN v2 COMPLETADA');
    console.log('═══════════════════════════════════════════');
    console.log(`   Pacientes: ${pCount} (usando idunico como ID)`);
    console.log(`   Historias: ${hCount}`);
    console.log(`   Seguimientos: ${cCount}`);
    console.log(`   Recetas: ${rCount}`);
    console.log('═══════════════════════════════════════════\n');
    process.exit(0);
}

main().catch(e => { console.error('❌ Error fatal:', e); process.exit(1); });
