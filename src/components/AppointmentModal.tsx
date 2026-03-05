import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Lightbulb, Globe } from 'lucide-react';
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
        syncToGoogle: boolean;
        googleTitle: string;
        googleDescription: string;
    }>({
        patientId: preSelectedPatientId || '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'presencial',
        reason: '',
        syncToGoogle: true,
        googleTitle: '',
        googleDescription: ''
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
            const p = patients.find(p => p.id === preSelectedPatientId);
            if (p) {
                setFormData(prev => ({ ...prev, googleTitle: p.id || p.legacyId || '' }));
            }
        }
    }, [preSelectedPatientId, patients]);

    // Check availability when date or time changes
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.date || !formData.time) return;

            setChecking(true);
            setAvailabilityMsg(null);

            try {
                // 1. Fetch local appointments
                const appointments = await api.getAppointments();
                const conflict = appointments.find((apt: any) =>
                    apt.date === formData.date && apt.time === formData.time
                );

                if (conflict) {
                    setAvailabilityMsg({ type: 'error', text: 'Horario ocupado en agenda local.' });
                    setChecking(false);
                    return;
                }

                // 2. Fetch Google Calendar events if connected
                const timeMin = `${formData.date}T${formData.time}:00Z`;
                const end = new Date(new Date(`${formData.date}T${formData.time}:00`).getTime() + 15 * 60000);
                const timeMax = end.toISOString();

                const gcEvents = await api.getGoogleCalendarEvents(timeMin, timeMax);
                if (gcEvents && gcEvents.length > 0) {
                    setAvailabilityMsg({ type: 'error', text: 'Horario ocupado en su Google Calendar.' });
                } else {
                    setAvailabilityMsg({ type: 'success', text: 'Disponible (Local & Google Calendar).' });
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
            const appointment = await api.createAppointment({
                patientId: formData.patientId,
                date: formData.date,
                time: formData.time,
                type: formData.type,
                reason: formData.reason,
                description: formData.googleDescription
            });

            if (formData.syncToGoogle) {
                const p = patients.find(p => p.id === formData.patientId);
                await api.syncToGoogleCalendar({
                    ...appointment,
                    title: formData.googleTitle,
                    description: formData.googleDescription
                }, p);
            }

            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Error al crear cita');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <GlassCard className="w-full max-w-lg bg-white relative max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" /> Agendar Cita
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Patient Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1 ml-1 uppercase text-[10px]">Paciente</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-700 text-sm"
                                value={formData.patientId}
                                onChange={e => {
                                    const pId = e.target.value;
                                    const p = patients.find(p => p.id === pId);
                                    setFormData({
                                        ...formData,
                                        patientId: pId,
                                        googleTitle: p ? (p.legacyId || p.id) : ''
                                    });
                                }}
                                disabled={!!preSelectedPatientId}
                            >
                                <option value="">Seleccione...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1 ml-1 uppercase text-[10px]">Tipo</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'presencial' })}
                                    className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.type === 'presencial' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                >
                                    Presencial
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'virtual' })}
                                    className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.type === 'virtual' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                >
                                    Virtual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DateTime & Availability */}
                    <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="grid grid-cols-2 gap-4 mb-3">
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
                        <div className="min-h-[20px]">
                            {checking ? (
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 font-bold italic">
                                    <Clock size={12} className="animate-spin" /> Sincronizando disponibilidad...
                                </p>
                            ) : availabilityMsg ? (
                                <p className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-wider ${availabilityMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {availabilityMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {availabilityMsg.text}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Reason */}
                    <FloatingLabelInput
                        label="Motivo Clínico"
                        value={formData.reason}
                        onChange={(e: any) => setFormData({ ...formData, reason: e.target.value })}
                    />

                    {/* Google Calendar Section */}
                    <div className="bg-white border-2 border-black p-5 rounded-2xl space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between">
                            <h4 className="font-black text-sm flex items-center gap-2 uppercase tracking-tighter">
                                <Globe size={18} className="text-blue-600" /> Sincronizar Google Calendar
                            </h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.syncToGoogle}
                                    onChange={(e) => setFormData({ ...formData, syncToGoogle: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {formData.syncToGoogle && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-800 font-medium">
                                    La cita se agregará automáticamente a su calendario personal con el ID del paciente como título.
                                </div>
                                <FloatingLabelInput
                                    label="Título del Evento"
                                    value={formData.googleTitle}
                                    onChange={(e: any) => setFormData({ ...formData, googleTitle: e.target.value })}
                                />
                                <div>
                                    <label className="block text-[10px] font-black text-gray-700 mb-1 ml-1 uppercase">Descripción de Calendar</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none hover:bg-white transition-all text-sm h-24 resize-none"
                                        placeholder="Detalles adicionales para el evento de Google..."
                                        value={formData.googleDescription}
                                        onChange={(e) => setFormData({ ...formData, googleDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {suggestion && (
                        <div className="bg-[#083c79]/5 border border-[#083c79]/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-[#083c79] font-medium">
                                <Lightbulb size={16} />
                                <span>Sugerencia: Control en {suggestion.label}</span>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, date: suggestion.date })}
                                className="text-[10px] font-black bg-white text-[#083c79] border-2 border-black px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                            >
                                Aplicar ({new Date(suggestion.date).toLocaleDateString()})
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || availabilityMsg?.type === 'error'}
                            className="flex-1 px-4 py-4 bg-[#083c79] text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl disabled:opacity-50 text-sm active:scale-95"
                        >
                            {loading ? 'Creando...' : (formData.syncToGoogle ? 'Confirmar y Sincronizar' : 'Confirmar Cita')}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
