import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Patient } from '../types';
import {
    Pill,
    FileImage,
    TestTube,
    FileText,
    Bed,
    Save,
    ArrowLeft,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CreatePrescriptionScreenProps {
    patients?: Patient[];
}

export const CreatePrescriptionScreen: React.FC<CreatePrescriptionScreenProps> = ({ patients }) => {
    const { patientId, prescriptionId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        recetarioMedico: '',
        estudiosRadiologicos: '',
        examenLaboratorio: '',
        constanciaMedica: '',
        ordenIngreso: {
            diagnostico: '',
            procedimiento: '',
            indicacionesPreQuirurgicas: ''
        }
    });

    useEffect(() => {
        const loadInitialData = async () => {
            if (!patientId) return;

            // Load Patient
            let foundPatient = patients?.find(p => p.id === patientId);
            if (!foundPatient) {
                try {
                    const docSnap = await getDoc(doc(db, 'patients', patientId));
                    if (docSnap.exists()) {
                        foundPatient = { id: docSnap.id, ...docSnap.data() } as Patient;
                    }
                } catch (error) {
                    console.error("Error loading patient:", error);
                }
            }
            setPatient(foundPatient || null);

            // Load Prescription if in edit mode
            if (prescriptionId) {
                try {
                    const prescSnap = await getDoc(doc(db, 'patients', patientId, 'prescriptions', prescriptionId));
                    if (prescSnap.exists()) {
                        const data = prescSnap.data();

                        // Smart mapping for legacy fields
                        const recetario = data.recetarioMedico || data.Recetas || data.recetas || data.prescriptionText || '';
                        const radio = data.estudiosRadiologicos || data.Radio || data.radio || '';
                        const lab = data.examenLaboratorio || data.Examen || data.examen || '';
                        const constancia = data.constanciaMedica || data.constancia || data.Constancia || '';

                        const oi = data.ordenIngreso || {};
                        const diag = oi.diagnostico || data.diagnostico || data.Diagnostico || '';
                        const proc = oi.procedimiento || data.procedimiento || data.Procedimiento || '';
                        const ind = oi.indicacionesPreQuirurgicas || data.indicaciones || data.Indicaciones || '';

                        // Infer selected types if documentTypes is missing (migrated data)
                        let types = data.documentTypes || [];
                        if (types.length === 0) {
                            if (recetario) types.push('Recetario Medico');
                            if (radio) types.push('Estudios Radiologicos');
                            if (lab) types.push('Examen de Laboratorio');
                            if (constancia) types.push('Constancia Medica');
                            if (diag || proc || ind) types.push('Orden de Ingreso');

                            // Also check legacy 'Tipo' array
                            if (data.Tipo && Array.isArray(data.Tipo)) {
                                types = [...new Set([...types, ...data.Tipo])];
                            }
                        }

                        setSelectedTypes(types);
                        setFormData({
                            recetarioMedico: recetario,
                            estudiosRadiologicos: radio,
                            examenLaboratorio: lab,
                            constanciaMedica: constancia,
                            ordenIngreso: {
                                diagnostico: diag,
                                procedimiento: proc,
                                indicacionesPreQuirurgicas: ind
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error loading prescription:", e);
                }
            }

            setLoading(false);
        };
        loadInitialData();
    }, [patientId, prescriptionId, patients]);

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleSave = async () => {
        if (!patientId || selectedTypes.length === 0) {
            alert("Seleccione al menos un tipo de orden médica.");
            return;
        }

        setSaving(true);
        try {
            // Prepare the payload based on selected types
            const payload: any = {
                documentTypes: selectedTypes,
                updatedAt: new Date().toISOString()
            };

            const compiledTexts: string[] = [];

            if (selectedTypes.includes('Recetario Medico') && formData.recetarioMedico) {
                payload.recetarioMedico = formData.recetarioMedico;
                compiledTexts.push(`RECETA:\n${formData.recetarioMedico}`);
            }
            if (selectedTypes.includes('Estudios Radiologicos') && formData.estudiosRadiologicos) {
                payload.estudiosRadiologicos = formData.estudiosRadiologicos;
                compiledTexts.push(`ESTUDIOS RADIOLÓGICOS:\n${formData.estudiosRadiologicos}`);
            }
            if (selectedTypes.includes('Examen de Laboratorio') && formData.examenLaboratorio) {
                payload.examenLaboratorio = formData.examenLaboratorio;
                compiledTexts.push(`EXAMEN DE LABORATORIO:\n${formData.examenLaboratorio}`);
            }
            if (selectedTypes.includes('Constancia Medica') && formData.constanciaMedica) {
                payload.constanciaMedica = formData.constanciaMedica;
                compiledTexts.push(`CONSTANCIA MÉDICA:\n${formData.constanciaMedica}`);
            }
            if (selectedTypes.includes('Orden de Ingreso')) {
                payload.ordenIngreso = formData.ordenIngreso;
                payload.diagnostico = formData.ordenIngreso.diagnostico;
                compiledTexts.push(`PROCEDIMIENTO:\n${formData.ordenIngreso.procedimiento}\n\nINDICACIONES PRE-QUIRÚRGICAS:\n${formData.ordenIngreso.indicacionesPreQuirurgicas}`);
            }

            // Combine everything into a displayable text property for ProfileScreen
            payload.prescriptionText = compiledTexts.join('\n\n');

            if (prescriptionId) {
                await api.updatePrescription(patientId, prescriptionId, payload);
            } else {
                payload.date = new Date().toISOString();
                await api.createPrescription(patientId, payload);
            }

            navigate(`/app/profile/${patientId}`);
        } catch (error) {
            console.error("Error saving prescription:", error);
            alert("Hubo un error al guardar la orden médica.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    }

    if (!patient) {
        return <div className="p-8 text-center text-red-500 font-bold">Paciente no encontrado.</div>;
    }

    const options = [
        { id: 'Recetario Medico', label: 'Recetario Médico', icon: <Pill size={20} />, field: 'recetarioMedico' },
        { id: 'Estudios Radiologicos', label: 'Estudios Radiológicos', icon: <FileImage size={20} />, field: 'estudiosRadiologicos' },
        { id: 'Examen de Laboratorio', label: 'Examen de Laboratorio', icon: <TestTube size={20} />, field: 'examenLaboratorio' },
        { id: 'Constancia Medica', label: 'Constancia Médica', icon: <FileText size={20} />, field: 'constanciaMedica' },
        { id: 'Orden de Ingreso', label: 'Orden de Ingreso', icon: <Bed size={20} />, field: 'ordenIngreso' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Banner */}
            <div className="bg-[#000000] border-b border-[#00a63e] shadow-xl">
                <div className="max-w-4xl mx-auto px-4 py-8 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10 text-white mb-6">
                        <button onClick={() => navigate(-1)} className="bg-transparent border border-white/20 hover:bg-white/10 p-2.5 rounded-lg transition-colors backdrop-blur-md">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-light tracking-wide font-sans text-white">
                                {prescriptionId ? 'Editar Orden Médica' : 'Crear Orden Médica'}
                            </h1>
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#00a63e]"></span>
                                Paciente: <span className="font-semibold text-white">{patient.firstName} {patient.lastName}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-[#ffffff] rounded-2xl shadow-xl shadow-black/10 p-6 md:p-10 border border-gray-100">
                    <h2 className="text-xl font-medium text-gray-900 mb-8 pb-4 border-b border-gray-100 uppercase tracking-widest flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center text-[#00a63e]">📋</span>
                        Seleccione el tipo de Orden
                    </h2>

                    <div className="space-y-6">
                        {options.map((opt) => {
                            const isSelected = selectedTypes.includes(opt.id);
                            return (
                                <div key={opt.id} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleType(opt.id)}
                                        className={`w-full text-left p-5 rounded-xl border transition-all flex items-center gap-4 ${isSelected
                                            ? 'bg-gray-50 border-[#00a63e]'
                                            : 'bg-white border-gray-200 hover:border-black hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${isSelected ? 'text-[#00a63e]' : 'text-gray-300'
                                            }`}>
                                            {isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>
                                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
                                            {opt.icon}
                                        </div>
                                        <h3 className={`text-lg font-medium flex-1 ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                                            {opt.label}
                                        </h3>
                                    </button>

                                    {/* Collapsible Content */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-6 bg-white border border-gray-200 rounded-xl ml-4 sm:ml-12 border-l-4 border-l-[#00a63e] space-y-4">
                                            {opt.id !== 'Orden de Ingreso' ? (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                                                        Detalles ({opt.label})
                                                    </label>
                                                    <textarea
                                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all resize-y"
                                                        placeholder="Escriba las indicaciones aquí..."
                                                        value={(formData as any)[opt.field]}
                                                        onChange={(e) => setFormData({ ...formData, [opt.field]: e.target.value })}
                                                    ></textarea>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                                                            Diagnóstico
                                                        </label>
                                                        <textarea
                                                            className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all resize-y"
                                                            placeholder="Escriba el diagnóstico..."
                                                            value={formData.ordenIngreso.diagnostico}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                ordenIngreso: { ...formData.ordenIngreso, diagnostico: e.target.value }
                                                            })}
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                                                            Procedimiento
                                                        </label>
                                                        <textarea
                                                            className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all resize-y"
                                                            placeholder="Escriba el procedimiento..."
                                                            value={formData.ordenIngreso.procedimiento}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                ordenIngreso: { ...formData.ordenIngreso, procedimiento: e.target.value }
                                                            })}
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                                                            Indicaciones Pre-quirúrgicas
                                                        </label>
                                                        <textarea
                                                            className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all resize-y"
                                                            placeholder="Escriba las indicaciones pre-quirúrgicas..."
                                                            value={formData.ordenIngreso.indicacionesPreQuirurgicas}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                ordenIngreso: { ...formData.ordenIngreso, indicacionesPreQuirurgicas: e.target.value }
                                                            })}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving || selectedTypes.length === 0}
                            className={`flex items-center gap-2 px-8 py-4 rounded-lg font-medium text-lg transition-all ${saving || selectedTypes.length === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden'
                                : 'bg-[#000000] text-white hover:bg-[#00a63e]'
                                } ${saving || selectedTypes.length === 0 ? 'hidden' : 'inline-flex'}`}
                            style={{ display: saving || selectedTypes.length === 0 ? 'none' : 'inline-flex' }}
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#00a63e] border-t-transparent rounded-full animate-spin"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Guardar Orden Médica
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
