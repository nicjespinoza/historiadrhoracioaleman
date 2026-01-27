import React, { useState, useMemo } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Patient, SubsequentConsult } from '../types';
import { api } from '../../api';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, ToastType } from '../components/ui/Toast';

const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

interface ConsultScreenProps {
    patients: Patient[];
    setConsults: React.Dispatch<React.SetStateAction<SubsequentConsult[]>>;
}

// Section Card Component
const SectionCard = ({ title, children, className = "" }: { title: string; children?: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 ${className}`}>
        <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
        {children}
    </div>
);

export const ConsultScreen = ({ patients, setConsults }: ConsultScreenProps) => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const patient = patients.find(p => p.id === patientId);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

    // Initialize state with flat structure
    const [c, setC] = useState<Omit<SubsequentConsult, 'id'>>({
        patientId: patient?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        motives: {},
        otherMotive: '',
        evolutionTime: '',
        historyOfPresentIllness: '',
        // Vital Signs
        vitalSigns: { fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '' },
        anthropometrics: { weight: '', height: '', imc: '' },
        // Physical Exam
        physicalExamGeneral: '',
        abdomen: '',
        tdr: '',
        genitals: '',
        limbs: '',
        neurological: '',
        assessment: '',
        // Diagnosis & Studies
        diagnosis: '',
        labStudies: '',
        examOrders: '',
        radiologyStudies: ''
    });

    const [saving, setSaving] = useState(false);

    // Calculate IMC automatically
    const calculatedImc = useMemo(() => {
        const weight = parseFloat(c.anthropometrics.weight);
        const height = parseFloat(c.anthropometrics.height);
        if (weight > 0 && height > 0) {
            // Assuming height is in meters
            return (weight / (height * height)).toFixed(1);
        }
        return '';
    }, [c.anthropometrics.weight, c.anthropometrics.height]);

    // Update IMC when weight or height changes
    React.useEffect(() => {
        if (calculatedImc && calculatedImc !== c.anthropometrics.imc) {
            setC(prev => ({
                ...prev,
                anthropometrics: { ...prev.anthropometrics, imc: calculatedImc }
            }));
        }
    }, [calculatedImc]);

    // Generic field update
    const updateField = <K extends keyof Omit<SubsequentConsult, 'id'>>(key: K, value: Omit<SubsequentConsult, 'id'>[K]) => {
        setC(prev => ({ ...prev, [key]: value }));
    };

    // Vital signs update
    const updateVitalSign = (key: string, value: string) => {
        setC(prev => ({
            ...prev,
            vitalSigns: { ...prev.vitalSigns, [key]: value }
        }));
    };

    // Anthropometrics update
    const updateAnthropometric = (key: string, value: string) => {
        setC(prev => ({
            ...prev,
            anthropometrics: { ...prev.anthropometrics, [key]: value }
        }));
    };

    const handleSave = async () => {
        if (!patient) return;
        setSaving(true);
        try {
            const savedConsult = await api.createConsult(c);
            setConsults(prev => [...prev, savedConsult]);
            showToast("Consulta guardada exitosamente", 'success');
            setTimeout(() => navigate(`/app/profile/${patient.id}`), 1500);
        } catch (e) {
            console.error(e);
            showToast("Error al guardar consulta", 'error');
        } finally {
            setSaving(false);
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
                    <button onClick={() => navigate(-1)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Consulta Subsecuente</h2>
                    <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-400">Fecha</span>
                            <input
                                type="date"
                                value={c.date}
                                onChange={e => updateField('date', e.target.value)}
                                className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-400">Hora</span>
                            <input
                                type="time"
                                value={c.time}
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

                {/* 1. Signos Vitales y Antropometría */}
                <SectionCard title="1. Signos Vitales y Antropometría">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <FloatingLabelInput
                            label="P/A (mmHg)"
                            value={c.vitalSigns.pa}
                            onChange={e => updateVitalSign('pa', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="FC (lpm)"
                            value={c.vitalSigns.fc}
                            onChange={e => updateVitalSign('fc', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="FR (rpm)"
                            value={c.vitalSigns.fr}
                            onChange={e => updateVitalSign('fr', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Temp (°C)"
                            value={c.vitalSigns.temp}
                            onChange={e => updateVitalSign('temp', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FloatingLabelInput
                            label="SpO2 (%)"
                            value={c.vitalSigns.sat02}
                            onChange={e => updateVitalSign('sat02', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Peso (kg)"
                            value={c.anthropometrics.weight}
                            onChange={e => updateAnthropometric('weight', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Talla (m)"
                            value={c.anthropometrics.height}
                            onChange={e => updateAnthropometric('height', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="IMC"
                            value={c.anthropometrics.imc}
                            onChange={e => updateAnthropometric('imc', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 2. Historia de la Enfermedad Actual */}
                <SectionCard title="2. Historia de la Enfermedad Actual">
                    <FloatingLabelInput
                        label="Describa la historia de la enfermedad actual"
                        as="textarea"
                        rows={6}
                        value={c.historyOfPresentIllness}
                        onChange={e => updateField('historyOfPresentIllness', e.target.value)}
                        wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                    />
                </SectionCard>

                {/* 3. Examen Físico */}
                <SectionCard title="3. Examen Físico">
                    <div className="space-y-4">
                        <FloatingLabelInput
                            label="Examen Físico General"
                            as="textarea"
                            rows={3}
                            value={c.physicalExamGeneral}
                            onChange={e => updateField('physicalExamGeneral', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Abdomen"
                            as="textarea"
                            rows={3}
                            value={c.abdomen}
                            onChange={e => updateField('abdomen', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="TDR (Tórax y Respiratorio)"
                            as="textarea"
                            rows={3}
                            value={c.tdr}
                            onChange={e => updateField('tdr', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Genitales"
                            as="textarea"
                            rows={3}
                            value={c.genitals}
                            onChange={e => updateField('genitals', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Miembros"
                            as="textarea"
                            rows={3}
                            value={c.limbs}
                            onChange={e => updateField('limbs', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Neurológico"
                            as="textarea"
                            rows={3}
                            value={c.neurological}
                            onChange={e => updateField('neurological', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Avalúo"
                            as="textarea"
                            rows={3}
                            value={c.assessment}
                            onChange={e => updateField('assessment', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 4. Diagnóstico y Plan */}
                <SectionCard title="4. Diagnóstico y Plan">
                    <div className="space-y-4">
                        <FloatingLabelInput
                            label="Diagnóstico"
                            as="textarea"
                            rows={4}
                            value={c.diagnosis}
                            onChange={e => updateField('diagnosis', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Estudio de Laboratorio"
                            as="textarea"
                            rows={3}
                            value={c.labStudies}
                            onChange={e => updateField('labStudies', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Órdenes de Exámenes"
                            as="textarea"
                            rows={3}
                            value={c.examOrders}
                            onChange={e => updateField('examOrders', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Estudio Radiológico"
                            as="textarea"
                            rows={3}
                            value={c.radiologyStudies}
                            onChange={e => updateField('radiologyStudies', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-50 pointer-events-none">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={20} /> Guardar Consulta
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
