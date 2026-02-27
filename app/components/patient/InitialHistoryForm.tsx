"use client";

import React, { useState, useCallback, memo, useEffect } from 'react';
import { Save, LogOut } from 'lucide-react'; // Added LogOut
import { InitialHistory } from '@/src/types';
import { api } from '@/api';
import { FloatingLabelInput } from '@/src/components/premium-ui/FloatingLabelInput';
import { Toast, ToastType } from '@/src/components/ui/Toast';
import { getDefaultInitialHistoryValues } from '@/src/schemas/patientSchemas';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

// ... (ToggleSwitch and SectionCard components remain unchanged)

// Toggle Switch Component
const ToggleSwitch = memo(({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
        <span className="font-medium text-gray-700">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${checked ? 'translate-x-7' : 'translate-x-0'}`}
            />
            <span className="sr-only">{label}</span>
        </button>
    </div>
));

ToggleSwitch.displayName = 'ToggleSwitch';

// Section Card Component
const SectionCard = memo(({ title, children, className = "" }: { title: string; children?: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 ${className}`}>
        <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
        {children}
    </div>
));

SectionCard.displayName = 'SectionCard';

export const InitialHistoryForm = () => {
    const router = useRouter();
    const { currentUser, logout } = useAuth(); // Destructure logout
    const [loading, setLoading] = useState(false);

    // Initialize state
    const [h, setH] = useState<InitialHistory | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
            showToast("Error al cerrar sesión", 'error');
        }
    };

    useEffect(() => {
        if (currentUser) {
            const defaults = getDefaultInitialHistoryValues(currentUser.uid);
            setH({
                ...defaults,
                id: currentUser.uid, // Use user ID as history ID for 1:1 relationship or generate new
                patientId: currentUser.uid,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            } as InitialHistory);
        }
    }, [currentUser]);

    // Generic update function
    const updateField = useCallback(<K extends keyof InitialHistory>(key: K, value: InitialHistory[K]) => {
        setH(prev => prev ? ({ ...prev, [key]: value }) : null);
    }, []);

    // Handle motive change
    const handleMotiveChange = useCallback((k: string, v: boolean) => {
        setH(prev => prev ? ({ ...prev, motives: { ...prev.motives, [k]: v } }) : null);
    }, []);

    // Handle vital signs update
    const updateVitalSign = useCallback((key: string, value: string) => {
        setH(prev => prev ? ({
            ...prev,
            vitalSigns: { ...prev.vitalSigns, [key]: value }
        }) : null);
    }, []);

    // Handle anthropometrics update
    const updateAnthropometric = useCallback((key: string, value: string) => {
        setH(prev => prev ? ({
            ...prev,
            anthropometrics: { ...prev.anthropometrics, [key]: value }
        }) : null);
    }, []);

    // Save handler
    const handleSave = async () => {
        if (!currentUser || !h) return;
        setLoading(true);
        try {
            const historyData = { ...h, isValidated: false } as InitialHistory; // Initially not validated by doctor?

            // Check if history already exists to decide update vs create is handled by business logic usually, 
            // but for simple flow we might just use createHistory which relies on addDoc.
            // A better approach for 1:1 is setting 'histories' subcollection with a specific ID or limiting to 1.
            // For now, let's use the existing api.createHistory.

            await api.createHistory(historyData);

            showToast("Historia clínica guardada exitosamente", 'success');
            setTimeout(() => router.push('/app/patient/dashboard'), 1500);
        } catch (e) {
            console.error(e);
            showToast("Error al guardar historia clínica", 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || !h) {
        return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    }

    return (
        <div className="min-h-screen w-full bg-green-700">
            <div className="max-w-5xl mx-auto p-4 pb-32">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b border-gray-200 mb-8 shadow-sm relative p-6">
                    <button
                        onClick={handleLogout}
                        className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Completar Ficha Médica</h2>
                    <p className="text-gray-500">Por favor complete su información inicial.</p>

                    <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-400">Fecha</span>
                            <input
                                type="date"
                                value={h.date}
                                onChange={e => updateField('date', e.target.value)}
                                className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-400">Email</span>
                            <span className="font-medium text-gray-800">{currentUser.email}</span>
                        </div>
                    </div>
                </div>

                {/* 1. Motivo de Consulta */}
                <SectionCard title="1. Motivo de Consulta Principal">
                    <FloatingLabelInput
                        label="Describa brevemente por qué nos visita"
                        as="textarea"
                        rows={4}
                        value={h.otherMotive}
                        onChange={e => updateField('otherMotive', e.target.value)}
                        wrapperClassName="bg-white border-2 border-gray-200 focus-within:border-blue-500 rounded-xl"
                    />
                </SectionCard>

                {/* 2. Antecedentes Patológicos Personales */}
                <SectionCard title="2. Antecedentes Médicos (Marque si aplica)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleSwitch label="Diabetes" checked={h.diabetes} onChange={v => updateField('diabetes', v)} />
                        <ToggleSwitch label="Hipertensión (Presión Alta)" checked={h.hypertension} onChange={v => updateField('hypertension', v)} />
                        <ToggleSwitch label="Enfermedades del Corazón" checked={h.cardiopathy} onChange={v => updateField('cardiopathy', v)} />
                        <ToggleSwitch label="Alergias" checked={h.allergies} onChange={v => updateField('allergies', v)} />
                        <ToggleSwitch label="Cirugías Previas" checked={h.surgeries} onChange={v => updateField('surgeries', v)} />
                    </div>
                    <div className="mt-4">
                        <FloatingLabelInput
                            label="Otros antecedentes importantes"
                            value={h.otherPathological}
                            onChange={e => updateField('otherPathological', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-200 focus-within:border-blue-500 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 3. Antecedentes No Patológicos */}
                <SectionCard title="3. Hábitos y Estilo de Vida">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleSwitch label="Fuma" checked={h.smoking} onChange={v => updateField('smoking', v)} />
                        <ToggleSwitch label="Consume Alcohol" checked={h.alcohol} onChange={v => updateField('alcohol', v)} />
                        <ToggleSwitch label="Consume Drogas" checked={h.drugs} onChange={v => updateField('drugs', v)} />
                        <ToggleSwitch label="Toma Medicamentos Actualmente" checked={h.medications} onChange={v => updateField('medications', v)} />
                    </div>
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-50 pointer-events-none">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className={`bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 flex items-center gap-2 shadow-lg shadow-green-700/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Guardando...' : <><Save size={20} /> Guardar Ficha</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
