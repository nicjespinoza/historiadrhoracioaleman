import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
<<<<<<< HEAD
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
=======
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ============================================================
// NIVEL 2: FIREBASE APP CHECK - Anti-Bots & DDoS Protection
// ============================================================
// INSTRUCCIONES PARA ACTIVAR:
// 1. Ve a Firebase Console > App Check > Apps
// 2. Registra tu app web con reCAPTCHA Enterprise
// 3. Copia la "Site Key" (empieza con 6L...) y reemplaza el placeholder abajo
// 4. NO uses contraseñas ni claves secretas aquí, solo la Site Key pública

<<<<<<< HEAD
// Solo activar en producción y en el cliente para evitar problemas en SSG
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
=======
// Solo activar en producción para evitar problemas en desarrollo
if (import.meta.env.PROD) {
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(
                // ⚠️ REEMPLAZA ESTE VALOR CON TU SITE KEY DE RECAPTCHA ENTERPRISE
                // La encuentras en: Firebase Console > App Check > Apps > reCAPTCHA Enterprise
<<<<<<< HEAD
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "PON_AQUI_TU_SITE_KEY_DE_FIREBASE_CONSOLE"
=======
                import.meta.env.VITE_RECAPTCHA_SITE_KEY || "PON_AQUI_TU_SITE_KEY_DE_FIREBASE_CONSOLE"
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
            ),
            isTokenAutoRefreshEnabled: true // Auto-refresh del token para seguridad continua
        });
        console.log("✅ App Check inicializado correctamente");
    } catch (error) {
        console.warn("⚠️ App Check no pudo inicializarse:", error);
    }
}

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
