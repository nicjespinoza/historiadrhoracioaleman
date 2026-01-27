import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, AlertCircle, Loader2, Banknote, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { api } from '../../../api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    patientId: string;
    customerEmail?: string;
    customerName?: string;
}

type PaymentMethod = 'powertranz' | 'tilopay' | 'manual';

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    appointment,
    patientId,
    customerEmail,
    customerName
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showManualConfirm, setShowManualConfirm] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (selectedMethod === 'powertranz' || selectedMethod === 'tilopay') {
                // For now, show message that online payments redirect to external page
                // In production, this would redirect to the hosted payment page
                setError('Los pagos en línea redirigirán a la página segura del banco. Por ahora, use Pago Manual.');
                setIsLoading(false);
                return;
            }

            if (selectedMethod === 'manual') {
                setShowManualConfirm(true);
                setIsLoading(false);
                return;
            }

        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Error al procesar el pago. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualPaymentConfirm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await api.updateAppointment(appointment.id, {
                paymentStatus: 'paid',
                paymentMethod: 'manual',
                paidAt: new Date().toISOString(),
                paid: true
            } as any);

            window.location.href = '/app/patient/dashboard?payment=success';
        } catch (err: any) {
            console.error('Manual payment error:', err);
            setError('Error al confirmar el pago. Intente nuevamente.');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header Gradient - Subtle Blue */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-100" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-10 rounded-full hover:bg-white/50 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative p-6 pt-8">
                            {/* Manual Payment Confirmation Dialog */}
                            {showManualConfirm ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm border border-green-200">
                                        <Banknote size={40} />
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Pago Manual</h2>
                                    <p className="text-gray-500 text-sm mb-6">
                                        ¿El paciente realizó el pago en efectivo o por transferencia?
                                    </p>

                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                        <p className="text-amber-800 text-xs text-left">
                                            <strong>⚠️ Importante:</strong> Solo confirme si el pago ya fue recibido.
                                            Esto activará el acceso a la consulta.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-100 shadow-inner">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Monto</span>
                                            <span className="text-lg font-bold text-gray-900">C$ 1,200.00</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Fecha</span>
                                            <span className="text-sm font-medium text-gray-700">{appointment.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Hora</span>
                                            <span className="text-sm font-medium text-gray-700">{appointment.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowManualConfirm(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleManualPaymentConfirm}
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    Confirmando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    Confirmar Pago
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Main Payment View */}
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 text-blue-600 shadow-md border border-blue-100">
                                            <ShieldCheck size={32} />
                                        </div>

                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmar Consulta</h2>
                                        <div className="text-4xl font-black text-gray-900 tracking-tight">
                                            C$ 1,200.00
                                        </div>
                                    </div>

                                    {/* Appointment Summary */}
                                    <div className="bg-white rounded-xl p-4 mb-6 text-left border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Fecha</span>
                                            <span className="text-sm font-bold text-gray-900">{appointment.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Hora</span>
                                            <span className="text-sm font-bold text-gray-900">{appointment.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Tipo</span>
                                            <span className={`text-sm font-bold ${appointment.type === 'virtual' ? 'text-purple-600' : 'text-blue-600'}`}>
                                                {appointment.type === 'virtual' ? '📹 Virtual' : '🏥 Presencial'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="space-y-3 mb-6">
                                        <p className="text-left text-xs font-bold text-gray-400 uppercase ml-1">Método de Pago</p>

                                        {/* Manual Payment - Primary Option */}
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'manual' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="method"
                                                value="manual"
                                                checked={selectedMethod === 'manual'}
                                                onChange={() => setSelectedMethod('manual')}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'manual' ? 'border-green-500' : 'border-gray-300'}`}>
                                                {selectedMethod === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                            </div>
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                                    <Banknote size={20} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-bold text-gray-900 text-sm">Pago Manual</p>
                                                    <p className="text-xs text-gray-500">Efectivo, transferencia o depósito</p>
                                                </div>
                                                <span className="text-xs text-green-700 font-bold bg-green-100 px-2 py-1 rounded">Recomendado</span>
                                            </div>
                                        </label>

                                        {/* PowerTranz */}
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all opacity-60 ${selectedMethod === 'powertranz' ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="method"
                                                value="powertranz"
                                                checked={selectedMethod === 'powertranz'}
                                                onChange={() => setSelectedMethod('powertranz')}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'powertranz' ? 'border-blue-400' : 'border-gray-300'}`}>
                                                {selectedMethod === 'powertranz' && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                                            </div>
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-bold text-gray-900 text-sm">Tarjeta de Crédito/Débito</p>
                                                    <p className="text-xs text-gray-500">Próximamente</p>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-400" />
                                            </div>
                                        </label>

                                        {/* TiloPay */}
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all opacity-60 ${selectedMethod === 'tilopay' ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="method"
                                                value="tilopay"
                                                checked={selectedMethod === 'tilopay'}
                                                onChange={() => setSelectedMethod('tilopay')}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'tilopay' ? 'border-blue-400' : 'border-gray-300'}`}>
                                                {selectedMethod === 'tilopay' && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                                            </div>
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-bold text-gray-900 text-sm">TiloPay</p>
                                                    <p className="text-xs text-gray-500">Próximamente</p>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-400" />
                                            </div>
                                        </label>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    {/* Pay Button */}
                                    <button
                                        onClick={handlePayment}
                                        disabled={isLoading}
                                        className="w-full py-4 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Banknote size={18} />
                                                Confirmar Pago
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-4 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                        <ShieldCheck size={12} /> Pagos seguros y confiables
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
