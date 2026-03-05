import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Save, X, Globe, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../api';
import { Patient } from '../types';

export const PrescriptionViewer = () => {
    const { patientId, prescriptionId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [prescription, setPrescription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!patientId || !prescriptionId) return;
            try {
                const [p, allPrescs] = await Promise.all([
                    api.getPatientById(patientId),
                    api.getPrescriptions(patientId)
                ]);

                const presc = allPrescs.find((pr: any) => pr.id === prescriptionId || pr.legacyId === prescriptionId || pr.legacyWixId === prescriptionId);

                setPatient(p || null);
                setPrescription(presc || null);
                setEditData(presc || null);
            } catch (error) {
                console.error("Error loading prescription:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, prescriptionId]);

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async () => {
        // Implement save logic here if needed
        setPrescription(editData);
        setIsEditing(false);
        alert("Cambios guardados localmente (Funcionalidad de guardado en DB pendiente)");
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-white">Cargando documento...</div>;
    if (!prescription) return <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-gray-500">No se encontró el documento solicitado.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Volver</button>
    </div>;

    const documentType = Array.isArray(prescription.documentTypes) ? prescription.documentTypes[0] : (prescription.documentTypes || 'RECETARIO MÉDICO');

    return (
        <div className="min-h-screen bg-gray-100 pb-10 print:bg-white print:pb-0">
            {/* Toolbar - Hidden when printing */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ArrowLeft size={20} /> Regresar
                    </button>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50"
                                >
                                    <X size={18} /> Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md"
                                >
                                    <Save size={18} /> Guardar
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black shadow-md"
                                >
                                    <Edit size={18} /> Editar
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black shadow-md"
                                >
                                    <Printer size={18} /> IMPRIMIR
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Sheet */}
            <div className="max-w-[850px] mx-auto mt-8 bg-white shadow-2xl min-h-[1100px] p-10 print:shadow-none print:mt-0 print:p-0" ref={printRef}>
                {/* Header */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="absolute left-0 top-0">
                        <img src="/images/logo-dr-horacio-aleman.png" alt="Logo" className="h-28 w-auto" />
                    </div>
                    <div className="text-center pt-2">
                        <h1 className="text-3xl font-bold tracking-tight text-black border-b-2 border-black inline-block pb-1 uppercase">CONSULTORIO UROLÓGICO</h1>
                        <h2 className="text-xl font-bold text-green-700 mt-2">Dr. Horacio H. Alemán E.</h2>
                        <p className="font-bold text-gray-800 text-sm">URÓLOGO</p>
                        <p className="text-[10px] text-green-700 font-bold tracking-tighter uppercase italic">POST GRADO ENDOUROLOGIA · LAROSCOPIA UROLOGICA</p>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black uppercase text-black tracking-widest">{documentType}</h3>
                </div>

                {/* Patient Info Header */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm border-b border-gray-100 pb-6">
                    <div className="space-y-2">
                        <p><span className="font-bold text-gray-900">Paciente:</span> <span className="text-green-800 font-medium uppercase">{patient?.firstName} {patient?.lastName}</span></p>
                        <p><span className="font-bold text-gray-900">Tipo de orden:</span> <span className="text-green-700 font-medium">{documentType}</span></p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p><span className="font-bold text-gray-900">ID Orden:</span> <span className="text-green-800 font-medium">{prescription.legacyId || prescription.id?.slice(0, 8)}</span></p>
                        <p><span className="font-bold text-gray-900">Fecha:</span> <span className="text-green-800 font-medium">{new Date(prescription.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                    </div>
                </div>

                <div className="mb-6 text-sm">
                    <p><span className="font-bold text-gray-900">Nacimiento:</span> <span className="text-green-700 font-medium">{patient?.birthDate}</span> &nbsp;&nbsp;&nbsp; <span className="font-bold text-gray-900">Edad:</span> <span className="text-green-700 font-medium">{patient?.ageDetails}</span></p>
                </div>

                {/* Description Body */}
                <div className="mb-4">
                    <p className="text-sm font-black text-green-700 uppercase tracking-widest mb-3">
                        DESCRIPCIÓN: <span className="text-red-500 font-bold lowercase normal-case text-xs opacity-70">Ordenes guardadas: ({documentType})</span>
                    </p>

                    <div className="border-2 border-black rounded-sm p-6 min-h-[450px] relative">
                        {isEditing ? (
                            <div className="space-y-6">
                                {prescription.diagnostico !== undefined && (
                                    <div>
                                        <label className="block text-[11px] font-black text-green-700 uppercase mb-1">Diagnostico:</label>
                                        <textarea
                                            className="w-full border p-2 text-sm rounded"
                                            value={editData.diagnostico}
                                            onChange={e => setEditData({ ...editData, diagnostico: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                )}
                                {prescription.procedimiento !== undefined && (
                                    <div>
                                        <label className="block text-[11px] font-black text-green-700 uppercase mb-1">Procedimiento:</label>
                                        <textarea
                                            className="w-full border p-2 text-sm rounded"
                                            value={editData.procedimiento}
                                            onChange={e => setEditData({ ...editData, procedimiento: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                )}
                                {prescription.indicaciones !== undefined && (
                                    <div>
                                        <label className="block text-[11px] font-black text-green-700 uppercase mb-4 text-center">Indicaciones Pre quirúrgicas</label>
                                        <textarea
                                            className="w-full border p-2 text-sm rounded"
                                            value={editData.indicaciones}
                                            onChange={e => setEditData({ ...editData, indicaciones: e.target.value })}
                                            rows={8}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {prescription.diagnostico && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Diagnostico:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-snug">{prescription.diagnostico}</p>
                                    </div>
                                )}
                                {prescription.procedimiento && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Procedimiento:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-snug">{prescription.procedimiento}</p>
                                    </div>
                                )}

                                {prescription.indicaciones && (
                                    <div className="pt-4">
                                        <h4 className="text-[15px] font-black text-green-700 uppercase mb-4 text-center underline tracking-tighter decoration-1 underline-offset-4">Indicaciones</h4>
                                        <div className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {prescription.indicaciones}
                                        </div>
                                    </div>
                                )}

                                {(prescription.prescriptionText || prescription.recetas || prescription.Recetas) && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Receta / Indicaciones:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {prescription.prescriptionText || prescription.recetas || prescription.Recetas}
                                        </p>
                                    </div>
                                )}

                                {(prescription.labOrders || prescription.Examen) && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Exámenes de Laboratorio:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {prescription.labOrders || prescription.Examen}
                                        </p>
                                    </div>
                                )}

                                {(prescription.imagingOrders || prescription.Radio) && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Estudios Radiológicos:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {prescription.imagingOrders || prescription.Radio}
                                        </p>
                                    </div>
                                )}

                                {prescription.certificate && (
                                    <div>
                                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Constancia:</h4>
                                        <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-wrap">{prescription.certificate}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="absolute bottom-4 left-6 right-6">
                            <p className="text-[11px] font-black text-gray-800 uppercase text-center mt-10">
                                Clínica Palermo, DGI central 1c al lago, Consultorio Urológico
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Signature Area */}
                <div className="mt-12 flex flex-col items-center">
                    <img src="/images/firma.png" alt="Firma" className="h-20 w-auto mb-[-10px] relative z-10" />
                    <div className="w-64 border-t-2 border-black"></div>
                    <p className="text-sm font-bold mt-1">Firma</p>
                    <div className="mt-4 flex flex-col items-center">
                        <img src="/images/logo-dr-horacio-aleman.png" alt="Sello" className="h-16 w-auto opacity-80" />
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Dr. Horacio Aleman E.</p>
                        <p className="text-[8px] text-gray-400">Urólogo</p>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        @page {
                            margin: 0;
                            size: auto;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};
