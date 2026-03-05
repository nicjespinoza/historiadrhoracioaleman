import React, { useState, useMemo, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Patient, SubsequentConsult } from '../types';
import { api } from '../../api';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, ToastType } from '../components/ui/Toast';
import { MedicalOrderForm } from '../components/MedicalOrderForm';
import { MedicalOrder } from '../types';

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
    const { patientId, consultId } = useParams<{ patientId: string; consultId?: string }>();
    const isEdit = !!consultId;
    const navigate = useNavigate();
    const [localPatient, setLocalPatient] = useState<Patient | null>(null);

    React.useEffect(() => {
        if (patientId && !patients.find(p => p.id === patientId)) {
            api.getPatientById(patientId).then(p => { if (p) setLocalPatient(p); }).catch(console.error);
        }
    }, [patientId, patients]);

    const patient = patients.find(p => p.id === patientId) || localPatient;

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

    // Initialize state with flat structure
    const [c, setC] = useState<Omit<SubsequentConsult, 'id'> & { consultReason?: string }>({
        patientId: patient?.id || patientId || '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        consultReason: '',
        motives: {},
        otherMotive: '',
        evolutionTime: '',
        historyOfPresentIllness: '',
        pathologicalDetails: {},
        nonPathologicalDetails: {},
        // Vital Signs
        vitalSigns: { fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '' },
        anthropometrics: { weight: '', height: '', imc: '' },
        // Physical Exam Defaults
        physicalExamGeneral: 'Consciente, mutado, hidratado, afebril, patrón respiratorio, regulaGer, no uso de músculo accesorio, corazón rítmico, buen tono, no soplo',
        abdomen: '',
        tdr: '',
        genitals: '',
        limbs: 'No edema movilizando por su medio',
        neurological: 'Conservado',
        assessment: '',
        // Diagnosis & Studies
        diagnosis: '',
        labOfStudies: '',
        labImages: [],
        medicalOrder: {
            selectedTypes: [],
            recetarioMedico: '',
            estudiosRadiologicos: '',
            examenLaboratorio: '',
            constanciaMedica: '',
            ordenIngreso: {
                diagnostico: '',
                procedimiento: '',
                indicacionesPreQuirurgicas: ''
            }
        },
        examOrders: '',
        radiologyStudies: ''
    } as any);

    // Load existing consult if in edit mode
    useEffect(() => {
        if (isEdit && patientId && consultId) {
            api.getConsultById(patientId, consultId).then(existingConsult => {
                if (existingConsult) {
                    setC(prev => ({
                        ...prev,
                        ...existingConsult,
                        // Ensure optional/legacy fields map correctly if needed
                        consultReason: (existingConsult as any).consultReason || existingConsult.otherMotive || '',
                        labStudies: (existingConsult as any).labStudies || (existingConsult as any).labOfStudies || ''
                    }));
                }
            }).catch(e => {
                console.error("Error loading consult for edit:", e);
                showToast("Error al cargar la consulta", "error");
            });
        }
    }, [isEdit, patientId, consultId]);

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
    const updateField = (key: string, value: any) => {
        setC(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'consultReason') next.otherMotive = value;
            return next;
        });
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

    const handleLabImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => {
                if (f.size > 3 * 1024 * 1024) {
                    showToast(`La imagen ${f.name} excede los 3MB y será omitida.`, 'error');
                    return false;
                }
                return true;
            });
            const urls = validFiles.map(f => URL.createObjectURL(f));
            setC(prev => ({ ...prev, labImages: [...(prev.labImages || []), ...urls] }));
        }
    };

    const handleSave = async () => {
        if (!patient || !patientId) return;
        setSaving(true);
        try {
            if (isEdit && consultId) {
                const updated = await api.updateConsult(patientId, consultId, c as any);
                setConsults(prev => prev.map(item => item.id === consultId ? updated : item));
                showToast("Consulta actualizada exitosamente", 'success');
            } else {
                const savedConsult = await api.createConsult({ ...c, patientId } as any);
                setConsults(prev => [...prev, savedConsult]);
                showToast("Consulta guardada exitosamente", 'success');
            }
            setTimeout(() => navigate(`/app/profile/${patient.id}`), 1500);
        } catch (e) {
            console.error(e);
            showToast(isEdit ? "Error al actualizar consulta" : "Error al guardar consulta", 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Paciente no encontrado.</div>;
    }

    return (
        <div className="min-h-screen w-full bg-[#00a63e]">
            <div className="max-w-5xl mx-auto p-4 pb-32">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Floating Return Button - Top Right */}
                <div className="fixed top-8 right-13 z-[60]">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/20 transition-all flex items-center justify-center transform hover:scale-110 active:scale-90 hover:shadow-black/40"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b border-gray-200 mb-8 shadow-sm relative p-6">
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

                {/* 0. Motivo de la Consulta */}
                <SectionCard title="Motivo de la Consulta">
                    <FloatingLabelInput
                        label="Escriba el motivo de la consulta..."
                        as="textarea"
                        rows={2}
                        value={c.consultReason}
                        onChange={e => updateField('consultReason', e.target.value)}
                        wrapperClassName="bg-white border-2 border-black rounded-xl"
                    />
                </SectionCard>

                {/* 1. Signos Vitales y Antropometría */}
                <SectionCard title="1. Signos Vitales y Antropometría">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'P/A', unit: 'mmHg', key: 'pa', val: c.vitalSigns?.pa },
                                { label: 'FC', unit: 'lpm', key: 'fc', val: c.vitalSigns?.fc },
                                { label: 'FR', unit: 'rpm', key: 'fr', val: c.vitalSigns?.fr },
                                { label: 'Temp', unit: '°C', key: 'temp', val: c.vitalSigns?.temp },
                                { label: 'SpO2', unit: '%', key: 'sat02', val: c.vitalSigns?.sat02 },
                                { label: 'Peso', unit: 'kg', key: 'weight', val: c.anthropometrics?.weight, type: 'anthro' },
                                { label: 'Talla', unit: 'm', key: 'height', val: c.anthropometrics?.height, type: 'anthro' },
                                { label: 'IMC', unit: '', key: 'imc', val: c.anthropometrics?.imc, type: 'anthro' },
                            ].map((s) => (
                                <div key={s.key} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#00a63e]">{s.label} <span className="text-gray-400 font-medium">({s.unit})</span></label>
                                    <input
                                        type="text"
                                        value={s.val || ''}
                                        onChange={e => s.type === 'anthro' ? updateAnthropometric(s.key, e.target.value) : updateVitalSign(s.key, e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#00a63e] focus:ring-4 focus:ring-[#00a63e]/5 transition-all"
                                        placeholder="---"
                                    />
                                </div>
                            ))}
                        </div>
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
                        wrapperClassName="bg-white border-2 border-black rounded-xl"
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
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Abdomen"
                            as="textarea"
                            rows={3}
                            value={c.abdomen}
                            onChange={e => updateField('abdomen', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="TDR (Tórax y Respiratorio)"
                            as="textarea"
                            rows={3}
                            value={c.tdr}
                            onChange={e => updateField('tdr', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Genitales"
                            as="textarea"
                            rows={3}
                            value={c.genitals}
                            onChange={e => updateField('genitals', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Miembros"
                            as="textarea"
                            rows={3}
                            value={c.limbs}
                            onChange={e => updateField('limbs', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Neurológico"
                            as="textarea"
                            rows={3}
                            value={c.neurological}
                            onChange={e => updateField('neurological', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                        <FloatingLabelInput
                            label="Avalúo"
                            as="textarea"
                            rows={3}
                            value={c.assessment}
                            onChange={e => updateField('assessment', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />
                    </div>
                </SectionCard>

                {/* 4. Diagnóstico y Plan */}
                <SectionCard title="4. Diagnóstico y Plan">
                    <div className="space-y-6">
                        <FloatingLabelInput
                            label="Diagnóstico"
                            as="textarea"
                            rows={4}
                            value={c.diagnosis}
                            onChange={e => updateField('diagnosis', e.target.value)}
                            wrapperClassName="bg-white border-2 border-black rounded-xl"
                        />

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-[#00a63e] ml-1">Estudio de Laboratorio</label>
                            <textarea
                                value={c.labStudies}
                                onChange={e => updateField('labStudies', e.target.value)}
                                placeholder="Describa los estudios..."
                                className="w-full p-4 bg-white border-2 border-black rounded-2xl text-sm outline-none focus:border-[#00a63e] transition-all resize-none h-32"
                            />

                            {/* Image Upload Section */}
                            <div className="mt-2 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center gap-4">
                                <span className="text-xs text-gray-500 font-medium">Adjuntar imágenes de laboratorio (Máx 3MB)</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleLabImages}
                                    className="hidden"
                                    id="lab-image-upload-consult"
                                />
                                <label
                                    htmlFor="lab-image-upload-consult"
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 cursor-pointer transition-all shadow-sm"
                                >
                                    Seleccionar Imágenes
                                </label>

                                {c.labImages && c.labImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {c.labImages.map((img, i) => (
                                            <div key={i} className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden relative group">
                                                <img src={img} alt="Lab" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setC(prev => ({ ...prev, labImages: prev.labImages.filter((_, idx) => idx !== i) }))}
                                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="text-[8px] font-black uppercase">Borrar</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <MedicalOrderForm
                            data={c.medicalOrder}
                            onChange={(data: MedicalOrder) => setC(prev => ({ ...prev, medicalOrder: data }))}
                        />
                    </div>
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-50 pointer-events-none">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold border border-white/20 flex items-center gap-2 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
