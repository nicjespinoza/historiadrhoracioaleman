import React from 'react';
import { Check } from 'lucide-react';
import { CheckboxData, PhysicalExam } from '../../types';
import * as C from '../../constants';

const INPUT_CLASS = "w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-900 text-gray-800 text-sm rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 block transition-all duration-200 outline-none placeholder-gray-400 hover:bg-white";
const CHECKBOX_WRAPPER_CLASS = "flex items-center space-x-3 p-2.5 rounded-lg border-2 border-gray-900 bg-white hover:bg-gray-50 transition-all cursor-pointer";
const SECTION_TITLE_CLASS = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2";

export const CheckboxList = ({
    items, data, onChange
}: {
    items: string[], data: CheckboxData, onChange: (key: string, val: boolean) => void
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
        {items.map(item => {
            const isChecked = !!data[item];
            return (
                <label key={item} className={`${CHECKBOX_WRAPPER_CLASS} ${isChecked ? 'bg-blue-50 border-blue-100' : ''}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-gray-900' : 'bg-white border-gray-900'}`}>
                        {isChecked && <Check size={12} className="text-white" />}
                    </div>
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onChange(item, e.target.checked)}
                        className="hidden" // Hidden native checkbox
                    />
                    <span className={`font-medium ${isChecked ? 'text-blue-800' : 'text-gray-600'}`}>{item}</span>
                </label>
            );
        })}
    </div>
);

export const ToggleButton = ({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm ${checked
            ? 'bg-blue-600 text-white ring-2 ring-blue-200'
            : 'bg-white text-gray-500 border-2 border-gray-900 hover:bg-gray-50'
            }`}
    >
        {label}
    </button>
);

export const YesNo = ({
    label, value, onChange
}: {
    label: string, value: { yes: boolean, no: boolean, na?: boolean },
    onChange: (field: 'yes' | 'no' | 'na', val: boolean) => void
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-3">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="flex gap-2">
            <ToggleButton label="SI" checked={value.yes} onClick={() => onChange('yes', !value.yes)} />
            <ToggleButton label="NO" checked={value.no} onClick={() => onChange('no', !value.no)} />
            {value.na !== undefined && (
                <ToggleButton label="N/A" checked={value.na} onClick={() => onChange('na', !value.na)} />
            )}
        </div>
    </div>
);

export const PhysicalExamSection = ({
    data, onChange
}: {
    data: PhysicalExam, onChange: (d: PhysicalExam) => void
}) => {
    const updateSystem = (sys: string, field: 'normal' | 'abnormal' | 'description', val: any) => {
        onChange({
            ...data,
            systems: {
                ...data.systems,
                [sys]: { ...data.systems[sys], [field]: val }
            }
        });
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <h3 className={SECTION_TITLE_CLASS}>V. Examen Físico</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 text-sm mb-8">
                {['fc', 'fr', 'temp', 'pa', 'pam', 'sat02', 'weight', 'height', 'imc'].map(k => (
                    <div key={k} className="flex flex-col">
                        <label className="text-gray-500 text-[11px] uppercase font-bold mb-1.5 tracking-wider">{k}</label>
                        <input
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-center font-medium font-mono"
                            value={(data as any)[k]}
                            onChange={(e) => onChange({ ...data, [k]: e.target.value })}
                        />
                    </div>
                ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#154c8a]/5 text-[#154c8a] uppercase text-xs backdrop-blur-sm">
                        <tr>
                            <th className="p-4 font-bold tracking-wide">Organos y Sistemas</th>
                            <th className="p-4 text-center font-bold w-24">Normal</th>
                            <th className="p-4 text-center font-bold w-24">Anormal</th>
                            <th className="p-4 font-bold">Descripción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {C.SYSTEMS_LIST.map(sys => (
                            <tr key={sys} className="hover:bg-white/40 transition-colors duration-200">
                                <td className="p-4 font-medium text-gray-700">{sys}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center">
                                        <input type="checkbox" className="w-5 h-5 appearance-none border border-gray-300 rounded-md checked:bg-[#154c8a] checked:border-[#154c8a] transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 shadow-sm" checked={data.systems[sys]?.normal || false} onChange={e => updateSystem(sys, 'normal', e.target.checked)} />
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center">
                                        <input type="checkbox" className="w-5 h-5 appearance-none border border-gray-300 rounded-md checked:bg-red-500 checked:border-red-500 transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 shadow-sm" checked={data.systems[sys]?.abnormal || false} onChange={e => updateSystem(sys, 'abnormal', e.target.checked)} />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <input
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-[#154c8a] focus:outline-none text-gray-700 placeholder-gray-400 py-1 transition-colors"
                                        placeholder="Describir hallazgos..."
                                        value={data.systems[sys]?.description || ''}
                                        onChange={e => updateSystem(sys, 'description', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
