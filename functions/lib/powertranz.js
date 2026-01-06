"use strict";
/**
 * PowerTranz Payment Processing Module
 * 3DS Simplified API Integration for Latin America/Caribbean
 *
 * Staging URL: https://staging.ptranz.com
 * Production URL: https://gateway.ptranz.com
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.powertranzCallback = exports.verifyPowerTranzPayment = exports.processPowerTranzPayment = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = require("firebase-admin");
// Define secrets for PowerTranz credentials
const powertranzId = (0, params_1.defineSecret)("POWERTRANZ_ID");
const powertranzPassword = (0, params_1.defineSecret)("POWERTRANZ_PASSWORD");
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
exports.processPowerTranzPayment = (0, https_1.onCall)({
    secrets: [powertranzId, powertranzPassword],
    cors: true,
}, async (request) => {
    var _a, _b;
    // Verify user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión para realizar un pago.");
    }
    const data = request.data;
    const { amount, currencyCode, orderId, cardDetails, appointmentId, patientId, customerEmail, customerIp, userAgent } = data;
    // Validate required fields
    if (!amount || amount <= 0) {
        throw new https_1.HttpsError("invalid-argument", "El monto debe ser mayor a 0.");
    }
    if (!orderId) {
        throw new https_1.HttpsError("invalid-argument", "orderId es requerido.");
    }
    if (!cardDetails || !cardDetails.pan || !cardDetails.cvv || !cardDetails.expMonth || !cardDetails.expYear) {
        throw new https_1.HttpsError("invalid-argument", "Datos de tarjeta incompletos.");
    }
    // Get credentials
    const ptrzId = powertranzId.value();
    const ptrzPassword = powertranzPassword.value();
    if (!ptrzId || !ptrzPassword) {
        throw new https_1.HttpsError("failed-precondition", "Credenciales de PowerTranz no configuradas. Configure POWERTRANZ_ID y POWERTRANZ_PASSWORD.");
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
            FirstName: ((_a = cardDetails.cardHolder) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || "Customer",
            LastName: ((_b = cardDetails.cardHolder) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || "Name",
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
        const responseData = await response.json();
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
    }
    catch (error) {
        console.error("PowerTranz API Error:", error);
        throw new https_1.HttpsError("internal", `Error conectando con PowerTranz: ${error.message}`);
    }
});
// ============================================================
// VERIFY 3DS CALLBACK
// ============================================================
exports.verifyPowerTranzPayment = (0, https_1.onCall)({ secrets: [powertranzId, powertranzPassword] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Usuario no autenticado.");
    }
    const { orderId } = request.data;
    if (!orderId) {
        throw new https_1.HttpsError("invalid-argument", "orderId es requerido.");
    }
    try {
        // Get the payment record
        const paymentDoc = await admin.firestore().collection("payments").doc(orderId).get();
        if (!paymentDoc.exists) {
            throw new https_1.HttpsError("not-found", "Pago no encontrado.");
        }
        const paymentData = paymentDoc.data();
        // Verify the payment status with PowerTranz
        // In a real implementation, you would call PowerTranz API to verify
        // For now, we'll check if the callback updated the status
        if ((paymentData === null || paymentData === void 0 ? void 0 : paymentData.status) === "paid" || (paymentData === null || paymentData === void 0 ? void 0 : paymentData.status) === "approved") {
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
    }
    catch (error) {
        console.error("Verify payment error:", error);
        throw new https_1.HttpsError("internal", `Error verificando pago: ${error.message}`);
    }
});
// ============================================================
// WEBHOOK FOR 3DS CALLBACK (HTTP Trigger)
// ============================================================
const https_2 = require("firebase-functions/v2/https");
exports.powertranzCallback = (0, https_2.onRequest)({ cors: true }, async (req, res) => {
    console.log("PowerTranz Callback received:", {
        method: req.method,
        query: req.query,
        body: req.body,
    });
    // PowerTranz sends a POST with the transaction result
    const { TransactionIdentifier, Approved, AuthorizationCode, ResponseMessage, IsoResponseCode, } = req.body;
    const orderId = req.query.orderId || TransactionIdentifier;
    try {
        if (orderId) {
            // Update payment status
            const paymentRef = admin.firestore().collection("payments").doc(orderId);
            const paymentDoc = await paymentRef.get();
            if (paymentDoc.exists) {
                const paymentData = paymentDoc.data();
                const appointmentId = paymentData === null || paymentData === void 0 ? void 0 : paymentData.appointmentId;
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
    }
    catch (error) {
        console.error("Callback error:", error);
        res.redirect(302, `https://historia-clinica-2026.web.app/app/payment/callback?status=error&message=${encodeURIComponent(error.message)}`);
    }
});
//# sourceMappingURL=powertranz.js.map