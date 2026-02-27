import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret, defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin
admin.initializeApp();

// Export PowerTranz payment functions
export { processPowerTranzPayment, verifyPowerTranzPayment, powertranzCallback } from "./powertranz";
export { processTiloPayPayment } from "./tilopay";

// Export Admin functions (roles, tokens, audit logs)
export {
    assignUserRole,
    revokeRole,
    renewToken,
    forceLogout,
    checkTokenExpiration,
    getAuditLogs,
    getAuditStats,
    listUsers,
    toggleUserStatus,
} from "./admin";

// Re-export audit log utilities for use in other functions
export { createAuditLog, logPaymentEvent, logMedicalRecordDeletion } from "./auditLogs";
export { setUserRole, getUserRole, isAdmin, isPrivileged, isTokenExpired, ASSIGNABLE_ROLES, ROLE_NAMES } from "./roles";

// Define secrets for different payment gateways
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const tilopayApiKey = defineSecret("TILOPAY_API_KEY");
const tilopayApiUser = defineSecret("TILOPAY_API_USER");
const tilopayApiPassword = defineSecret("TILOPAY_API_PASSWORD");
const powertranzId = defineSecret("POWERTRANZ_ID");
const powertranzPassword = defineSecret("POWERTRANZ_PASSWORD");

// Environment variables - exported for use in payment callbacks
export const baseUrl = defineString("BASE_URL", { default: "https://historia-clinica-2026.web.app" });

// ============================================================
// GENERIC PAYMENT INTENT CREATOR
// ============================================================

export interface PaymentRequest {
    amount: number;
    currency: string;
    gateway: "stripe" | "tilopay" | "powertranz";
    appointmentId?: string;
    patientId?: string;
    description?: string;
    customerEmail?: string;
    customerName?: string;
}

export interface PaymentResponse {
    success: boolean;
    gateway: string;
    transactionId?: string;
    clientSecret?: string;
    redirectUrl?: string;
    message?: string;
}

/**
 * Create Payment Intent - Universal function for multiple gateways
 * Called from the frontend using Firebase SDK httpsCallable
 */
export const createPaymentIntent = onCall(
    {
        secrets: [stripeSecretKey, tilopayApiKey, tilopayApiUser, tilopayApiPassword, powertranzId, powertranzPassword]
    },
    async (request): Promise<PaymentResponse> => {
        // Verify user is authenticated
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para realizar un pago."
            );
        }

        const data = request.data as PaymentRequest;
        const { amount, currency = "USD", gateway, appointmentId, patientId, description, customerEmail, customerName } = data;

        // Validate required fields
        if (!amount || amount <= 0) {
            throw new HttpsError(
                "invalid-argument",
                "El monto debe ser mayor a 0."
            );
        }

        if (!gateway) {
            throw new HttpsError(
                "invalid-argument",
                "Debe especificar una pasarela de pago (stripe, tilopay, powertranz)."
            );
        }

        try {
            switch (gateway) {
                case "stripe":
                    return await processStripePayment({
                        amount,
                        currency,
                        appointmentId,
                        patientId,
                        userId: request.auth.uid,
                        description,
                        customerEmail,
                    });

                case "tilopay":
                    // Use local helper with new credentials
                    return await processTiloPayPaymentLocal({
                        amount,
                        currency,
                        appointmentId,
                        patientId,
                        userId: request.auth.uid,
                        description,
                        customerEmail,
                        customerName,
                    });

                case "powertranz":
                    // Use local helper with new credentials
                    return await processPowerTranzPaymentLocal({
                        amount,
                        currency,
                        appointmentId,
                        patientId,
                        userId: request.auth.uid,
                        description,
                    });

                default:
                    throw new HttpsError(
                        "invalid-argument",
                        "Gateway no soportado. Use 'stripe', 'tilopay' o 'powertranz'."
                    );
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            if (error instanceof HttpsError) {
                throw error;
            }
            throw new HttpsError(
                "internal",
                `Error procesando pago: ${error.message}`
            );
        }
    }
);

// ============================================================
// STRIPE PAYMENT PROCESSOR
// ============================================================

async function processStripePayment(params: {
    amount: number;
    currency: string;
    appointmentId?: string;
    patientId?: string;
    userId: string;
    description?: string;
    customerEmail?: string;
}): Promise<PaymentResponse> {
    const stripe = new Stripe(stripeSecretKey.value(), {
        apiVersion: "2023-10-16",
    });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        metadata: {
            appointmentId: params.appointmentId || "",
            patientId: params.patientId || "",
            userId: params.userId,
        },
        description: params.description || "Consulta Médica",
        receipt_email: params.customerEmail,
    });

    return {
        success: true,
        gateway: "stripe",
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        message: "PaymentIntent creado exitosamente",
    };
}

// ============================================================
// TILOPAY PAYMENT PROCESSOR (Local Helper for Legacy Support)
// ============================================================

async function processTiloPayPaymentLocal(params: {
    amount: number;
    currency: string;
    appointmentId?: string;
    patientId?: string;
    userId: string;
    description?: string;
    customerEmail?: string;
    customerName?: string;
}): Promise<PaymentResponse> {
    const apiKey = tilopayApiKey.value();
    const apiUser = tilopayApiUser.value();
    const apiPassword = tilopayApiPassword.value();

    if (!apiKey || !apiUser || !apiPassword) {
        throw new HttpsError("failed-precondition", "Credenciales TiloPay no configuradas");
    }

    // TiloPay S2S Endpoint (Legacy usage via generic endpoint)
    // Note: Ideally effectively replaced by direct S2S function
    // const tilopayEndpoint = "https://api.tilopay.com/v1/process";

    // ... (Simplified logic or redirect to new implementation)
    // For now returning mock to avoid breaking build, assuming frontend uses new functions
    return {
        success: false,
        gateway: "tilopay",
        message: "Por favor use la nueva integración directa (PaymentModal actualizado)",
    };
}

// ============================================================
// POWERTRANZ PAYMENT PROCESSOR (Local Helper for Legacy Support)
// ============================================================

async function processPowerTranzPaymentLocal(params: {
    amount: number;
    currency: string;
    appointmentId?: string;
    patientId?: string;
    userId: string;
    description?: string;
}): Promise<PaymentResponse> {
    const merchantId = powertranzId.value();
    const password = powertranzPassword.value();

    if (!merchantId || !password) {
        throw new HttpsError("failed-precondition", "Credenciales PowerTranz no configuradas");
    }

    return {
        success: false,
        gateway: "powertranz",
        message: "Por favor use la nueva integración directa (PaymentModal actualizado)",
    };
}

// Helper function to get ISO currency codes
// function getCurrencyCode(currency: string): string {
//     const codes: { [key: string]: string } = {
//         "USD": "840",
//         "NIO": "558",
//         "CRC": "188",
//         "GTQ": "320",
//         "HNL": "340",
//     };
//     return codes[currency.toUpperCase()] || "840";
// }

// ============================================================
// LEGACY: Initiate Payment (backwards compatibility)
// ============================================================

export const initiatePayment = onCall(
    { secrets: [stripeSecretKey] },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para realizar un pago."
            );
        }

        const { appointmentId, patientId, amount } = request.data;

        if (!appointmentId || !amount) {
            throw new HttpsError(
                "invalid-argument",
                "appointmentId y amount son requeridos."
            );
        }

        // Redirect to new createPaymentIntent
        return await processStripePayment({
            amount,
            currency: "USD",
            appointmentId,
            patientId,
            userId: request.auth.uid,
        });
    }
);

// ============================================================
// STRIPE WEBHOOK - CON IDEMPOTENCIA
// ============================================================

export const stripeWebhook = onRequest(
    { secrets: [stripeSecretKey] },
    async (req, res) => {
        const sig = req.headers["stripe-signature"];

        if (!sig) {
            res.status(400).send("Missing signature");
            return;
        }

        let event: Stripe.Event;

        try {
            event = req.body as Stripe.Event;
        } catch (err: any) {
            console.error("Webhook error:", err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const { appointmentId } = paymentIntent.metadata;

                if (appointmentId) {
                    // IDEMPOTENCIA: Verificar si ya está pagado antes de actualizar
                    const appointmentRef = admin.firestore().collection("appointments").doc(appointmentId);
                    const appointmentDoc = await appointmentRef.get();

                    if (appointmentDoc.exists && appointmentDoc.data()?.paymentStatus === "paid") {
                        console.log(`Stripe: Payment already processed for appointment ${appointmentId}, skipping update`);
                        // Retornar éxito inmediatamente para evitar reintentos
                        res.json({ received: true, skipped: true });
                        return;
                    }

                    await appointmentRef.update({
                        paid: true,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        paymentIntentId: paymentIntent.id,
                        paymentStatus: "paid",
                        paymentGateway: "stripe",
                    });
                }
                break;

            case "payment_intent.payment_failed":
                console.log("Payment failed:", event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    }
);

// ============================================================
// TILOPAY WEBHOOK - CON IDEMPOTENCIA
// ============================================================

export const tilopayWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }

    try {
        const { transactionId, status, orderNumber, metadata } = req.body;

        console.log("TiloPay webhook received:", { transactionId, status, orderNumber });

        if (status === "approved" && metadata?.appointmentId) {
            // IDEMPOTENCIA: Verificar si ya está pagado antes de actualizar
            const appointmentRef = admin.firestore().collection("appointments").doc(metadata.appointmentId);
            const appointmentDoc = await appointmentRef.get();

            if (appointmentDoc.exists && appointmentDoc.data()?.paymentStatus === "paid") {
                console.log(`TiloPay: Payment already processed for appointment ${metadata.appointmentId}, skipping update`);
                // Retornar éxito inmediatamente para evitar reintentos
                res.json({ received: true, skipped: true });
                return;
            }

            await appointmentRef.update({
                paid: true,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentTransactionId: transactionId,
                paymentStatus: "paid",
                paymentGateway: "tilopay",
            });
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error("TiloPay webhook error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// SCHEDULED FUNCTION: APPOINTMENT REMINDERS
// ============================================================

/**
 * sendAppointmentReminders
 * 
 * Se ejecuta todos los días a las 8:00 AM (hora de Nicaragua/Costa Rica - CST)
 * Busca citas programadas para el día siguiente y envía recordatorios por email
 * 
 * Cron Expression: "0 8 * * *" = Every day at 8:00 AM
 */
export const sendAppointmentReminders = onSchedule(
    {
        schedule: "0 8 * * *",  // Every day at 8:00 AM
        timeZone: "America/Managua",  // Nicaragua timezone (CST/UTC-6)
        region: "us-central1",
    },
    async (event) => {
        console.log("🔔 Starting daily appointment reminder job...");
        console.log(`Triggered at: ${new Date().toISOString()}`);

        try {
            // Calculate tomorrow's date range
            const now = new Date();
            const tomorrowStart = new Date(now);
            tomorrowStart.setDate(now.getDate() + 1);
            tomorrowStart.setHours(0, 0, 0, 0);

            const tomorrowEnd = new Date(tomorrowStart);
            tomorrowEnd.setHours(23, 59, 59, 999);

            // Format dates for comparison with stored date strings (YYYY-MM-DD)
            const tomorrowDateStr = tomorrowStart.toISOString().split("T")[0];

            console.log(`📅 Looking for appointments on: ${tomorrowDateStr}`);

            // Query appointments for tomorrow
            const appointmentsSnapshot = await admin.firestore()
                .collection("appointments")
                .where("date", "==", tomorrowDateStr)
                .get();

            if (appointmentsSnapshot.empty) {
                console.log("✅ No appointments found for tomorrow. Job complete.");
                return;
            }

            console.log(`📋 Found ${appointmentsSnapshot.size} appointment(s) for tomorrow`);

            // Process each appointment
            const reminderPromises = appointmentsSnapshot.docs.map(async (doc) => {
                const appointment = doc.data();
                const appointmentId = doc.id;

                try {
                    // Get patient information
                    const patientDoc = await admin.firestore()
                        .collection("patients")
                        .doc(appointment.patientId)
                        .get();

                    if (!patientDoc.exists) {
                        console.warn(`⚠️ Patient not found for appointment ${appointmentId}`);
                        return { success: false, appointmentId, reason: "Patient not found" };
                    }

                    const patient = patientDoc.data();
                    const patientEmail = patient?.email;
                    const patientName = `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim();

                    // Log reminder details (simulating email send for now)
                    console.log(`📧 [SIMULATED EMAIL] Sending reminder to:`);
                    console.log(`   - Patient: ${patientName}`);
                    console.log(`   - Email: ${patientEmail || "No email registered"}`);
                    console.log(`   - Appointment ID: ${appointmentId}`);
                    console.log(`   - Date: ${appointment.date}`);
                    console.log(`   - Time: ${appointment.time}`);
                    console.log(`   - Type: ${appointment.type || "presencial"}`);
                    console.log(`   - Reason: ${appointment.reason || "Not specified"}`);

                    // TODO: Implement actual email sending with Nodemailer or SendGrid
                    // Example email content:
                    const emailSubject = `Recordatorio: Cita médica mañana a las ${appointment.time}`;
                    const emailBody = `
                        Hola ${patientName},

                        Le recordamos que tiene una cita médica programada para mañana:

                        📅 Fecha: ${new Date(appointment.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                        ⏰ Hora: ${appointment.time}
                        📍 Tipo: ${appointment.type === "virtual" ? "Consulta Virtual (Video Llamada)" : "Consulta Presencial"}
                        ${appointment.reason ? `📋 Motivo: ${appointment.reason}` : ""}

                        ${appointment.type === "virtual"
                            ? "Ingrese a su portal de paciente para unirse a la video consulta."
                            : "Por favor llegue 10 minutos antes de su cita."}

                        Si necesita cancelar o reprogramar, contáctenos con anticipación.

                        Saludos,
                        Centro de Gastroenterología
                    `;

                    console.log(`   - Subject: ${emailSubject}`);
                    console.log(`   - Body Preview: ${emailBody.slice(0, 100)}...`);

                    // Track reminder sent in Firestore (optional)
                    await admin.firestore()
                        .collection("appointments")
                        .doc(appointmentId)
                        .update({
                            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
                            reminderStatus: "sent",
                        });

                    return { success: true, appointmentId, patientName };
                } catch (err: any) {
                    console.error(`❌ Error processing reminder for ${appointmentId}:`, err);
                    return { success: false, appointmentId, reason: err.message };
                }
            });

            // Wait for all reminders to be processed
            const results = await Promise.all(reminderPromises);

            // Summary
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            console.log(`\n📊 Reminder Job Summary:`);
            console.log(`   ✅ Successful: ${successful}`);
            console.log(`   ❌ Failed: ${failed}`);
            console.log(`   📧 Total processed: ${results.length}`);
            console.log(`🏁 Daily appointment reminder job completed.`);

        } catch (error: any) {
            console.error("❌ Critical error in appointment reminder job:", error);
            throw error; // Rethrow to mark the function execution as failed
        }
    }
);

// ============================================================
// AI ANALYSIS FUNCTION
// ============================================================

export const generateAIAnalysis = onCall(
    async (request) => {
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para realizar el análisis."
            );
        }

        const { patientId } = request.data;
        if (!patientId) {
            throw new HttpsError(
                "invalid-argument",
                "El patientId es requerido."
            );
        }

        // TODO: Retrieve patient data (clinical history, consultations)
        // const history = await admin.firestore().collection('medicalHistory').where('patientId', '==', patientId).limit(1).get();

        // SIMULATION: Returning mock data structure for now
        // This simulates a response from Gemini
        return {
            summary: "El paciente presenta un cuadro metabólico estable, aunque con indicadores de riesgo cardiovascular moderado debido a los antecedentes familiares y el IMC actual.",
            risks: [
                "Riesgo moderado de hipertensión arterial.",
                "Posible predisposición a diabetes tipo 2.",
                "Sobrepeso (IMC elevado)."
            ],
            recommendations: [
                "Iniciar programa de actividad física moderada (caminata 30 min/día).",
                "Reducción de consumo de sodio y carbohidratos refinados.",
                "Monitoreo de presión arterial cada 2 semanas."
            ]
        };
    }
);

// ============================================================
// DASHBOARD ANALYTICS FUNCTION
// ============================================================

export const getDashboardAdvancedStats = onCall(
    async (request) => {
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para ver estadísticas."
            );
        }

        const db = admin.firestore();

        try {
            // 1. Fetch Medical Histories for Obesity and Risks
            // We fetch the latest history for each patient (simplification: fetching all 'medicalHistory' docs might be heavy in prod, 
            // but for this scope we assume a manageable dataset or we'd rely on a scheduled aggregation)
            const historySnapshot = await db.collection("medicalHistory").get();

            // 2. Fetch Consultations for Top Diagnoses (Current Month)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            const consultationsSnapshot = await db.collection("consultations")
                .where("date", ">=", startOfMonth)
                .where("date", "<=", endOfMonth)
                .get();

            // --- Calculation: Obesity Prevalence ---
            let normal = 0;
            let overweight = 0;
            let obese = 0;

            // --- Calculation: Risk Patients ---
            const riskPatients: { id: string; risks: string[] }[] = [];

            historySnapshot.docs.forEach(doc => {
                const data = doc.data();

                // IMC Check
                const imc = parseFloat(data.physicalExam?.imc || "0");
                if (imc > 0) {
                    if (imc < 25) normal++;
                    else if (imc < 30) overweight++;
                    else obese++;
                }

                // Risk Flags Check
                const risks: string[] = [];
                if (data.metabolic?.yes) risks.push("Metabólico");
                if (data.cardiac?.yes) risks.push("Cardíaco");
                if (data.respiratory?.yes) risks.push("Respiratorio");
                if (data.preExistingDiseases?.yes) risks.push("Preexistentes");

                if (risks.length > 0) {
                    riskPatients.push({
                        id: data.patientId,
                        risks: risks
                    });
                }
            });

            // --- Calculation: Top Diagnoses ---
            const diagnosisCounts: { [key: string]: number } = {};

            consultationsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const diagnoses = data.diagnoses || []; // Array of strings

                if (Array.isArray(diagnoses)) {
                    diagnoses.forEach((dx: string) => {
                        if (dx) {
                            const normalizedDx = dx.trim();
                            diagnosisCounts[normalizedDx] = (diagnosisCounts[normalizedDx] || 0) + 1;
                        }
                    });
                }
            });

            // Sort and take top 5
            const topDiagnoses = Object.entries(diagnosisCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return {
                obesityPrevalence: {
                    normal,
                    overweight,
                    obese
                },
                topDiagnoses,
                riskPatients
            };

        } catch (error: any) {
            console.error("Error generating dashboard stats:", error);
            throw new HttpsError(
                "internal",
                "Error calculando estadísticas del dashboard: " + error.message
            );
        }
    }
);
