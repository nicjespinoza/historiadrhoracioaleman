/**
 * TiloPay Server-to-Server (S2S) Payment Integration
 * Direct API processing via Cloud Functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

// Secrets
const tilopayApiKey = defineSecret("TILOPAY_API_KEY");
const tilopayApiUser = defineSecret("TILOPAY_API_USER");
const tilopayApiPassword = defineSecret("TILOPAY_API_PASSWORD");
const tilopayEnv = defineString("TILOPAY_ENV", { default: "production" });

// Environment variables
const baseUrl = defineString("BASE_URL", { default: "https://historia-clinica-2026.web.app" });

// Types
interface TiloPayRequest {
    amount: number;
    currency: string;
    orderId: string;
    cardDetails: {
        pan: string;
        cvv: string;
        expMonth: string;
        expYear: string;
    };
    clientDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
    };
    appointmentId?: string;
    patientId?: string;
}

interface TiloPayResponse {
    success: boolean;
    transactionId?: string;
    requiresAction?: boolean; // For 3DS
    redirectUrl?: string;     // For 3DS
    error?: boolean;
    message?: string;
    raw?: any;
}

/**
 * Process payment directly with TiloPay using S2S
 */
export const processTiloPayPayment = onCall(
    {
        secrets: [tilopayApiKey, tilopayApiUser, tilopayApiPassword],
        cors: true
    },
    async (request): Promise<TiloPayResponse> => {
        // 1. Authentication Check
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be logged in");
        }

        const data = request.data as TiloPayRequest;
        const { amount, currency, orderId, cardDetails, clientDetails } = data;

        // 2. Validate Data
        if (!amount || !currency || !orderId || !cardDetails || !clientDetails) {
            throw new HttpsError("invalid-argument", "Missing required payment fields");
        }

        const apiKey = tilopayApiKey.value();
        const apiUser = tilopayApiUser.value();
        const apiPassword = tilopayApiPassword.value();
        const environment = tilopayEnv.value();

        if (!apiKey || !apiUser || !apiPassword) {
            throw new HttpsError("failed-precondition", "TiloPay credentials not configured");
        }

        // 3. Format Data for TiloPay
        // Ensure currency is numeric string if required, but TiloPay usually takes 3-letter code like 'USD' or 'NIO' in some endpoints.
        // However, standard ISO 4217 numeric is safer for banking APIs. 
        // Let's assume the user sends 'USD' or 'NIO' and we convert if needed, 
        // OR we send as is if TiloPay accepts it. The prompt mentions "Códigos de Moneda: Asegúrate de enviar el estándar correcto".
        // Common TiloPay: 'USD', 'NIO'.

        // Clean card data
        const pan = cardDetails.pan.replace(/\s/g, "");
        const cvv = cardDetails.cvv.trim();

        // Format Year: TiloPay often expects 2 digits.
        const expYear = cardDetails.expYear.length === 4 ? cardDetails.expYear.slice(-2) : cardDetails.expYear;
        const expMonth = cardDetails.expMonth.padStart(2, '0');

        // 4. Generate Hash
        // Formula often used: SHA256(KEY + ORDER + AMOUNT)
        // Note: Amount usually needs to be formatted (e.g., "100.00" or simple "100" depending on API).
        // We will assume standard string concatenation.
        const hashString = `${apiKey}${orderId}${amount}`;
        const hash = crypto.createHash('sha256').update(hashString).digest('hex');

        // 5. Construct Payload
        // Based on typical TiloPay S2S structure
        const payload = {
            key: apiKey,
            hash: hash,
            amount: amount,
            currency: currency,
            order_id: orderId,
            description: `Pago Consulta - Orden ${orderId}`,
            capture: true, // Auto-capture
            card: {
                number: pan,
                cvv: cvv,
                expire_month: expMonth,
                expire_year: expYear
            },
            bill_to: {
                first_name: clientDetails.firstName,
                last_name: clientDetails.lastName,
                email: clientDetails.email,
                address_1: clientDetails.address || "Managua",
                city: clientDetails.city || "Managua",
                country: clientDetails.country || "NI",
                phone: clientDetails.phone || "88888888"
            },
            // Return URL for 3DS - use environment variable
            return_url: `${baseUrl.value()}/app/payment/callback?orderId=${orderId}`
        };

        // 6. Send Request
        // URL depends on environment
        const tilopayApiUrl = environment === 'production'
            ? 'https://app.tilopay.com/api/v1/process'
            : 'https://sandbox.tilopay.com/api/v1/process'; // Adjust sandbox URL if needed

        try {
            const authHeader = "Basic " + Buffer.from(`${apiUser}:${apiPassword}`).toString("base64");

            console.log(`Sending payment request to TiloPay (${environment}):`, { orderId, amount, currency });

            const response = await fetch(tilopayApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            console.log('TiloPay Response:', result);

            // 7. Handle Response
            // Identify standard TiloPay response codes

            // Case A: Success (Direct)
            if (result.status === 'success' || result.response_code === '100') {
                // Update Firestore with idempotency check
                if (data.appointmentId) {
                    // IDEMPOTENCIA: Verificar si ya está pagado antes de actualizar
                    const appointmentRef = admin.firestore().collection('appointments').doc(data.appointmentId);
                    const appointmentDoc = await appointmentRef.get();

                    if (appointmentDoc.exists && appointmentDoc.data()?.paymentStatus === 'paid') {
                        console.log(`Payment already processed for appointment ${data.appointmentId}, skipping update`);
                    } else {
                        await appointmentRef.update({
                            paid: true,
                            paymentStatus: 'paid',
                            paymentGateway: 'tilopay',
                            paymentTransactionId: result.transaction_id || orderId,
                            paidAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }

                return {
                    success: true,
                    transactionId: result.transaction_id,
                    message: "Pago aprobado exitosamente"
                };
            }

            // Case B: 3D Secure Redirect Required
            // TiloPay usually returns a specific code or url for 3DS
            if (result.redirect_url || result.status === 'redirect') {
                return {
                    success: false,
                    requiresAction: true,
                    redirectUrl: result.redirect_url,
                    message: "Redirección bancaria requerida"
                };
            }

            // Case C: Error/Declined
            return {
                success: false,
                error: true,
                message: result.error_message || result.message || "La transacción fue declinada por el banco."
            };

        } catch (error: any) {
            console.error('TiloPay internal error:', error);
            throw new HttpsError('internal', `Error connecting to TiloPay: ${error.message}`);
        }
    }
);
