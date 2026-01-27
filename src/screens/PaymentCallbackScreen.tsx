/**
 * Payment Callback Screen
 * Handles the return from 3D Secure authentication (PowerTranz/TiloPay)
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'error';

interface VerifyResponse {
    success: boolean;
    message: string;
    transactionId?: string;
}

export const PaymentCallbackScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [message, setMessage] = useState<string>('');
    const [transactionId, setTransactionId] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            // Get parameters from URL
            const statusParam = searchParams.get('status');
            const orderId = searchParams.get('orderId');
            const errorMessage = searchParams.get('message');

            // If we have a direct status (from our webhook redirect)
            if (statusParam === 'success') {
                setStatus('success');
                setMessage('¡Pago completado exitosamente!');
                setTransactionId(orderId || '');

                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                return;
            }

            if (statusParam === 'failed') {
                setStatus('failed');
                setMessage(errorMessage || 'El pago no pudo ser procesado');
                return;
            }

            if (statusParam === 'error') {
                setStatus('error');
                setMessage(errorMessage || 'Ocurrió un error durante el proceso de pago');
                return;
            }

            // If no direct status, try to verify with the backend
            if (orderId) {
                try {
                    const app = getApp();
                    const functions = getFunctions(app, 'us-central1');
                    const verifyPayment = httpsCallable<{ orderId: string }, VerifyResponse>(
                        functions,
                        'verifyPowerTranzPayment'
                    );

                    const response = await verifyPayment({ orderId });

                    if (response.data.success) {
                        setStatus('success');
                        setMessage(response.data.message);
                        setTransactionId(response.data.transactionId || orderId);

                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    } else {
                        setStatus('failed');
                        setMessage(response.data.message);
                    }
                } catch (error: any) {
                    console.error('Verify payment error:', error);
                    setStatus('error');
                    setMessage('No se pudo verificar el estado del pago');
                }
            } else {
                // No orderId, show error
                setStatus('error');
                setMessage('No se recibió información del pago');
            }
        };

        handleCallback();
    }, [searchParams]);

    const handleGoToDashboard = () => {
        navigate('/app/patient/dashboard');
    };

    const handleRetry = () => {
        navigate('/app/patient/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
                {/* Loading State */}
                {status === 'loading' && (
                    <div className="py-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Verificando Pago
                        </h2>
                        <p className="text-gray-500">
                            Por favor espere mientras confirmamos su transacción...
                        </p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="py-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                        >
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Pago Exitoso!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {message}
                        </p>

                        {transactionId && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-xs text-gray-500 mb-1">ID de Transacción</p>
                                <p className="text-sm font-mono font-bold text-gray-900 break-all">
                                    {transactionId}
                                </p>
                            </div>
                        )}

                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-green-700">
                                ✓ Su consulta ha sido confirmada<br />
                                ✓ El chat con el médico ha sido activado
                            </p>
                        </div>

                        <button
                            onClick={handleGoToDashboard}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Home size={20} />
                            Ir al Dashboard
                        </button>
                    </motion.div>
                )}

                {/* Failed State */}
                {status === 'failed' && (
                    <div className="py-6">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                            <XCircle className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Pago No Completado
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700">
                                El pago no pudo ser procesado. Esto puede deberse a:
                            </p>
                            <ul className="text-sm text-red-600 mt-2 text-left list-disc list-inside">
                                <li>Fondos insuficientes</li>
                                <li>Tarjeta rechazada por el banco</li>
                                <li>Verificación 3D Secure fallida</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Intentar de Nuevo
                            </button>
                            <button
                                onClick={handleGoToDashboard}
                                className="w-full py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="py-6">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <AlertCircle className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Error de Verificación
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-700">
                                Si cree que su pago fue procesado, por favor contacte a soporte con el número de su orden.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleGoToDashboard}
                                className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={20} />
                                Ir al Dashboard
                            </button>
                            <a
                                href="https://wa.me/50589776879"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 text-green-600 font-medium hover:bg-green-50 rounded-xl transition-colors"
                            >
                                Contactar Soporte por WhatsApp
                            </a>
                        </div>
                    </div>
                )}

                {/* Security Note */}
                <p className="mt-6 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    🔒 Transacción protegida con encriptación SSL
                </p>
            </motion.div>
        </div>
    );
};

export default PaymentCallbackScreen;
