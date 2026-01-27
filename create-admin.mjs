// Run this script once to create the admin user in Firebase
// Execute with: node --experimental-modules create-admin.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD4DCL5CbT69g-ITeIj4Mpe0Q13XzxJZ28",
    authDomain: "historia-clinica-2026.firebaseapp.com",
    projectId: "historia-clinica-2026",
    storageBucket: "historia-clinica-2026.firebasestorage.app",
    messagingSenderId: "1014260808706",
    appId: "1:1014260808706:web:9c2e8a5e1c8f7d3a2b4c5d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            'admin@webdesign.com',
            '198519'  // Firebase requires minimum 6 characters
        );
        console.log('✅ Usuario admin creado exitosamente!');
        console.log('Email:', userCredential.user.email);
        console.log('UID:', userCredential.user.uid);
        console.log('Nueva contraseña: 198519');
        process.exit(0);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('⚠️ El usuario ya existe. Puedes iniciar sesión con la contraseña existente.');
        } else if (error.code === 'auth/weak-password') {
            console.log('❌ Error: La contraseña es muy débil (mínimo 6 caracteres)');
        } else {
            console.error('❌ Error al crear usuario:', error.message);
            console.error('Código:', error.code);
        }
        process.exit(1);
    }
}

createAdmin();
