// Script to clear all patients from Firestore
// Run with: node clear-data.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD4DCL5CbT69g-ITeIj4Mpe0Q13XzxJZ28",
    authDomain: "historia-clinica-2026.firebaseapp.com",
    projectId: "historia-clinica-2026",
    storageBucket: "historia-clinica-2026.firebasestorage.app",
    messagingSenderId: "1014260808706",
    appId: "1:1014260808706:web:9c2e8a5e1c8f7d3a2b4c5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllData() {
    console.log('🗑️ Eliminando todos los pacientes de Firestore...\n');

    try {
        // Get all patients
        const patientsSnapshot = await getDocs(collection(db, 'patients'));

        if (patientsSnapshot.empty) {
            console.log('No hay pacientes para eliminar.');
            process.exit(0);
        }

        console.log(`Encontrados ${patientsSnapshot.docs.length} pacientes:`);

        for (const patientDoc of patientsSnapshot.docs) {
            const patientData = patientDoc.data();
            console.log(`  - ${patientData.firstName} ${patientData.lastName} (ID: ${patientDoc.id})`);

            // Delete subcollections first (histories, consults, observations, snapshots)
            const subcollections = ['histories', 'consults', 'observations', 'snapshots'];
            for (const subcol of subcollections) {
                const subSnapshot = await getDocs(collection(db, 'patients', patientDoc.id, subcol));
                for (const subDoc of subSnapshot.docs) {
                    await deleteDoc(doc(db, 'patients', patientDoc.id, subcol, subDoc.id));
                }
                if (subSnapshot.docs.length > 0) {
                    console.log(`    ↳ Eliminados ${subSnapshot.docs.length} ${subcol}`);
                }
            }

            // Delete the patient document
            await deleteDoc(doc(db, 'patients', patientDoc.id));
            console.log(`    ✅ Paciente eliminado`);
        }

        // Also clear appointments
        const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
        if (!appointmentsSnapshot.empty) {
            console.log(`\nEliminando ${appointmentsSnapshot.docs.length} citas...`);
            for (const appointmentDoc of appointmentsSnapshot.docs) {
                await deleteDoc(doc(db, 'appointments', appointmentDoc.id));
            }
            console.log('✅ Citas eliminadas');
        }

        console.log('\n✅ ¡Todos los datos han sido eliminados!');
        console.log('Ahora puedes crear pacientes nuevos (manual u online).');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

clearAllData();
