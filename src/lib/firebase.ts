import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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

// Solo activar en producción y en el cliente para evitar problemas en SSG
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(
                // ⚠️ REEMPLAZA ESTE VALOR CON TU SITE KEY DE RECAPTCHA ENTERPRISE
                // La encuentras en: Firebase Console > App Check > Apps > reCAPTCHA Enterprise
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "PON_AQUI_TU_SITE_KEY_DE_FIREBASE_CONSOLE"
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
