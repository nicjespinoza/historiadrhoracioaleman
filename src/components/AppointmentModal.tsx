import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { GlassCard } from './premium-ui/GlassCard';
import { FloatingLabelInput } from './premium-ui/FloatingLabelInput';
import { api } from '../../api';
import { Patient } from '../types';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patients: Patient[];
    preSelectedPatientId?: string;
}

export const AppointmentModal = ({ isOpen, onClose, onSuccess, patients, preSelectedPatientId }: AppointmentModalProps) => {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [availabilityMsg, setAvailabilityMsg] = useState<{ type: 'success' | 'error' | 'neutral', text: string } | null>(null);
    const [suggestion, setSuggestion] = useState<{ date: string; label: string } | null>(null);

    const [formData, setFormData] = useState<{
        patientId: string;
        date: string;
        time: string;
        type: 'presencial' | 'virtual';
        reason: string;
    }>({
        patientId: preSelectedPatientId || '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'presencial',
        reason: ''
    });

    const getSuggestedFollowUp = (text: string) => {
        if (!text || text.length < 3) return null;
        const lower = text.toLowerCase();
        const today = new Date();

        if (lower.match(/diabetes|hta|crónico|cronico/)) {
            const d = new Date(today);
            d.setMonth(d.getMonth() + 3);
            return { date: d.toISOString().split('T')[0], label: '3 meses' };
        }
        if (lower.match(/infección|infeccion|agudo|gripe/)) {
            const d = new Date(today);
            d.setDate(d.getDate() + 7);
            return { date: d.toISOString().split('T')[0], label: '7 días' };
        }
        if (lower.match(/control|niño sano/)) {
            const d = new Date(today);
            d.setFullYear(d.getFullYear() + 1);
            return { date: d.toISOString().split('T')[0], label: '1 año' };
        }

        // Default logic: If there is text but no specific match, suggest 1 month
        const d = new Date(today);
        d.setMonth(d.getMonth() + 1);
        return { date: d.toISOString().split('T')[0], label: '1 mes' };
    };

    useEffect(() => {
        const sugg = getSuggestedFollowUp(formData.reason);
        setSuggestion(sugg);
    }, [formData.reason]);

    useEffect(() => {
        if (preSelectedPatientId) {
            setFormData(prev => ({ ...prev, patientId: preSelectedPatientId }));
        }
    }, [preSelectedPatientId]);

    // Check availability when date or time changes
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.date || !formData.time) return;

            setChecking(true);
            setAvailabilityMsg(null);

            try {
                // Fetch all appointments to check for conflicts
                // In a real app, this should be a specific endpoint like /api/appointments/check-availability
                const appointments = await api.getAppointments();
                const conflict = appointments.find((apt: any) =>
                    apt.date === formData.date && apt.time === formData.time
                );

                if (conflict) {
                    setAvailabilityMsg({ type: 'error', text: 'Horario no disponible. Ya existe una cita.' });
                } else {
                    setAvailabilityMsg({ type: 'success', text: 'Horario disponible.' });
                }
            } catch (error) {
                console.error("Error checking availability", error);
            } finally {
                setChecking(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.date, formData.time]);

    const handleSubmit = async () => {
        if (!formData.patientId) return alert('Seleccione un paciente');
        if (availabilityMsg?.type === 'error') return alert('El horario seleccionado no está disponible');

        setLoading(true);
        try {
            await api.createAppointment(formData);
            onSuccess();
            onClose();
        } catch (e) {
            alert('Error al crear cita');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <GlassCard className="w-full max-w-md bg-white relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" /> Agendar Cita
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Paciente</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-700"
                            value={formData.patientId}
                            onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                            disabled={!!preSelectedPatientId}
                        >
                            <option value="">Seleccione un paciente...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.firstName} {p.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Tipo de Cita</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'presencial' })}
                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === 'presencial' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                            >
                                Presencial
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'virtual' })}
                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === 'virtual' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                            >
                                Virtual
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FloatingLabelInput
                            type="date"
                            label="Fecha"
                            value={formData.date}
                            onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
                            containerClassName="!mb-0"
                        />
                        <FloatingLabelInput
                            type="time"
                            label="Hora"
                            value={formData.time}
                            onChange={(e: any) => setFormData({ ...formData, time: e.target.value })}
                            containerClassName="!mb-0"
                        />
                    </div>

                    {/* Availability Indicator */}
                    <div className="min-h-[24px]">
                        {checking ? (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} className="animate-spin" /> Verificando disponibilidad...
                            </p>
                        ) : availabilityMsg ? (
                            <p className={`text-xs font-bold flex items-center gap-1 ${availabilityMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {availabilityMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                {availabilityMsg.text}
                            </p>
                        ) : null}
                    </div>

                    <FloatingLabelInput
                        label="Motivo de la consulta"
                        value={formData.reason}
                        onChange={(e: any) => setFormData({ ...formData, reason: e.target.value })}
                    />

                    {suggestion && (
                        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                <Lightbulb size={16} className="text-blue-600 flex-shrink-0" />
                                <span>
                                    <span className="font-bold">Sugerencia clínica:</span> Control en {suggestion.label}
                                </span>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, date: suggestion.date })}
                                className="text-xs font-bold bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                            >
                                Aplicar fecha ({new Date(suggestion.date).toLocaleDateString()})
                            </button>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || availabilityMsg?.type === 'error'}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Agendando...' : 'Confirmar Cita'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
