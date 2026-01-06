/**
 * PowerTranz Payment Processing Module
 * 3DS Simplified API Integration for Latin America/Caribbean
 * 
 * Staging URL: https://staging.ptranz.com
 * Production URL: https://gateway.ptranz.com
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

// Define secrets for PowerTranz credentials
const powertranzId = defineSecret("POWERTRANZ_ID");
const powertranzPassword = defineSecret("POWERTRANZ_PASSWORD");

// ============================================================
// TYPES
// ============================================================

export interface CardDetails {
    pan: string;          // Card number (16 digits)
    cvv: string;          // CVV (3-4 digits)
    expMonth: string;     // Expiry month (MM)
    expYear: string;      // Expiry year (YY)
    cardHolder: string;   // Cardholder name
}

export interface PowerTranzRequest {
    amount: number;
    currencyCode: string;      // ISO numeric: 840 = USD, 558 = NIO
    orderId: string;
    cardDetails: CardDetails;
    appointmentId?: string;
    patientId?: string;
    customerEmail?: string;
    customerIp?: string;
    userAgent?: string;
}

export interface PowerTranzAddress {
    FirstName?: string;
    LastName?: string;
    Line1?: string;
    Line2?: string;
    City?: string;
    State?: string;
    PostalCode?: string;
    CountryCode?: string;
    EmailAddress?: string;
    PhoneNumber?: string;
}

export interface PowerTranzResponse {
    Approved: boolean;
    AuthorizationCode?: string;
    TransactionIdentifier?: string;
    TransactionType?: string;
    ResponseMessage?: string;
    RiskManagement?: any;
    IsoResponseCode?: string;

    // 3DS Fields
    RedirectUrl?: string;
    SpiToken?: string;
    ThreeDSecure?: {
        Enrolled: boolean;
        Version: string;
        Status: string;
    };

    // Error handling
    Errors?: Array<{
        Code: string;
        Message: string;
    }>;
}

// ============================================================
// POWERTRANZ API CONFIGURATION
// ============================================================

const POWERTRANZ_CONFIG = {
    staging: {
        baseUrl: "https://staging.ptranz.com",
        saleEndpoint: "/api/spi/sale",
        authEndpoint: "/api/spi/auth",
        captureEndpoint: "/api/spi/capture",
    },
    production: {
        baseUrl: "https://gateway.ptranz.com",
        saleEndpoint: "/api/spi/sale",
        authEndpoint: "/api/spi/auth",
        captureEndpoint: "/api/spi/capture",
    }
};

// Use staging for now (change to production when ready)
const API_CONFIG = POWERTRANZ_CONFIG.staging;

// ============================================================
// MAIN CLOUD FUNCTION: processPowerTranzPayment
// ============================================================

export const processPowerTranzPayment = onCall(
    {
        secrets: [powertranzId, powertranzPassword],
        cors: true,
    },
    async (request): Promise<PowerTranzResponse> => {
        // Verify user is authenticated
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para realizar un pago."
            );
        }

        const data = request.data as PowerTranzRequest;
        const {
            amount,
            currencyCode,
            orderId,
            cardDetails,
            appointmentId,
            patientId,
            customerEmail,
            customerIp,
            userAgent
        } = data;

        // Validate required fields
        if (!amount || amount <= 0) {
            throw new HttpsError("invalid-argument", "El monto debe ser mayor a 0.");
        }

        if (!orderId) {
            throw new HttpsError("invalid-argument", "orderId es requerido.");
        }

        if (!cardDetails || !cardDetails.pan || !cardDetails.cvv || !cardDetails.expMonth || !cardDetails.expYear) {
            throw new HttpsError("invalid-argument", "Datos de tarjeta incompletos.");
        }

        // Get credentials
        const ptrzId = powertranzId.value();
        const ptrzPassword = powertranzPassword.value();

        if (!ptrzId || !ptrzPassword) {
            throw new HttpsError(
                "failed-precondition",
                "Credenciales de PowerTranz no configuradas. Configure POWERTRANZ_ID y POWERTRANZ_PASSWORD."
            );
        }

        // Format expiry date as YYMM (PowerTranz format)
        const expiryDate = `${cardDetails.expYear}${cardDetails.expMonth.padStart(2, '0')}`;

        // Build PowerTranz request payload
        const payload = {
            // Transaction Identifier
            TransactionIdentifier: orderId,

            // Amount in smallest currency unit (cents)
            TotalAmount: amount,

            // ISO Currency Code (numeric)
            CurrencyCode: currencyCode || "558", // Default to NIO

            // Enable 3D Secure
            ThreeDSecure: true,

            // Card details
            Source: {
                CardPan: cardDetails.pan.replace(/\s/g, ''),
                CardCvv: cardDetails.cvv,
                CardExpiration: expiryDate,
                CardholderName: cardDetails.cardHolder || "CARDHOLDER",
            },

            // Order details
            OrderIdentifier: orderId,

            // Return URL after 3DS (this will be called by PowerTranz)
            ExtendedData: {
                ThreeDSecure: {
                    ChallengeWindowSize: "02", // 400x600
                },
                MerchantResponseUrl: `https://historia-clinica-2026.web.app/app/payment/callback?orderId=${orderId}`,
            },

            // Billing Address (optional but recommended for 3DS)
            BillingAddress: {
                FirstName: cardDetails.cardHolder?.split(' ')[0] || "Customer",
                LastName: cardDetails.cardHolder?.split(' ').slice(1).join(' ') || "Name",
                Line1: "Address Line 1",
                City: "Managua",
                State: "MN",
                PostalCode: "00000",
                CountryCode: "558", // Nicaragua
                EmailAddress: customerEmail || "customer@example.com",
                PhoneNumber: "50588888888",
            },

            // Risk Management (required for some transactions)
            RiskManagement: {
                TransactionSource: "INTERNET",
                BrowserUserAgentString: userAgent || "Mozilla/5.0 MediRecord Pro Payment",
                IPAddress: customerIp || "0.0.0.0",
            },

            // Address Match
            AddressMatch: false,
        };

        console.log("PowerTranz Request:", {
            url: `${API_CONFIG.baseUrl}${API_CONFIG.saleEndpoint}`,
            orderId,
            amount,
            currencyCode,
        });

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.saleEndpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "PowerTranz-PowerTranzId": ptrzId,
                    "PowerTranz-PowerTranzPassword": ptrzPassword,
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json() as PowerTranzResponse;

            console.log("PowerTranz Response:", {
                status: response.status,
                approved: responseData.Approved,
                hasRedirect: !!responseData.RedirectUrl,
                errors: responseData.Errors,
            });

            // If transaction needs 3DS, save pending status
            if (responseData.RedirectUrl && responseData.SpiToken) {
                // Save transaction as pending 3DS
                if (appointmentId) {
                    await admin.firestore().collection("appointments").doc(appointmentId).update({
                        paymentStatus: "pending_3ds",
                        paymentTransactionId: orderId,
                        paymentGateway: "powertranz",
                        paymentSpiToken: responseData.SpiToken,
                        paymentUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }

                // Save to payments collection for tracking
                await admin.firestore().collection("payments").doc(orderId).set({
                    orderId,
                    appointmentId,
                    patientId,
                    userId: request.auth.uid,
                    amount,
                    currencyCode,
                    status: "pending_3ds",
                    gateway: "powertranz",
                    spiToken: responseData.SpiToken,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            // If approved directly (rare, usually goes through 3DS)
            if (responseData.Approved && appointmentId) {
                await admin.firestore().collection("appointments").doc(appointmentId).update({
                    paid: true,
                    paymentStatus: "paid",
                    paymentTransactionId: responseData.TransactionIdentifier,
                    paymentAuthCode: responseData.AuthorizationCode,
                    paymentGateway: "powertranz",
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            return responseData;

        } catch (error: any) {
            console.error("PowerTranz API Error:", error);
            throw new HttpsError(
                "internal",
                `Error conectando con PowerTranz: ${error.message}`
            );
        }
    }
);

// ============================================================
// VERIFY 3DS CALLBACK
// ============================================================

export const verifyPowerTranzPayment = onCall(
    { secrets: [powertranzId, powertranzPassword] },
    async (request): Promise<{ success: boolean; message: string; transactionId?: string }> => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Usuario no autenticado.");
        }

        const { orderId } = request.data;

        if (!orderId) {
            throw new HttpsError("invalid-argument", "orderId es requerido.");
        }

        try {
            // Get the payment record
            const paymentDoc = await admin.firestore().collection("payments").doc(orderId).get();

            if (!paymentDoc.exists) {
                throw new HttpsError("not-found", "Pago no encontrado.");
            }

            const paymentData = paymentDoc.data();

            // Verify the payment status with PowerTranz
            // In a real implementation, you would call PowerTranz API to verify
            // For now, we'll check if the callback updated the status

            if (paymentData?.status === "paid" || paymentData?.status === "approved") {
                return {
                    success: true,
                    message: "Pago verificado exitosamente",
                    transactionId: paymentData.transactionId,
                };
            }

            return {
                success: false,
                message: "El pago no ha sido confirmado aún",
            };

        } catch (error: any) {
            console.error("Verify payment error:", error);
            throw new HttpsError("internal", `Error verificando pago: ${error.message}`);
        }
    }
);

// ============================================================
// WEBHOOK FOR 3DS CALLBACK (HTTP Trigger)
// ============================================================

import { onRequest } from "firebase-functions/v2/https";

export const powertranzCallback = onRequest(
    { cors: true },
    async (req, res) => {
        console.log("PowerTranz Callback received:", {
            method: req.method,
            query: req.query,
            body: req.body,
        });

        // PowerTranz sends a POST with the transaction result
        const {
            TransactionIdentifier,
            Approved,
            AuthorizationCode,
            ResponseMessage,
            IsoResponseCode,
        } = req.body;

        const orderId = req.query.orderId as string || TransactionIdentifier;

        try {
            if (orderId) {
                // Update payment status
                const paymentRef = admin.firestore().collection("payments").doc(orderId);
                const paymentDoc = await paymentRef.get();

                if (paymentDoc.exists) {
                    const paymentData = paymentDoc.data();
                    const appointmentId = paymentData?.appointmentId;

                    const newStatus = Approved ? "paid" : "failed";

                    // Update payment record
                    await paymentRef.update({
                        status: newStatus,
                        approved: Approved,
                        authorizationCode: AuthorizationCode,
                        responseMessage: ResponseMessage,
                        isoResponseCode: IsoResponseCode,
                        completedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    // Update appointment if exists
                    if (appointmentId && Approved) {
                        await admin.firestore().collection("appointments").doc(appointmentId).update({
                            paid: true,
                            paymentStatus: "paid",
                            paymentTransactionId: TransactionIdentifier,
                            paymentAuthCode: AuthorizationCode,
                            paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                }
            }

            // Redirect user back to the app
            const redirectUrl = Approved
                ? `https://historia-clinica-2026.web.app/app/payment/callback?status=success&orderId=${orderId}`
                : `https://historia-clinica-2026.web.app/app/payment/callback?status=failed&orderId=${orderId}&message=${encodeURIComponent(ResponseMessage || 'Error')}`;

            res.redirect(302, redirectUrl);

        } catch (error: any) {
            console.error("Callback error:", error);
            res.redirect(302, `https://historia-clinica-2026.web.app/app/payment/callback?status=error&message=${encodeURIComponent(error.message)}`);
        }
    }
);
