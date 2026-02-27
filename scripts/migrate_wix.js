
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Service Account
const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'serviceAccountKey.json'), 'utf8')
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Helper to chunk arrays
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
);

// MAPPINGS
const mapSex = (sex) => {
    if (!sex) return 'Masculino'; // Default
    const s = sex.toLowerCase();
    return s.includes('femenin') || s.includes('mujer') ? 'Femenino' : 'Masculino';
};

const mapPatientType = (status) => {
    if (status === 'Historia Clinica') return 'Historia Clinica';
    if (status === 'Recetario') return 'Recetario';
    return 'Historia Clinica'; // Default
};

const clearDatabase = async () => {
    console.log('--- Clearing Database ---');
    // Recursively delete the 'patients' collection and all its subcollections
    // This ensures a clean slate and avoids duplicates
    const patientsRef = db.collection('patients');
    await db.recursiveDelete(patientsRef);
    console.log('Database cleared (patients collection).');
};

const calculateAgeDetails = (birthDateString) => {
    if (!birthDateString) return '';

    const birthDate = new Date(birthDateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} años`);
    if (months > 0) parts.push(`${months} meses`);
    if (days > 0) parts.push(`${days} días`);

    return parts.join(', ') || '0 días';
};

const migratePatients = async () => {
    console.log('--- Migrating Patients ---');
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_pacientes.json'), 'utf8'));

    // Filter - REMOVED to include all patients
    // const patientsToMigrate = rawData.filter(p =>
    //     p.status === 'Historia Clinica' || p.status === 'Recetario'
    // );
    const patientsToMigrate = rawData;

    console.log(`Found ${patientsToMigrate.length} patients to migrate.`);

    const batches = chunk(patientsToMigrate, 400); // Firestore batch limit is 500
    let count = 0;

    for (const batch of batches) {
        const wb = db.batch();

        for (const p of batch) {
            if (!p.idunico) continue;

            const docRef = db.collection('patients').doc(p.idunico);

            // Calculate age details
            const ageDetails = calculateAgeDetails(p.fechanacimiento);

            const patientData = {
                firstName: p.Nombre || '',
                lastName: p.Apellidos || '',
                email: p.email || '',
                phone: p.telefono || '',
                sex: mapSex(p.Sexo),
                occupation: p.Ocupacion || '',
                patientType: mapPatientType(p.status),
                createdAt: p['Created Date'] || new Date().toISOString(),
                updatedAt: p['Updated Date'] || new Date().toISOString(),
                initialReason: '',
                registrationSource: 'manual',
                migrated: true,
                legacyId: p.ID,
                birthDate: p.fechanacimiento ? p.fechanacimiento.split('T')[0] : '',
                ageDetails: ageDetails,

                // Expanded Fields
                civilStatus: p['Estado civil'] || '',
                religion: p.Religion || '',
                origin: p.procedencia || '',
                companion: p.acompañante || '',
                address: p.direccion || ''
            };

            wb.set(docRef, patientData, { merge: true });
            count++;
        }

        await wb.commit();
        console.log(`Migrated ${count} patients...`);
    }
    console.log('Patients migration complete.');
};


const migrateFollowUps = async () => {
    console.log('--- Migrating Follow-Ups (Seguimientos) ---');
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_seguimientos.json'), 'utf8'));

    // Filter valid records
    const recordsToMigrate = rawData.filter(r => r.Idunico && r.Idunico.trim() !== '');
    console.log(`Found ${recordsToMigrate.length} follow-ups to migrate.`);

    const batches = chunk(recordsToMigrate, 400);
    let count = 0;

    for (const batch of batches) {
        const wb = db.batch();

        for (const r of batch) {
            // Create a new doc in 'consults' subcollection
            const consultRef = db.collection('patients').doc(r.Idunico).collection('consults').doc();

            const consultData = {
                date: r['Created Date']?.split('T')[0] || new Date().toISOString().split('T')[0],
                time: r['Created Date']?.split('T')[1]?.substring(0, 5) || '00:00',
                patientId: r.Idunico,
                motives: {},
                otherMotive: 'Seguimiento (Migrado)',
                evolutionTime: '',
                historyOfPresentIllness: `${r.seguimiento || ''}\n${r.enfermedad || ''}`.trim(),

                // Physical Exam
                physicalExamGeneral: r.Examenfisico || '',
                abdomen: '',
                tdr: '',
                genitals: '',
                limbs: '',
                neurological: '',

                assessment: r.avaluo || '',
                diagnosis: r.Diagnostico || '',
                labStudies: '',
                examOrders: '',
                radiologyStudies: '',

                // Vitals (Initialize empty)
                vitalSigns: { fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '' },
                anthropometrics: { weight: '', height: '', imc: '' },

                migrated: true,
                legacyId: r.ID,
                legacyRandomId: r.Idrandom
            };

            wb.set(consultRef, consultData);
            count++;
        }
        await wb.commit();
        console.log(`Migrated ${count} follow-ups...`);
    }
    console.log('Follow-ups migration complete.');
};

const migrateHistories = async () => {

    console.log('--- Migrating Histories ---');
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_historias.json'), 'utf8'));

    console.log(`Found ${rawData.length} histories to migrate.`);

    const batches = chunk(rawData, 400);
    let count = 0;

    for (const batch of batches) {
        const wb = db.batch();

        for (const h of batch) {
            if (!h.idunico) continue;

            const historyRef = db.collection('patients').doc(h.idunico).collection('histories').doc();

            const historyData = {
                date: h['Created Date']?.split('T')[0] || new Date().toISOString().split('T')[0],
                time: h['Created Date']?.split('T')[1]?.substring(0, 5) || '00:00',
                patientId: h.idunico,

                motives: {},
                otherMotive: h.quejaPrincipal || '',

                historyOfPresentIllness: h['Historia de la Enfermedad Actual'] || '',

                diabetes: h.diabetesMellitus1 === 'Si' || h['Diabetes Mellitus'] === 'Si',
                hypertension: h.hipertensionArterial1 === 'Si' || h['Hipertension arterial'] === 'Si',
                cardiopathy: h.cardiopatia1 === 'Si' || h['Cardiopatias'] === 'Si',
                allergies: h.Alergias === 'Si',
                surgeries: h.cirugiasAnteriores1 === 'Si',
                otherPathological: h.Otros || '',

                smoking: h.Tabaco === 'Si',
                alcohol: h.Alcohol === 'Si',
                drugs: h.Drogas === 'Si' || h.drogas1 === 'Si',
                medications: h.Medicamentos || h.Medicamentos1 ? true : false,

                regularMeds: {
                    yes: !!h.Medicamentos || !!h.Medicamentos1,
                    no: !h.Medicamentos && !h.Medicamentos1,
                    list: {},
                    other: (h.Medicamentos || '') + ' ' + (h.Medicamentos1 || ''),
                    specific: ''
                },

                physicalExamGeneral: h['Examen Fisico'] || '',
                abdomen: h.Abdomen || '',
                genitals: h.Genitales || h.Genitales1 || '',
                neurological: h.Neurologico || '',
                limbs: h.Miembro || '',
                tdr: h.Tdr || '',

                assessment: h.Avaluo || '',
                diagnosis: h.Diagnostico || '',
                examOrders: h.Examen || '',
                radiologyStudies: h.Radio || '',

                vitalSigns: {
                    fc: h.FC || '',
                    fr: h.FR || '',
                    temp: h.Temp || '',
                    pa: h['P/A'] || '',
                    pam: '',
                    sat02: h.Spo2 || ''
                },

                legacyPrescription: h.recetas || '',

                isValidated: true,
                migrated: true,
                legacyId: h.ID,
                legacyRandomId: h.idrandom
            };

            wb.set(historyRef, historyData);
            count++;
        }

        await wb.commit();
        console.log(`Migrated ${count} histories...`);
    }
    console.log('Histories migration complete.');
};

const migratePrescriptions = async () => {
    console.log('--- Migrating Prescriptions ---');
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_recetas.json'), 'utf8'));

    console.log(`Found ${rawData.length} prescriptions to migrate.`);

    const batches = chunk(rawData, 400);
    let count = 0;

    for (const batch of batches) {
        const wb = db.batch();

        for (const r of batch) {
            if (!r.Idunico) continue;

            const docRef = db.collection('patients').doc(r.Idunico).collection('prescriptions').doc();

            const prescriptionData = {
                date: r.fecharegistro || r['Created Date'] || new Date().toISOString(),
                patientId: r.Idunico,
                type: r.Tipo || [],

                medications: r.Recetas || '',
                labs: r.Examen || '',
                imaging: r.Radio || '',
                certificate: r.constancia || '',
                indications: r.indicaciones || '',

                diagnosis: r.diagnostico || '',
                procedure: r.procedimiento || '',

                migrated: true,
                legacyId: r.ID,
                legacyRelatedId: r.Generatedid
            };

            wb.set(docRef, prescriptionData);
            count++;
        }

        await wb.commit();
        console.log(`Migrated ${count} prescriptions...`);
    }
    console.log('Prescriptions migration complete.');
};

const main = async () => {
    try {
        await clearDatabase();
        await migratePatients();
        await migrateHistories();
        await migrateFollowUps();
        await migratePrescriptions();
        console.log('All migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

main();
