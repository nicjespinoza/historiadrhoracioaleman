import React, { useState, useCallback, memo, useEffect } from 'react';
import { Save, LogOut } from 'lucide-react';
import { Patient, InitialHistory } from '../types';
import * as C from '../constants';
import { api } from '../../api';
import { CheckboxList } from '../components/ui/FormComponents';
import { useNavigate } from 'react-router-dom';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastType } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { getDefaultInitialHistoryValues } from '../schemas/patientSchemas';

const WhiteCard = ({ children, className, ...props }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`rounded-3xl bg-white shadow-xl p-6 border border-gray-200 ${className || ''}`}
        {...props}
    >
        {children}
    </motion.div>
);

const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

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
    <WhiteCard className={`mb-8 ${className}`}>
        <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
        {children}
    </WhiteCard>
));

SectionCard.displayName = 'SectionCard';

export const PatientHistoryScreen = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const p = localStorage.getItem('currentPatient');
        if (p) {
            setPatient(JSON.parse(p));
        } else {
            navigate('/app/patient/login');
        }
    }, [navigate]);

    // Initialize state with new flat structure
    const [h, setH] = useState<InitialHistory>(() => {
        const defaults = getDefaultInitialHistoryValues('');
        return {
            ...defaults,
            id: Math.random().toString(36),
            patientId: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        } as InitialHistory;
    });

    useEffect(() => {
        if (patient) {
            setH(prev => ({ ...prev, patientId: patient.id }));
        }
    }, [patient]);

    // Generic update function
    const updateField = useCallback(<K extends keyof InitialHistory>(key: K, value: InitialHistory[K]) => {
        setH(prev => ({ ...prev, [key]: value }));
    }, []);

    // Handle motive change
    const handleMotiveChange = useCallback((k: string, v: boolean) => {
        setH(prev => ({ ...prev, motives: { ...prev.motives, [k]: v } }));
    }, []);

    // Handle vital signs update
    const updateVitalSign = useCallback((key: string, value: string) => {
        setH(prev => ({
            ...prev,
            vitalSigns: { ...prev.vitalSigns, [key]: value }
        }));
    }, []);

    // Handle anthropometrics update
    const updateAnthropometric = useCallback((key: string, value: string) => {
        setH(prev => ({
            ...prev,
            anthropometrics: { ...prev.anthropometrics, [key]: value }
        }));
    }, []);

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
            localStorage.removeItem('currentPatient');
            navigate('/app/patient/login');
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    const handleSave = async () => {
        if (!patient) return;
        try {
            await api.createHistory({ ...h, isValidated: false });
            showToast("Historia enviada para revisión", 'success');
            setTimeout(() => navigate('/app/patient/dashboard'), 1500);
        } catch (e) {
            console.error(e);
            showToast("Error al guardar historia", 'error');
        }
    };

    if (!patient) return null;

    return (
        <div className="min-h-screen bg-[#083c79] p-4 pb-32">
            <div className="max-w-5xl mx-auto">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Header */}
                <WhiteCard className="rounded-t-2xl border-b-2 border-gray-900 mb-8 shadow-sm relative">
                    <button
                        onClick={handleLogout}
                        className="absolute top-6 right-6 p-2 bg-[#083c79] text-white hover:bg-red-600 rounded-full transition-colors shadow-md"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={24} />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Mi Historia Clínica</h2>
                    <p className="text-gray-500">Por favor complete su información médica para agilizar su consulta.</p>
                </WhiteCard>

                {/* 1. Motivo de Consulta */}
                <SectionCard title="1. Motivo de Consulta">
                    <FloatingLabelInput
                        label="Describa el motivo de consulta"
                        as="textarea"
                        rows={4}
                        value={h.otherMotive}
                        onChange={e => updateField('otherMotive', e.target.value)}
                        wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                    />
                </SectionCard>

                {/* 2. Antecedentes Patológicos Personales */}
                <SectionCard title="2. Antecedentes Patológicos Personales">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleSwitch label="Diabetes" checked={h.diabetes} onChange={v => updateField('diabetes', v)} />
                        <ToggleSwitch label="Hipertensión" checked={h.hypertension} onChange={v => updateField('hypertension', v)} />
                        <ToggleSwitch label="Cardiopatía" checked={h.cardiopathy} onChange={v => updateField('cardiopathy', v)} />
                        <ToggleSwitch label="Alergias" checked={h.allergies} onChange={v => updateField('allergies', v)} />
                        <ToggleSwitch label="Cirugías" checked={h.surgeries} onChange={v => updateField('surgeries', v)} />
                    </div>
                    <div className="mt-4">
                        <FloatingLabelInput
                            label="Otros (especifique)"
                            value={h.otherPathological}
                            onChange={e => updateField('otherPathological', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 3. Antecedentes No Patológicos */}
                <SectionCard title="3. Antecedentes No Patológicos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleSwitch label="Fumado" checked={h.smoking} onChange={v => updateField('smoking', v)} />
                        <ToggleSwitch label="Alcohol" checked={h.alcohol} onChange={v => updateField('alcohol', v)} />
                        <ToggleSwitch label="Drogas" checked={h.drugs} onChange={v => updateField('drugs', v)} />
                        <ToggleSwitch label="Medicamentos" checked={h.medications} onChange={v => updateField('medications', v)} />
                    </div>
                </SectionCard>

                {/* 4. Signos Vitales y Antropometría */}
                <SectionCard title="4. Signos Vitales y Antropometría">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <FloatingLabelInput
                            label="P/A (mmHg)"
                            value={h.vitalSigns?.pa || ''}
                            onChange={e => updateVitalSign('pa', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="FC (lpm)"
                            value={h.vitalSigns?.fc || ''}
                            onChange={e => updateVitalSign('fc', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="FR (rpm)"
                            value={h.vitalSigns?.fr || ''}
                            onChange={e => updateVitalSign('fr', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Temp (°C)"
                            value={h.vitalSigns?.temp || ''}
                            onChange={e => updateVitalSign('temp', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FloatingLabelInput
                            label="SpO2 (%)"
                            value={h.vitalSigns?.sat02 || ''}
                            onChange={e => updateVitalSign('sat02', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Peso (kg)"
                            value={h.anthropometrics?.weight || ''}
                            onChange={e => updateAnthropometric('weight', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Talla (m)"
                            value={h.anthropometrics?.height || ''}
                            onChange={e => updateAnthropometric('height', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="IMC"
                            value={h.anthropometrics?.imc || ''}
                            onChange={e => updateAnthropometric('imc', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 5. Historia de la Enfermedad Actual */}
                <SectionCard title="5. Historia de la Enfermedad Actual">
                    <FloatingLabelInput
                        label="Describa la historia de la enfermedad actual"
                        as="textarea"
                        rows={6}
                        value={h.currentIllnessHistory}
                        onChange={e => updateField('currentIllnessHistory', e.target.value)}
                        wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                    />
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 pointer-events-none">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95 pointer-events-auto"
                    >
                        <Save size={20} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
