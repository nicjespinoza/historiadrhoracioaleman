import React from 'react';
import { Pill, FileImage, TestTube, FileText, Bed, CheckCircle2, Circle } from 'lucide-react';
import { MedicalOrder } from '../types';

interface MedicalOrderFormProps {
    data: MedicalOrder;
    onChange: (data: MedicalOrder) => void;
}

export const MedicalOrderForm: React.FC<MedicalOrderFormProps> = ({ data, onChange }) => {
    // Safety check for migrated data where medicalOrder might be missing
    const safeData = data || {
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
    };

    const options = [
        { id: 'Recetario Medico', label: 'Recetario Médico', icon: <Pill size={18} />, field: 'recetarioMedico' },
        { id: 'Estudios Radiologicos', label: 'Estudios Radiológicos', icon: <FileImage size={18} />, field: 'estudiosRadiologicos' },
        { id: 'Examen de Laboratorio', label: 'Examen de Laboratorio', icon: <TestTube size={18} />, field: 'examenLaboratorio' },
        { id: 'Constancia Medica', label: 'Constancia Médica', icon: <FileText size={18} />, field: 'constanciaMedica' },
        { id: 'Orden de Ingreso', label: 'Orden de Ingreso', icon: <Bed size={18} />, field: 'ordenIngreso' },
    ];

    const toggleType = (type: string) => {
        const selectedTypes = safeData.selectedTypes || [];
        const newSelected = selectedTypes.includes(type)
            ? selectedTypes.filter((t: string) => t !== type)
            : [...selectedTypes, type];
        onChange({ ...safeData, selectedTypes: newSelected });
    };

    const updateSubField = (field: string, value: string) => {
        onChange({ ...safeData, [field]: value });
    };

    const updateOrdenIngreso = (subField: string, value: string) => {
        onChange({
            ...safeData,
            ordenIngreso: { ...(safeData.ordenIngreso || {}), [subField]: value }
        });
    };

    return (
        <div className="space-y-4 mt-6">
            <label className="text-xs font-black uppercase tracking-widest text-[#00a63e] ml-1">Orden Médica</label>

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt) => {
                    const isSelected = safeData.selectedTypes?.includes(opt.id);
                    return (
                        <div key={opt.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleType(opt.id)}
                                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isSelected ? 'bg-green-50/50' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`${isSelected ? 'text-[#00a63e]' : 'text-gray-300'}`}>
                                    {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                </div>
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#00a63e] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {opt.icon}
                                </div>
                                <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {opt.label}
                                </span>
                            </button>

                            {isSelected && (
                                <div className="p-4 border-t border-gray-100 bg-white space-y-4">
                                    {opt.id !== 'Orden de Ingreso' ? (
                                        <textarea
                                            value={(safeData as any)[opt.field as any]}
                                            onChange={(e) => updateSubField(opt.field, e.target.value)}
                                            placeholder={`Detalles de ${opt.label}...`}
                                            className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a63e] transition-all resize-none"
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Diagnóstico</label>
                                                <textarea
                                                    value={safeData.ordenIngreso?.diagnostico || ''}
                                                    onChange={(e) => updateOrdenIngreso('diagnostico', e.target.value)}
                                                    className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a63e] transition-all resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Procedimiento</label>
                                                <textarea
                                                    value={safeData.ordenIngreso?.procedimiento || ''}
                                                    onChange={(e) => updateOrdenIngreso('procedimiento', e.target.value)}
                                                    className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a63e] transition-all resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Indicaciones Pre-quirúrgicas</label>
                                                <textarea
                                                    value={safeData.ordenIngreso?.indicacionesPreQuirurgicas || ''}
                                                    onChange={(e) => updateOrdenIngreso('indicacionesPreQuirurgicas', e.target.value)}
                                                    className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a63e] transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
