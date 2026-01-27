import React, { useState, useCallback, memo, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Patient, InitialHistory } from '../types';
import * as C from '../constants';
import { api } from '../../api';
import { CheckboxList } from '../components/ui/FormComponents';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { Toast, ToastType } from '../components/ui/Toast';
import { getDefaultInitialHistoryValues } from '../schemas/patientSchemas';

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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 ${className}`}>
        <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
        {children}
    </div>
));

SectionCard.displayName = 'SectionCard';

interface InitialHistoryScreenProps {
    patients: Patient[];
    setHistories: React.Dispatch<React.SetStateAction<InitialHistory[]>>;
}

export const InitialHistoryScreen = ({ patients, setHistories }: InitialHistoryScreenProps) => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const patient = patients.find(p => p.id === patientId);

    // Initialize state with new flat structure
    const [h, setH] = useState<InitialHistory>(() => {
        if (location.state?.history) {
            return location.state.history;
        }
        const defaults = getDefaultInitialHistoryValues(patient?.id || '');
        return {
            ...defaults,
            id: Math.random().toString(36),
            patientId: patient?.id || '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        } as InitialHistory;
    });

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

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

    // Save handler
    const handleSave = async () => {
        if (!patient) return;
        try {
            const historyData = { ...h, isValidated: true } as InitialHistory;
            if (location.state?.history) {
                await api.updateHistory(h.id, historyData);
                setHistories(prev => prev.map(hist => hist.id === h.id ? historyData : hist));
            } else {
                await api.createHistory(historyData);
                setHistories(prev => [...prev, historyData]);
            }
            showToast("Historia clínica guardada exitosamente", 'success');
            setTimeout(() => navigate(`/app/profile/${patient.id}`), 1500);
        } catch (e) {
            console.error(e);
            showToast("Error al guardar historia clínica", 'error');
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Paciente no encontrado.</div>;
    }

    return (
        <div className="min-h-screen w-full bg-[#083c79]">
            <div className="max-w-5xl mx-auto p-4 pb-32">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b border-gray-200 mb-8 shadow-sm relative p-6">
                    <button type="button" onClick={() => navigate(-1)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Historia Clínica Inicial</h2>
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
                            <span className="text-xs uppercase font-bold text-gray-400">Hora</span>
                            <input
                                type="time"
                                value={h.time}
                                onChange={e => updateField('time', e.target.value)}
                                className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-400">Paciente</span>
                            <span className="font-medium text-gray-800">{patient.firstName} {patient.lastName} ({patient.ageDetails})</span>
                        </div>
                    </div>
                </div>

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

                {/* 6. Examen Físico Detallado */}
                <SectionCard title="6. Examen Físico Detallado">
                    <div className="space-y-4">
                        <FloatingLabelInput
                            label="Examen Físico General"
                            as="textarea"
                            rows={3}
                            value={h.physicalExamGeneral}
                            onChange={e => updateField('physicalExamGeneral', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Abdomen"
                            as="textarea"
                            rows={3}
                            value={h.abdomen}
                            onChange={e => updateField('abdomen', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="TDR (Tórax y Respiratorio)"
                            as="textarea"
                            rows={3}
                            value={h.tdr}
                            onChange={e => updateField('tdr', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Genitales"
                            as="textarea"
                            rows={3}
                            value={h.genitals}
                            onChange={e => updateField('genitals', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Miembros"
                            as="textarea"
                            rows={3}
                            value={h.limbs}
                            onChange={e => updateField('limbs', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Neurológico"
                            as="textarea"
                            rows={3}
                            value={h.neurological}
                            onChange={e => updateField('neurological', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Avalúo"
                            as="textarea"
                            rows={3}
                            value={h.assessment}
                            onChange={e => updateField('assessment', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 7. Diagnóstico y Estudios */}
                <SectionCard title="7. Diagnóstico y Estudios">
                    <div className="space-y-4">
                        <FloatingLabelInput
                            label="Diagnóstico"
                            as="textarea"
                            rows={4}
                            value={h.diagnosis}
                            onChange={e => updateField('diagnosis', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Estudio de Laboratorio"
                            as="textarea"
                            rows={3}
                            value={h.labStudies}
                            onChange={e => updateField('labStudies', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Órdenes de Exámenes"
                            as="textarea"
                            rows={3}
                            value={h.examOrders}
                            onChange={e => updateField('examOrders', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Estudio Radiológico"
                            as="textarea"
                            rows={3}
                            value={h.radiologyStudies}
                            onChange={e => updateField('radiologyStudies', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-50 pointer-events-none">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                    >
                        <Save size={20} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
