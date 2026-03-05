import React, { useState, useCallback, memo } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Patient, InitialHistory } from '../types';
import * as C from '../constants';
import { api } from '../../api';
import { InputGroup } from '../components/ui/InputGroup';
import { CheckboxList, YesNo, PhysicalExamSection } from '../components/ui/FormComponents';
import { useParams, useNavigate } from 'react-router-dom';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { GlassCard } from '../components/premium-ui/GlassCard';

const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

// Memoized Section Component to prevent re-renders
const MemoizedSection = memo(({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
    <GlassCard className={`p-6 mb-8 ${className}`}>
        <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
        {children}
    </GlassCard>
));

// Memoized Group Section
const MemoizedGroupSection = memo(({
    title, list, groupKey, data, onChange
}: {
    title: string, list: string[], groupKey: keyof InitialHistory, data: any, onChange: (key: keyof InitialHistory, value: any) => void
}) => {
    const handleYesNoChange = useCallback((k: string, v: boolean) => {
        onChange(groupKey, { ...data, [k]: v });
    }, [groupKey, data, onChange]);

    const handleListChange = useCallback((k: string, v: boolean) => {
        const listKey = data.conditions ? 'conditions' : 'list';
        onChange(groupKey, { ...data, [listKey]: { ...(data[listKey] || {}), [k]: v } });
    }, [groupKey, data, onChange]);

    const handleOtherChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(groupKey, { ...data, other: e.target.value });
    }, [groupKey, data, onChange]);

    return (
        <div className="mb-6 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
            <YesNo label={title} value={data} onChange={handleYesNoChange} />
            {data.yes && (
                <div className="pl-0 mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200/50 animate-in fade-in slide-in-from-top-2">
                    <CheckboxList items={list} data={data.conditions || data.list} onChange={handleListChange} />
                    <div className="mt-4">
                        <FloatingLabelInput
                            label="Otra / Cual?"
                            value={data.other || ''}
                            onChange={handleOtherChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

interface SpecialtyHistoryScreenProps {
    patients: Patient[];
    setHistories: React.Dispatch<React.SetStateAction<InitialHistory[]>>;
}

export const SpecialtyHistoryScreen = ({ patients, setHistories }: SpecialtyHistoryScreenProps) => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const [localPatient, setLocalPatient] = useState<Patient | null>(null);

    React.useEffect(() => {
        if (patientId && !patients.find(p => p.id === patientId)) {
            api.getPatientById(patientId).then(p => { if (p) setLocalPatient(p); }).catch(console.error);
        }
    }, [patientId, patients]);

    const patient = patients.find(p => p.id === patientId) || localPatient;

    const [h, setH] = useState<InitialHistory>({
        id: Math.random().toString(36),
        patientId: patient?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        motives: {}, otherMotive: '',
        evolutionTime: '', historyOfPresentIllness: '',
        preExistingDiseases: { yes: false, no: false },
        neurological: { yes: false, no: false, conditions: {}, other: '' },
        metabolic: { yes: false, no: false, conditions: {}, other: '' },
        respiratory: { yes: false, no: false, conditions: {}, other: '' },
        cardiac: { yes: false, no: false, conditions: {}, other: '' },
        gastro: { yes: false, no: false, conditions: {}, other: '' },
        hepato: { yes: false, no: false, conditions: {}, other: '' },
        peripheral: { yes: false, no: false, conditions: {}, other: '' },
        hematological: { yes: false, no: false, conditions: {}, other: '' },
        renal: { yes: false, no: false, conditions: {}, other: '' },
        rheumatological: { yes: false, no: false, conditions: {}, other: '' },
        infectious: { yes: false, no: false, conditions: {}, other: '' },
        psychiatric: { yes: false, no: false, conditions: {}, other: '' },
        gyneco: {
            yes: false, no: false, na: false, conditions: {}, other: '',
            g: '', p: '', a: '', c: '', surgeries: '',
            gestationalDiabetes: { yes: false, no: false }, preeclampsia: { yes: false, no: false }, eclampsia: { yes: false, no: false },
            pregnancySuspicion: { yes: false, no: false, na: false }, breastfeeding: { yes: false, no: false, na: false }
        },
        regularMeds: { yes: false, no: false, list: {}, other: '', specific: '' },
        naturalMeds: { yes: false, no: false, description: '' },
        hospitalizations: { yes: false, no: false, reason: '' },
        surgeries: { yes: false, no: false, list: '' },
        endoscopy: { yes: false, no: false, list: '', results: '' },
        complications: { yes: false, no: false, list: '' },
        allergies: { yes: false, no: false, list: {}, other: '' },
        foodAllergies: { yes: false, no: false, list: {}, other: '' },
        foodIntolerances: { yes: false, no: false, list: {} },
        implants: { yes: false, no: false, which: '' },
        devices: { yes: false, no: false, which: '' },
        habits: { yes: false, no: false, list: {}, other: '' },
        transfusions: { yes: false, no: false, reactions: false, which: '' },
        exposures: { yes: false, no: false, list: {}, other: '' },
        familyHistory: { yes: false, no: false, list: {}, other: '' },
        familyGastro: { yes: false, no: false, list: {}, other: '' },
        physicalExam: {
            fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '', weight: '', height: '', imc: '',
            systems: {}
        },
        diagnosis: ''
    });

    // Optimized update handler
    const updateH = useCallback((key: keyof InitialHistory, value: any) => {
        setH(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = async () => {
        if (!patient) return;
        try {
            await api.createHistory(h);
            setHistories(prev => [...prev, h]);
            navigate(`/app/profile/${patient.id}`);
        } catch (e) {
            console.error(e);
            alert("Error al guardar historia");
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Paciente no encontrado.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 pb-32">
            <GlassCard className="p-6 rounded-t-2xl border-b border-gray-200 mb-8 shadow-sm relative">
                <button onClick={() => navigate(-1)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Historia Clínica (Gastroenterología)</h2>
                <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-gray-400">Fecha</span>
                        <input type="date" value={h.date} onChange={e => updateH('date', e.target.value)} className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-gray-400">Hora</span>
                        <input type="time" value={h.time} onChange={e => updateH('time', e.target.value)} className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-gray-400">Paciente</span>
                        <span className="font-medium text-gray-800">{patient.firstName} {patient.lastName} ({patient.ageDetails})</span>
                    </div>
                </div>
            </GlassCard>

            <MemoizedSection title="Motivo de Consulta">
                <CheckboxList items={C.MOTIVES_LIST} data={h.motives} onChange={(k, v) => updateH('motives', { ...h.motives, [k]: v })} />
                <div className="mt-6">
                    <FloatingLabelInput label="Otros Motivos" value={h.otherMotive} onChange={e => updateH('otherMotive', e.target.value)} />
                </div>
            </MemoizedSection>

            <MemoizedSection title="Historia de la Enfermedad">
                <div className="space-y-6">
                    <FloatingLabelInput label="Tiempo de evolución" value={h.evolutionTime} onChange={e => updateH('evolutionTime', e.target.value)} />
                    <div className="relative">
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            rows={5}
                            value={h.historyOfPresentIllness}
                            onChange={e => updateH('historyOfPresentIllness', e.target.value)}
                            placeholder="Narrativa detallada..."
                        />
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-blue-600">Historia actual de la enfermedad</label>
                    </div>
                </div>
            </MemoizedSection>

            <MemoizedSection title="I. Antecedentes Médicos Personales">
                <YesNo label="Enfermedades pre existentes" value={h.preExistingDiseases} onChange={(k, v) => updateH('preExistingDiseases', { ...h.preExistingDiseases, [k]: v })} />
                <div className="mt-6 space-y-2">
                    {/* Simplified for Gastro */}
                    <MemoizedGroupSection title="Metabólicas" list={C.METABOLIC_LIST} groupKey="metabolic" data={h.metabolic} onChange={updateH} />
                    <MemoizedGroupSection title="Gastrointestinales" list={C.GASTRO_LIST} groupKey="gastro" data={h.gastro} onChange={updateH} />
                    <MemoizedGroupSection title="Hepatobiliopancreática" list={C.HEPATO_LIST} groupKey="hepato" data={h.hepato} onChange={updateH} />
                    <MemoizedGroupSection title="Arterial o venosa periféricas" list={C.PERIPHERAL_LIST} groupKey="peripheral" data={h.peripheral} onChange={updateH} />
                </div>
            </MemoizedSection>

            {/* Gyneco Section Removed */}

            <MemoizedSection title="Otros Antecedentes">
                <MemoizedGroupSection title="Medicamentos uso regular" list={C.MEDS_LIST} groupKey="regularMeds" data={h.regularMeds} onChange={updateH} />
                <div className="mt-4">
                    <FloatingLabelInput label="Cual? (Medicamentos Especificos)" value={h.regularMeds.specific} onChange={e => updateH('regularMeds', { ...h.regularMeds, specific: e.target.value })} />
                </div>

                <div className="space-y-6 pt-6">
                    <div className="border-t pt-6">
                        <YesNo label="Medicina Natural" value={h.naturalMeds} onChange={(k, v) => updateH('naturalMeds', { ...h.naturalMeds, [k]: v })} />
                        {h.naturalMeds.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Describa cual..." value={h.naturalMeds.description} onChange={e => updateH('naturalMeds', { ...h.naturalMeds, description: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Hospitalizaciones previas" value={h.hospitalizations} onChange={(k, v) => updateH('hospitalizations', { ...h.hospitalizations, [k]: v })} />
                        {h.hospitalizations.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Motivo..." value={h.hospitalizations.reason} onChange={e => updateH('hospitalizations', { ...h.hospitalizations, reason: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Cirugías previas" value={h.surgeries} onChange={(k, v) => updateH('surgeries', { ...h.surgeries, [k]: v })} />
                        {h.surgeries.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Cuales..." value={h.surgeries.list} onChange={e => updateH('surgeries', { ...h.surgeries, list: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Procedimientos endoscopicos" value={h.endoscopy} onChange={(k, v) => updateH('endoscopy', { ...h.endoscopy, [k]: v })} />
                        {h.endoscopy.yes && (
                            <div className="mt-4 space-y-4">
                                <FloatingLabelInput label="Cuales..." value={h.endoscopy.list} onChange={e => updateH('endoscopy', { ...h.endoscopy, list: e.target.value })} />
                                <FloatingLabelInput label="Resultados..." value={h.endoscopy.results} onChange={e => updateH('endoscopy', { ...h.endoscopy, results: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Complicaciones relacionadas" value={h.complications} onChange={(k, v) => updateH('complications', { ...h.complications, [k]: v })} />
                        {h.complications.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Describa complicaciones..." value={h.complications.list} onChange={e => updateH('complications', { ...h.complications, list: e.target.value })} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <MemoizedGroupSection title="Alergias" list={C.ALLERGIES_LIST} groupKey="allergies" data={h.allergies} onChange={updateH} />
                    <MemoizedGroupSection title="Alergias Alimenticias" list={C.FOOD_ALLERGIES_LIST} groupKey="foodAllergies" data={h.foodAllergies} onChange={updateH} />

                    <div className="py-6 border-b border-gray-100">
                        <YesNo label="Intolerancias alimenticias" value={h.foodIntolerances} onChange={(k, v) => updateH('foodIntolerances', { ...h.foodIntolerances, [k]: v })} />
                        {h.foodIntolerances.yes && (
                            <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                <CheckboxList items={C.FOOD_INTOLERANCES_LIST} data={h.foodIntolerances.list} onChange={(k, v) => updateH('foodIntolerances', { ...h.foodIntolerances, list: { ...h.foodIntolerances.list, [k]: v } })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Implantes o prótesis" value={h.implants} onChange={(k, v) => updateH('implants', { ...h.implants, [k]: v })} />
                        {h.implants.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Especifique..." value={h.implants.which} onChange={e => updateH('implants', { ...h.implants, which: e.target.value })} />
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <YesNo label="Marcapasos/Dispositivos" value={h.devices} onChange={(k, v) => updateH('devices', { ...h.devices, [k]: v })} />
                        {h.devices.yes && (
                            <div className="mt-4">
                                <FloatingLabelInput label="Especifique..." value={h.devices.which} onChange={e => updateH('devices', { ...h.devices, which: e.target.value })} />
                            </div>
                        )}
                    </div>
                </div>
            </MemoizedSection>

            <MemoizedSection title="II. Antecedentes No Patológicos">
                <MemoizedGroupSection title="Hábitos, adicciones" list={C.HABITS_LIST} groupKey="habits" data={h.habits} onChange={updateH} />
                <div className="border-t pt-6">
                    <YesNo label="Transfusiones Sanguineas" value={h.transfusions} onChange={(k, v) => updateH('transfusions', { ...h.transfusions, [k]: v })} />
                    {h.transfusions.yes && (
                        <div className="pl-0 mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-transparent hover:bg-gray-50 hover:border-gray-100 transition-all cursor-pointer mb-3">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={h.transfusions.reactions} onChange={e => updateH('transfusions', { ...h.transfusions, reactions: e.target.checked })} />
                                <span className="text-gray-700 font-medium">Reacciones post transfusionales</span>
                            </label>
                            <FloatingLabelInput label="Cuales?" value={h.transfusions.which} onChange={e => updateH('transfusions', { ...h.transfusions, which: e.target.value })} />
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <MemoizedGroupSection title="Exposiciones" list={C.EXPOSURES_LIST} groupKey="exposures" data={h.exposures} onChange={updateH} />
                </div>
            </MemoizedSection>

            <MemoizedSection title="III. Antecedentes Médicos Familiares">
                <MemoizedGroupSection title="Generales" list={C.FAMILY_LIST} groupKey="familyHistory" data={h.familyHistory} onChange={updateH} />
            </MemoizedSection>

            <MemoizedSection title="IV. Familiares 1er Grado (Gastrointestinal)">
                <MemoizedGroupSection title="Gastrointestinales Relevantes" list={C.FAMILY_GASTRO_LIST} groupKey="familyGastro" data={h.familyGastro} onChange={updateH} />
            </MemoizedSection>

            <PhysicalExamSection data={h.physicalExam} onChange={(d) => updateH('physicalExam', d)} />

            <GlassCard className="p-6 rounded-xl shadow-sm border border-gray-200 mt-8 mb-24">
                <h3 className={SECTION_TITLE_CLASS}>VI. Diagnóstico</h3>
                <div className="relative mt-4">
                    <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        rows={6}
                        value={h.diagnosis}
                        onChange={e => updateH('diagnosis', e.target.value)}
                        placeholder="Escriba el diagnóstico final..."
                    />
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-blue-600">Detalle del Diagnóstico</label>
                </div>
            </GlassCard>

            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 flex justify-center md:justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    <Save size={20} /> Guardar Historia Clínica
                </button>
            </div>
        </div>
    );
};
