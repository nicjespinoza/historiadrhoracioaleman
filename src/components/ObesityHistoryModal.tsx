
import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ObesityHistory } from '../types';
import { FloatingLabelInput } from './premium-ui/FloatingLabelInput';
import { YesNo } from './ui/FormComponents';

interface ObesityHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ObesityHistory) => void;
    initialData?: ObesityHistory;
}

const INITIAL_DATA: ObesityHistory = {
    weightGainOnset: {
        childhood: false, youth: false, pregnancy: false, menopause: false, postEvent: false, when: ''
    },
    familyObesity: { yes: false, no: false, who: '' },
    familyPathologies: { yes: false, no: false, who: '' },
    previousTreatments: { yes: false, no: false, which: '' },
    previousMeds: { yes: false, no: false, which: '' },
    maxWeight: '',
    minWeight: '',
    reboundCause: '',
    previousActivity: { yes: false, no: false, which: '' },
    currentActivity: { yes: false, no: false, which: '' },
    qualityOfLifeAlteration: { yes: false, no: false, how: '' },
    metrics: {
        height: '', currentWeight: '', currentImc: '', lostWeight: '',
        lostOverweightPercentage: '', lostImcExcessPercentage: '', desiredWeight: '', desiredImc: ''
    }
};

export const ObesityHistoryModal: React.FC<ObesityHistoryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<ObesityHistory>(INITIAL_DATA);

    useEffect(() => {
        if (isOpen) {
            setData(initialData || INITIAL_DATA);
        }
    }, [isOpen, initialData]);

    const updateData = (key: keyof ObesityHistory, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const toggleYesNo = (key: keyof ObesityHistory, field: string, value: boolean) => {
        setData(prev => {
            const current = prev[key] as any;
            const updated = { ...current, [field]: value };
            if (value) {
                if (field === 'yes') updated.no = false;
                if (field === 'no') updated.yes = false;
            }
            return { ...prev, [key]: updated };
        });
    };

    const handleSave = () => {
        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-bold text-gray-900">Historia de Obesidad</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* 1. Inicio de ganancia de peso */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Inicio de ganancia de peso</h3>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {['Niñez', 'Juventud', 'Embarazo', 'Menopausia', 'Post evento'].map(label => {
                                    const key = label === 'Niñez' ? 'childhood' :
                                        label === 'Juventud' ? 'youth' :
                                            label === 'Embarazo' ? 'pregnancy' :
                                                label === 'Menopausia' ? 'menopause' : 'postEvent';
                                    return (
                                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(data.weightGainOnset as any)[key]}
                                                onChange={e => updateData('weightGainOnset', { ...data.weightGainOnset, [key]: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <FloatingLabelInput
                                label="¿Cuándo?"
                                value={data.weightGainOnset.when}
                                onChange={e => updateData('weightGainOnset', { ...data.weightGainOnset, when: e.target.value })}
                                wrapperClassName="bg-white border-2 border-gray-900 rounded-xl"
                            />
                        </section>

                        <div className="border-t-2 border-gray-900 pt-6 space-y-6">
                            {/* Family Obesity */}
                            <div>
                                <YesNo label="Antecedente de Obesidad en familiares en primer grado" value={data.familyObesity} onChange={(k, v) => toggleYesNo('familyObesity', k as string, v)} />
                                {data.familyObesity.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Quién?" value={data.familyObesity.who} onChange={e => updateData('familyObesity', { ...data.familyObesity, who: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* Family Pathologies */}
                            <div>
                                <YesNo label="Antecedentes patológicos en familiares en primer grado" value={data.familyPathologies} onChange={(k, v) => toggleYesNo('familyPathologies', k as string, v)} />
                                {data.familyPathologies.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Quién?" value={data.familyPathologies.who} onChange={e => updateData('familyPathologies', { ...data.familyPathologies, who: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* Previous Treatments */}
                            <div>
                                <YesNo label="Tratamientos previos para bajar de peso" value={data.previousTreatments} onChange={(k, v) => toggleYesNo('previousTreatments', k as string, v)} />
                                {data.previousTreatments.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Cuál?" value={data.previousTreatments.which} onChange={e => updateData('previousTreatments', { ...data.previousTreatments, which: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* Previous Meds */}
                            <div>
                                <YesNo label="Medicamentos, suplementos nutricionales previos" value={data.previousMeds} onChange={(k, v) => toggleYesNo('previousMeds', k as string, v)} />
                                {data.previousMeds.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Cuáles?" value={data.previousMeds.which} onChange={e => updateData('previousMeds', { ...data.previousMeds, which: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-2 border-gray-900 pt-6">
                            <FloatingLabelInput label="Peso máximo alcanzado (kg)" value={data.maxWeight} onChange={e => updateData('maxWeight', e.target.value)} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="Peso mínimo alcanzado (kg)" value={data.minWeight} onChange={e => updateData('minWeight', e.target.value)} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                        </div>

                        <FloatingLabelInput label="Causa de rebote" value={data.reboundCause} onChange={e => updateData('reboundCause', e.target.value)} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />

                        <div className="border-t-2 border-gray-900 pt-6 space-y-6">
                            {/* Previous Activity */}
                            <div>
                                <YesNo label="Actividad física previa" value={data.previousActivity} onChange={(k, v) => toggleYesNo('previousActivity', k as string, v)} />
                                {data.previousActivity.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Cuál?" value={data.previousActivity.which} onChange={e => updateData('previousActivity', { ...data.previousActivity, which: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* Current Activity */}
                            <div>
                                <YesNo label="Actividad física actual" value={data.currentActivity} onChange={(k, v) => toggleYesNo('currentActivity', k as string, v)} />
                                {data.currentActivity.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Cuál?" value={data.currentActivity.which} onChange={e => updateData('currentActivity', { ...data.currentActivity, which: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* Quality of Life */}
                            <div>
                                <YesNo label="Alteración de calidad de vida y laboral" value={data.qualityOfLifeAlteration} onChange={(k, v) => toggleYesNo('qualityOfLifeAlteration', k as string, v)} />
                                {data.qualityOfLifeAlteration.yes && (
                                    <div className="mt-4">
                                        <FloatingLabelInput label="¿Cómo?" value={data.qualityOfLifeAlteration.how} onChange={e => updateData('qualityOfLifeAlteration', { ...data.qualityOfLifeAlteration, how: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="border-t-2 border-gray-900 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FloatingLabelInput label="Talla (cm)" value={data.metrics.height} onChange={e => updateData('metrics', { ...data.metrics, height: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="Peso actual (kg)" value={data.metrics.currentWeight} onChange={e => updateData('metrics', { ...data.metrics, currentWeight: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="IMC actual" value={data.metrics.currentImc} onChange={e => updateData('metrics', { ...data.metrics, currentImc: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />

                            <FloatingLabelInput label="Peso perdido" value={data.metrics.lostWeight} onChange={e => updateData('metrics', { ...data.metrics, lostWeight: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="% sobrepeso perdido" value={data.metrics.lostOverweightPercentage} onChange={e => updateData('metrics', { ...data.metrics, lostOverweightPercentage: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="% perdido exceso IMC" value={data.metrics.lostImcExcessPercentage} onChange={e => updateData('metrics', { ...data.metrics, lostImcExcessPercentage: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />

                            <FloatingLabelInput label="Peso deseado (Kg)" value={data.metrics.desiredWeight} onChange={e => updateData('metrics', { ...data.metrics, desiredWeight: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                            <FloatingLabelInput label="IMC deseado" value={data.metrics.desiredImc} onChange={e => updateData('metrics', { ...data.metrics, desiredImc: e.target.value })} wrapperClassName="bg-white border-2 border-gray-900 rounded-xl" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus size={20} /> Agregar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
