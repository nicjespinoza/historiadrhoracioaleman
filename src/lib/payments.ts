/**
 * Payment Service for Firebase Cloud Functions
 * Uses httpsCallable to invoke payment processing functions
 */

import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { getApp } from 'firebase/app';

// ============================================================
// TYPES
// ============================================================

export type PaymentGateway = 'stripe' | 'tilopay' | 'powertranz';

export interface PaymentRequest {
    amount: number;
    currency?: string;
    gateway: PaymentGateway;
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

export interface InitiatePaymentRequest {
    appointmentId: string;
    patientId: string;
    amount: number;
    gateway: PaymentGateway;
}

// ============================================================
// CLOUD FUNCTION CALLS
// ============================================================

/**
 * Get Firebase Functions instance
 */
function getFunctionsInstance() {
    const app = getApp();
    return getFunctions(app, 'us-central1');
}

/**
 * Create a payment intent using the specified gateway
 * This is the main function to initiate a payment
 * 
 * @example
 * const result = await createPaymentIntent({
 *   amount: 1200,
 *   currency: 'NIO',
 *   gateway: 'tilopay',
 *   appointmentId: 'abc123',
 *   patientId: 'patient123',
 *   customerEmail: 'patient@email.com',
 *   customerName: 'Juan Perez'
 * });
 * 
 * if (result.redirectUrl) {
 *   window.location.href = result.redirectUrl;
 * }
 */
export async function createPaymentIntent(request: PaymentRequest): Promise<PaymentResponse> {
    const functions = getFunctionsInstance();
    const createPaymentIntentFn = httpsCallable<PaymentRequest, PaymentResponse>(
        functions,
        'createPaymentIntent'
    );

    try {
        const result: HttpsCallableResult<PaymentResponse> = await createPaymentIntentFn(request);
        return result.data;
    } catch (error: any) {
        console.error('createPaymentIntent error:', error);
        throw new Error(error.message || 'Error al crear intención de pago');
    }
}

/**
 * Legacy function for backwards compatibility
 * Uses the older initiatePayment Cloud Function
 */
export async function initiatePayment(request: InitiatePaymentRequest): Promise<PaymentResponse> {
    const functions = getFunctionsInstance();
    const initiatePaymentFn = httpsCallable<InitiatePaymentRequest, PaymentResponse>(
        functions,
        'initiatePayment'
    );

    try {
        const result: HttpsCallableResult<PaymentResponse> = await initiatePaymentFn(request);
        return result.data;
    } catch (error: any) {
        console.error('initiatePayment error:', error);
        throw new Error(error.message || 'Error al iniciar pago');
    }
}

// ============================================================
// STRIPE HELPERS
// ============================================================

/**
 * Create a Stripe payment intent and get client secret
 * Use this with @stripe/stripe-js on the frontend
 * 
 * @example
 * const { clientSecret } = await createStripePayment(1200);
 * const stripe = await loadStripe('pk_live_xxx');
 * await stripe.confirmCardPayment(clientSecret, { ... });
 */
export async function createStripePayment(
    amount: number,
    appointmentId?: string,
    patientId?: string
): Promise<{ clientSecret: string; transactionId: string }> {
    const response = await createPaymentIntent({
        amount,
        currency: 'USD',
        gateway: 'stripe',
        appointmentId,
        patientId,
    });

    if (!response.clientSecret) {
        throw new Error('No se recibió clientSecret de Stripe');
    }

    return {
        clientSecret: response.clientSecret,
        transactionId: response.transactionId || '',
    };
}

// ============================================================
// TILOPAY HELPERS (Nicaragua/Central America)
// ============================================================

/**
 * Create a TiloPay payment and get redirect URL
 * User will be redirected to TiloPay checkout page
 * 
 * @example
 * const { redirectUrl } = await createTiloPayPayment({
 *   amount: 1200,
 *   appointmentId: 'apt123',
 *   customerEmail: 'patient@email.com',
 *   customerName: 'Juan Perez'
 * });
 * window.location.href = redirectUrl;
 */
export async function createTiloPayPayment(params: {
    amount: number;
    appointmentId?: string;
    patientId?: string;
    customerEmail?: string;
    customerName?: string;
}): Promise<{ redirectUrl: string; transactionId: string }> {
    const response = await createPaymentIntent({
        amount: params.amount,
        currency: 'NIO', // Nicaraguan Córdoba
        gateway: 'tilopay',
        appointmentId: params.appointmentId,
        patientId: params.patientId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
    });

    if (!response.redirectUrl) {
        throw new Error('No se recibió URL de redirección de TiloPay');
    }

    return {
        redirectUrl: response.redirectUrl,
        transactionId: response.transactionId || '',
    };
}

// ============================================================
// POWERTRANZ HELPERS (Caribbean/Latin America)
// ============================================================

/**
 * Create a PowerTranz payment with 3D Secure
 * 
 * @example
 * const { redirectUrl } = await createPowerTranzPayment(1200, 'apt123');
 * window.location.href = redirectUrl;
 */
export async function createPowerTranzPayment(
    amount: number,
    appointmentId?: string
): Promise<{ redirectUrl: string; transactionId: string }> {
    const response = await createPaymentIntent({
        amount,
        currency: 'USD',
        gateway: 'powertranz',
        appointmentId,
    });

    if (!response.redirectUrl) {
        throw new Error('No se recibió URL de redirección de PowerTranz');
    }

    return {
        redirectUrl: response.redirectUrl,
        transactionId: response.transactionId || '',
    };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format amount for display
 */
export function formatCurrency(amount: number, currency: string = 'NIO'): string {
    const formatter = new Intl.NumberFormat('es-NI', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(amount);
}

/**
 * Available payment gateways with their info
 */
export const PAYMENT_GATEWAYS = {
    stripe: {
        name: 'Stripe',
        description: 'Tarjetas de crédito/débito internacionales',
        currencies: ['USD', 'EUR'],
        icon: '💳',
    },
    tilopay: {
        name: 'TiloPay',
        description: 'Pagos locales Nicaragua (BAC, Banpro, Lafise)',
        currencies: ['NIO', 'USD'],
        icon: '🇳🇮',
    },
    powertranz: {
        name: 'PowerTranz',
        description: 'Tarjetas Visa/Mastercard Caribe y Latinoamérica',
        currencies: ['USD'],
        icon: '🌎',
    },
} as const;
