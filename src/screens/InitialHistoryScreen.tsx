import React, { useState, useCallback, memo, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Patient, InitialHistory } from '../types';
import * as C from '../constants';
import { api } from '../../api';
import { CheckboxList } from '../components/ui/FormComponents';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { Toast, ToastType } from '../components/ui/Toast';
import { MedicalOrderForm } from '../components/MedicalOrderForm';
import { MedicalOrder } from '../types';
import { getDefaultInitialHistoryValues } from '../schemas/patientSchemas';

const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

// Toggle Switch Component
const ToggleWithDetails = memo(({ label, checked, value, onChange, onTextChange, placeholder = "Detalles..." }: { label: string; checked: boolean; value: string; onChange: (v: boolean) => void; onTextChange: (v: string) => void; placeholder?: string }) => (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#00a63e]' : 'bg-gray-200'}`}
            >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
        {checked && (
            <textarea
                value={value}
                onChange={e => onTextChange(e.target.value)}
                placeholder={placeholder}
                className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-[#00a63e]/30 transition-all resize-none h-20"
            />
        )}
    </div>
));

ToggleWithDetails.displayName = 'ToggleWithDetails';

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
    const { patientId, historyId } = useParams<{ patientId: string; historyId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [localPatient, setLocalPatient] = useState<Patient | null>(null);

    React.useEffect(() => {
        if (patientId && !patients.find(p => p.id === patientId)) {
            api.getPatientById(patientId).then(p => { if (p) setLocalPatient(p); }).catch(console.error);
        }
    }, [patientId, patients]);

    const patient = patients.find(p => p.id === patientId) || localPatient;

    // Helper to map Wix/Legacy data to our structured InitialHistory
    const mapHistoryData = useCallback((hx: any, defaults: InitialHistory): InitialHistory => {
        // Log to console if possible, but since we can't, we'll be extremely defensive
        const getVal = (keys: string[]) => {
            for (const k of keys) {
                if (hx[k] !== undefined && hx[k] !== null && hx[k] !== '') return hx[k];
            }
            return '';
        };

        const getBool = (keys: string[]) => {
            for (const k of keys) {
                if (hx[k] === 'Si' || hx[k] === 'si' || hx[k] === true) return true;
            }
            return false;
        };

        // 1. Pathological booleans
        const diabetes = getBool(['diabetes', 'Diabetes Mellitus', 'diabetesMellitus']);
        const hypertension = getBool(['hypertension', 'Hipertension arterial', 'hipertensionArterial']);
        const cardiopathy = getBool(['cardiopathy', 'Cardiopatias', 'cardiopatia']);
        const allergies = getBool(['allergies', 'Alergias', 'alergias']);
        const surgeries = getBool(['surgeries', 'cirugiasAnteriores1', 'cirugiasAnteriores_flag']) || (hx.cirugiasAnteriores && hx.cirugiasAnteriores !== 'No' && hx.cirugiasAnteriores !== 'Si' && hx.cirugiasAnteriores !== 'no');

        // 2. Pathological details - check both normalized (migrated) and legacy (Wix) field names
        const pathologicalDetails = {
            diabetes: hx.pathologicalDetails?.diabetes || getVal(['diabetesText', 'diabetesMellitus1', 'diabetes1']),
            hypertension: hx.pathologicalDetails?.hypertension || getVal(['hypertensionText', 'hipertensionArterial1', 'hipertension1']),
            cardiopathy: hx.pathologicalDetails?.cardiopathy || getVal(['cardiopathyText', 'cardiopatia1']),
            allergies: hx.pathologicalDetails?.allergies || getVal(['allergiesText', 'alergias1']),
            surgeries: hx.pathologicalDetails?.surgeries || getVal(['surgeriesText']) || (hx.cirugiasAnteriores !== 'No' && hx.cirugiasAnteriores !== 'no' && hx.cirugiasAnteriores !== 'Si' && hx.cirugiasAnteriores !== 'si' ? hx.cirugiasAnteriores : '') || (getBool(['cirugiasAnteriores1']) ? hx.cirugiasAnteriores : '') || ''
        };

        // 3. Other Pathological
        const otherPathological = hx.otherPathological || getVal(['Otros1', 'otros1']) || (hx.Otros !== 'No' && hx.Otros !== 'Si' ? hx.Otros : '') || '';

        // 4. Non-Pathological booleans
        const smoking = getBool(['smoking', 'Tabaco', 'tabaco']);
        const alcohol = getBool(['alcohol', 'Alcohol']);
        const drugs = getBool(['drugs', 'Drogas', 'drogas']) || (getBool(['Tabaco']) && hx.drugs === undefined);
        const medications = getBool(['medications', 'Medicamentos', 'medicamentos']);

        // 5. Non-Pathological details - check both normalized (migrated) and legacy (Wix) field names
        const nonPathologicalDetails = {
            smoking: hx.nonPathologicalDetails?.smoking || getVal(['smokingText', 'tabaco1']),
            alcohol: hx.nonPathologicalDetails?.alcohol || getVal(['alcoholText', 'alcohol1']),
            drugs: hx.nonPathologicalDetails?.drugs || getVal(['drugsText', 'drogas1']),
            medications: hx.nonPathologicalDetails?.medications || getVal(['medicationsText', 'Medicamentos1', 'medicamentos1'])
        };

        // 6. Medical Order
        const medicalOrder: MedicalOrder = {
            selectedTypes: hx.medicalOrder?.selectedTypes || [],
            recetarioMedico: hx.medicalOrder?.recetarioMedico || getVal(['recetas', 'Recetas']),
            estudiosRadiologicos: hx.medicalOrder?.estudiosRadiologicos || getVal(['Radio', 'radio']),
            examenLaboratorio: hx.medicalOrder?.examenLaboratorio || getVal(['Examen', 'examen']),
            constanciaMedica: hx.medicalOrder?.constanciaMedica || getVal(['constancia', 'Constancia']),
            ordenIngreso: {
                diagnostico: hx.medicalOrder?.ordenIngreso?.diagnostico || getVal(['diagnostico', 'Diagnostico']),
                procedimiento: hx.medicalOrder?.ordenIngreso?.procedimiento || getVal(['procedimiento', 'Procedimiento']),
                indicacionesPreQuirurgicas: hx.medicalOrder?.ordenIngreso?.indicacionesPreQuirurgicas || getVal(['indicaciones', 'Indicaciones'])
            }
        };

        // Auto-calculate selectedTypes
        if (!medicalOrder.selectedTypes || medicalOrder.selectedTypes.length === 0) {
            const types = [];
            if (medicalOrder.recetarioMedico) types.push('Recetario Medico');
            if (medicalOrder.estudiosRadiologicos) types.push('Estudios Radiologicos');
            if (medicalOrder.examenLaboratorio) types.push('Examen de Laboratorio');
            if (medicalOrder.constanciaMedica) types.push('Constancia Medica');
            if (medicalOrder.ordenIngreso.diagnostico || medicalOrder.ordenIngreso.procedimiento || medicalOrder.ordenIngreso.indicacionesPreQuirurgicas) {
                types.push('Orden de Ingreso');
            }
            medicalOrder.selectedTypes = types;
        }

        return {
            ...defaults,
            ...hx,
            diabetes,
            hypertension,
            cardiopathy,
            allergies,
            surgeries,
            pathologicalDetails,
            otherPathological,
            smoking,
            alcohol,
            drugs,
            medications,
            nonPathologicalDetails,
            medicalOrder,
            id: hx.id || hx.ID || hx.idrandom || defaults.id,
            diagnosis: hx.diagnosis || getVal(['Diagnostico', 'diagnostico']),
            currentIllnessHistory: hx.currentIllnessHistory || getVal(['Historia de la Enfermedad Actual', 'Historia de la enfermedad actual', 'historiaEnfermedad', 'Historia', 'historia']),
            labStudies: hx.labStudies || getVal(['estudiolaboratorio', 'Estudio de laboratorio', 'laboratorio']),
            physicalExamGeneral: hx.physicalExamGeneral || getVal(['Examen Fisico', 'Examen físico', 'examenFisico']) || (hx.idpaciente || hx.idunico ? '' : defaults.physicalExamGeneral),
            neurological: hx.neurological || getVal(['Neurologico', 'Neurológico', 'neurologico']) || (hx.idpaciente || hx.idunico ? '' : defaults.neurological),
            limbs: hx.limbs || getVal(['Miembro', 'Miembros', 'miembros']) || (hx.idpaciente || hx.idunico ? '' : defaults.limbs),
            abdomen: hx.abdomen || getVal(['Abdomen', 'abdomen']),
            genitals: hx.genitals || getVal(['Genitales', 'Genitales1']),
            assessment: hx.assessment || getVal(['Avaluo', 'Aváluo', 'avaluo']),
            labImages: hx.labImages || []
        };
    }, []);

    // Initialize state
    const [h, setH] = useState<InitialHistory>(() => {
        const defaults = getDefaultInitialHistoryValues(patient?.id || '');
        if (location.state?.history) {
            return mapHistoryData(location.state.history, defaults);
        }

        // Return empty defaults initially
        return {
            ...defaults,
            id: historyId || Math.random().toString(36),
            patientId: patient?.id || '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            physicalExamGeneral: "Consciente, mutado, hidratado, afebril, patrón respiratorio, regulaGer, no uso de músculo accesorio, corazón rítmico, buen tono, no soplo",
            neurological: "Conservado",
            limbs: "No edema movilizando por su medio",
        } as InitialHistory;
    });

    // EFFECT: Load from DB only for Edit mode (if state is empty) OR specifically handle Create mode
    useEffect(() => {
        // If we have an explicit historyId in URL, but no data in state, FETCH IT
        if (historyId && !location.state?.history && patientId) {
            const loadSpecific = async () => {
                try {
                    const histories = await api.getHistories(patientId);
                    const specific = histories.find(hist => hist.id === historyId);
                    if (specific) {
                        const defaults = getDefaultInitialHistoryValues(patientId);
                        setH(mapHistoryData(specific, defaults));
                    }
                } catch (e) {
                    console.error("Error loading specific history:", e);
                }
            };
            loadSpecific();
        }

        // Remove the "auto-load latest" on blank mode to prevent duplication confusion
    }, [patientId, historyId, location.state?.history, mapHistoryData]);

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

    // Handle Anthropometrics update
    const updateAnthropometric = useCallback((key: string, value: string) => {
        setH(prev => ({
            ...prev,
            anthropometrics: { ...prev.anthropometrics, [key]: value }
        }));
    }, []);

    const updatePathologicalDetail = useCallback((key: string, value: string) => {
        setH(prev => ({
            ...prev,
            pathologicalDetails: { ...prev.pathologicalDetails || {}, [key]: value }
        }));
    }, []);

    const updateNonPathologicalDetail = useCallback((key: string, value: string) => {
        setH(prev => ({
            ...prev,
            nonPathologicalDetails: { ...prev.nonPathologicalDetails || {}, [key]: value }
        }));
    }, []);

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
            setH(prev => ({ ...prev, labImages: [...(prev.labImages || []), ...urls] }));
        }
    };

    // Save handler
    const handleSave = async () => {
        if (!patient) return;
        try {
            const historyData = { ...h, isValidated: true } as InitialHistory;
            const historyRelId = h.id || (h as any).idrandom || (h as any).ID || (h as any).legacyHistoryId;

            // 1. Save/Update History
            if (historyId) {
                await api.updateHistory(historyId, historyData);
                setHistories(prev => prev.map(hist => hist.id === historyId ? historyData : hist));
            } else {
                await api.createHistory(historyData);
                setHistories(prev => [...prev, historyData]);
            }

            // 2. Handle Prescription Sync
            const hasPrescriptionData =
                h.medicalOrder?.recetarioMedico ||
                h.medicalOrder?.estudiosRadiologicos ||
                h.medicalOrder?.examenLaboratorio ||
                h.medicalOrder?.constanciaMedica ||
                h.medicalOrder?.ordenIngreso?.diagnostico;

            if (hasPrescriptionData) {
                const prescData = {
                    patientId: patient.id,
                    patientName: `${patient.firstName} ${patient.lastName}`,
                    date: h.date,
                    prescriptionText: h.medicalOrder.recetarioMedico || '',
                    radio: h.medicalOrder.estudiosRadiologicos || '',
                    examen: h.medicalOrder.examenLaboratorio || '',
                    constancia: h.medicalOrder.constanciaMedica || '',
                    diagnostico: h.medicalOrder.ordenIngreso?.diagnostico || '',
                    procedimiento: h.medicalOrder.ordenIngreso?.procedimiento || '',
                    indicaciones: h.medicalOrder.ordenIngreso?.indicacionesPreQuirurgicas || '',
                    Generatedid: historyRelId, // Link both docs
                    historyId: h.id,
                    type: 'Historia Clinica'
                };

                // Check if prescription already exists for this history
                const existingPrescs = await api.getPrescriptions(patient.id);
                const existing = existingPrescs.find(p =>
                    p.Generatedid === historyRelId ||
                    p.historyId === h.id ||
                    (p as any).generatedid === historyRelId
                );

                if (existing) {
                    await api.updatePrescription(patient.id, existing.id, prescData);
                } else {
                    await api.createPrescription(patient.id, prescData);
                }
            }

            showToast("Historia clínica y documentación guardadas", 'success');
            setTimeout(() => navigate(`/app/profile/${patient.id}`), 1500);
        } catch (e) {
            console.error(e);
            showToast("Error al guardar los datos", 'error');
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Paciente no encontrado.</div>;
    }

    return (
        <div className="min-h-screen w-full bg-[#00a63e]">
            {/* Floating Back Button */}
            <div className="fixed top-10 right-45 z-[60] pointer-events-none">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-black text-white p-3 rounded-xl shadow-lg shadow-black/20 hover:bg-gray-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="max-w-5xl mx-auto p-4 pb-32">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Header */}
                <div className="bg-white rounded-t-2xl border-b border-gray-200 mb-8 shadow-sm relative p-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToggleWithDetails label="Diabetes" checked={h.diabetes} value={h.pathologicalDetails?.diabetes || ''} onChange={v => updateField('diabetes', v)} onTextChange={v => updatePathologicalDetail('diabetes', v)} />
                        <ToggleWithDetails label="Hipertensión" checked={h.hypertension} value={h.pathologicalDetails?.hypertension || ''} onChange={v => updateField('hypertension', v)} onTextChange={v => updatePathologicalDetail('hypertension', v)} />
                        <ToggleWithDetails label="Cardiopatía" checked={h.cardiopathy} value={h.pathologicalDetails?.cardiopathy || ''} onChange={v => updateField('cardiopathy', v)} onTextChange={v => updatePathologicalDetail('cardiopathy', v)} />
                        <ToggleWithDetails label="Alergias" checked={h.allergies} value={h.pathologicalDetails?.allergies || ''} onChange={v => updateField('allergies', v)} onTextChange={v => updatePathologicalDetail('allergies', v)} />
                        <ToggleWithDetails label="Cirugías" checked={h.surgeries} value={h.pathologicalDetails?.surgeries || ''} onChange={v => updateField('surgeries', v)} onTextChange={v => updatePathologicalDetail('surgeries', v)} />

                        <div className="md:col-span-2">
                            <FloatingLabelInput
                                label="Otros antecedentes patológicos"
                                as="textarea"
                                rows={2}
                                value={h.otherPathological}
                                onChange={e => updateField('otherPathological', e.target.value)}
                                wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* 3. Antecedentes No Patológicos */}
                <SectionCard title="3. Antecedentes No Patológicos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToggleWithDetails label="Fumado" checked={h.smoking} value={h.nonPathologicalDetails?.smoking || ''} onChange={v => updateField('smoking', v)} onTextChange={v => updateNonPathologicalDetail('smoking', v)} />
                        <ToggleWithDetails label="Alcohol" checked={h.alcohol} value={h.nonPathologicalDetails?.alcohol || ''} onChange={v => updateField('alcohol', v)} onTextChange={v => updateNonPathologicalDetail('alcohol', v)} />
                        <ToggleWithDetails label="Drogas" checked={h.drugs} value={h.nonPathologicalDetails?.drugs || ''} onChange={v => updateField('drugs', v)} onTextChange={v => updateNonPathologicalDetail('drugs', v)} />
                        <ToggleWithDetails label="Medicamentos" checked={h.medications} value={h.nonPathologicalDetails?.medications || ''} onChange={v => updateField('medications', v)} onTextChange={v => updateNonPathologicalDetail('medications', v)} />
                    </div>
                </SectionCard>

                {/* 4. Signos Vitales y Antropometría */}
                <SectionCard title="4. Signos Vitales y Antropometría">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'P/A', unit: 'mmHg', key: 'pa', val: h.vitalSigns?.pa },
                                { label: 'FC', unit: 'lpm', key: 'fc', val: h.vitalSigns?.fc },
                                { label: 'FR', unit: 'rpm', key: 'fr', val: h.vitalSigns?.fr },
                                { label: 'Temp', unit: '°C', key: 'temp', val: h.vitalSigns?.temp },
                                { label: 'SpO2', unit: '%', key: 'sat02', val: h.vitalSigns?.sat02 },
                                { label: 'Peso', unit: 'kg', key: 'weight', val: h.anthropometrics?.weight, type: 'anthro' },
                                { label: 'Talla', unit: 'm', key: 'height', val: h.anthropometrics?.height, type: 'anthro' },
                                { label: 'IMC', unit: '', key: 'imc', val: h.anthropometrics?.imc, type: 'anthro' },
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
                    <div className="space-y-6">
                        <FloatingLabelInput
                            label="Diagnóstico"
                            as="textarea"
                            rows={4}
                            value={h.diagnosis}
                            onChange={e => updateField('diagnosis', e.target.value)}
                            wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                        />

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-[#00a63e] ml-1">Estudio de Laboratorio</label>
                            <textarea
                                value={h.labStudies}
                                onChange={e => updateField('labStudies', e.target.value)}
                                placeholder="Describa los estudios..."
                                className="w-full p-4 bg-white border-2 border-gray-900 rounded-2xl text-sm outline-none focus:border-[#00a63e] transition-all resize-none h-32"
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
                                    id="lab-image-upload"
                                />
                                <label
                                    htmlFor="lab-image-upload"
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 cursor-pointer transition-all shadow-sm"
                                >
                                    Seleccionar Imágenes
                                </label>

                                {h.labImages && h.labImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {h.labImages.map((img, i) => (
                                            <div key={i} className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden relative group">
                                                <img src={img} alt="Lab" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setH(prev => ({ ...prev, labImages: prev.labImages.filter((_, idx) => idx !== i) }))}
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
                            data={h.medicalOrder}
                            onChange={(data: MedicalOrder) => setH(prev => ({ ...prev, medicalOrder: data }))}
                        />
                    </div>
                </SectionCard>

                {/* Fixed Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-50 pointer-events-none">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 flex items-center gap-2 shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                    >
                        <Save size={20} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
