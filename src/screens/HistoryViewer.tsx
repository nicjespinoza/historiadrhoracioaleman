import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../../api';
import { Patient, InitialHistory } from '../types';

export const HistoryViewer = () => {
    const { patientId, historyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if History was passed through location state
    const historyFromState = location.state?.history as InitialHistory | undefined;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<InitialHistory | null>(historyFromState || null);
    const [loading, setLoading] = useState(!historyFromState);

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!patientId || !historyId) return;
            try {
                // Determine if we need to fetch history and patient, or just patient
                if (!historyFromState) {
                    const [p, allHistories] = await Promise.all([
                        api.getPatientById(patientId),
                        api.getHistories(patientId)
                    ]);

                    const h = allHistories.find((item: any) =>
                        item.id === historyId ||
                        item.idrandom === historyId ||
                        item.ID === historyId ||
                        item.legacyHistoryId === historyId
                    );

                    setPatient(p || null);
                    setHistory(h as InitialHistory || null);
                } else {
                    const p = await api.getPatientById(patientId);
                    setPatient(p || null);
                }
            } catch (error) {
                console.error("Error loading history/patient:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, historyId, historyFromState]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-white">Cargando documento...</div>;
    if (!history) return <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-gray-500">No se encontró la historia clínica solicitada.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Volver</button>
    </div>;

    // Helper functions to render fields conditionally
    const renderField = (label: string, value: string | undefined | null) => {
        if (!value) return null;
        return (
            <div className="mb-4">
                <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">{label}</h4>
                <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
        );
    };

    const renderBoolean = (label: string, value: boolean | undefined | null, detail?: string) => {
        if (!value && !detail) return null;
        return (
            <div className="mb-1 text-sm">
                <span className="font-bold text-gray-900">{label}:</span>
                {value ? <span className="text-green-700 font-bold ml-1">Sí</span> : <span className="text-gray-500 font-medium ml-1">No</span>}
                {detail && <span className="ml-2 text-gray-600 italic">({detail})</span>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#00a63e] pb-10 print:bg-white print:pb-0">
            {/* Toolbar - Hidden when printing */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ArrowLeft size={20} /> Regresar
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black shadow-md"
                        >
                            <Printer size={18} /> IMPRIMIR
                        </button>
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
                    <h3 className="text-2xl font-black uppercase text-black tracking-widest">HISTORIA CLÍNICA</h3>
                </div>

                {/* Patient Info Header */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm border-b border-gray-100 pb-6">
                    <div className="space-y-2">
                        <p><span className="font-bold text-gray-900">Paciente:</span> <span className="text-green-800 font-medium uppercase">{patient?.firstName} {patient?.lastName}</span></p>
                        <p><span className="font-bold text-gray-900">ID Único:</span> <span className="text-green-800 font-medium">{patient?.id}</span></p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p><span className="font-bold text-gray-900">ID Historia:</span> <span className="text-green-800 font-medium">{history.id?.slice(0, 8)}</span></p>
                        <p><span className="font-bold text-gray-900">Fecha:</span> <span className="text-green-800 font-medium">{history.date ? new Date(history.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}</span></p>
                    </div>
                </div>

                <div className="mb-6 text-sm">
                    <p><span className="font-bold text-gray-900">Nacimiento:</span> <span className="text-green-700 font-medium">{patient?.birthDate || '---'}</span> &nbsp;&nbsp;&nbsp; <span className="font-bold text-gray-900">Edad:</span> <span className="text-green-700 font-medium">{patient?.ageDetails || '---'}</span></p>
                </div>

                {/* Description Body */}
                <div className="mb-4">
                    <div className="border border-gray-300 rounded-sm p-6 min-h-[450px] space-y-6">

                        <div className="mb-4">
                            <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">Motivo de Consulta</h4>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {Object.keys(history.motives || {}).filter(k => history.motives[k]).join(', ')}
                                {history.otherMotive ? (Object.keys(history.motives || {}).some(k => history.motives[k]) ? `, ${history.otherMotive}` : history.otherMotive) : ''}
                                {!Object.keys(history.motives || {}).some(k => history.motives[k]) && !history.otherMotive && '---'}
                            </p>
                        </div>

                        {renderField('Historia de la Enfermedad Actual', history.currentIllnessHistory)}

                        {/* Antecedentes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-4">
                            <div>
                                <h4 className="text-[14px] font-black text-green-700 uppercase mb-2">Antecedentes Patológicos</h4>
                                {renderBoolean('Alergias', history.allergies, history.pathologicalDetails?.allergies)}
                                {renderBoolean('Diabetes', history.diabetes, history.pathologicalDetails?.diabetes)}
                                {renderBoolean('Hipertensión', history.hypertension, history.pathologicalDetails?.hypertension)}
                                {renderBoolean('Cardiopatía', history.cardiopathy, history.pathologicalDetails?.cardiopathy)}
                                {renderBoolean('Cirugías', history.surgeries, history.pathologicalDetails?.surgeries)}
                                {history.otherPathological && (
                                    <div className="mb-1 text-sm mt-2">
                                        <span className="font-bold text-gray-900">Otros:</span>
                                        <span className="ml-2 text-gray-600 italic">({history.otherPathological})</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-green-700 uppercase mb-2">Antecedentes No Patológicos</h4>
                                {renderBoolean('Tabaquismo', history.smoking, history.nonPathologicalDetails?.smoking)}
                                {renderBoolean('Alcohol', history.alcohol, history.nonPathologicalDetails?.alcohol)}
                                {renderBoolean('Drogas', history.drugs, history.nonPathologicalDetails?.drugs)}
                                {renderBoolean('Medicamentos Activos', history.medications, history.nonPathologicalDetails?.medications)}
                            </div>
                        </div>

                        {/* Examen Físico */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-[14px] font-black text-green-700 uppercase mb-2">Examen Físico</h4>
                            {renderField('General', history.physicalExamGeneral)}
                            {renderField('Neurológico', history.neurological)}
                            {renderField('Extremidades / Columna', history.limbs)}
                            {renderField('Abdomen', history.abdomen)}
                            {renderField('Genitales', history.genitals)}
                        </div>

                        {/* Diagnóstico y Avaluo */}
                        <div className="border-t border-gray-200 pt-4">
                            {renderField('Diagnóstico', history.diagnosis)}
                            {renderField('Aváluo', history.assessment)}
                        </div>

                        {/* Orden Médica si existe */}
                        {(history.medicalOrder?.recetarioMedico || history.medicalOrder?.estudiosRadiologicos || history.medicalOrder?.examenLaboratorio || history.medicalOrder?.constanciaMedica || history.medicalOrder?.ordenIngreso?.diagnostico) && (
                            <div className="border-t border-gray-200 pt-4 bg-gray-50 p-4 rounded-md">
                                <h4 className="text-[14px] font-black text-green-700 uppercase mb-2 text-center">Orden Médica Asociada</h4>
                                {renderField('Recetario Médico', history.medicalOrder.recetarioMedico)}
                                {renderField('Estudios Radiológicos', history.medicalOrder.estudiosRadiologicos)}
                                {renderField('Examen de Laboratorio', history.medicalOrder.examenLaboratorio)}
                                {renderField('Constancia Médica', history.medicalOrder.constanciaMedica)}

                                {history.medicalOrder.ordenIngreso?.diagnostico && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h5 className="text-[12px] font-black text-gray-700 uppercase mb-2 text-center underline">Orden de Ingreso</h5>
                                        {renderField('Diagnóstico (OI)', history.medicalOrder.ordenIngreso.diagnostico)}
                                        {renderField('Procedimiento', history.medicalOrder.ordenIngreso.procedimiento)}
                                        {renderField('Indicaciones Pre-Quirúrgicas', history.medicalOrder.ordenIngreso.indicacionesPreQuirurgicas)}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                <div className="absolute bottom-4 left-6 right-6 print:hidden">
                    <p className="text-[11px] font-black text-gray-800 uppercase text-center mt-10">
                        Clínica Palermo, DGI central 1c al lago, Consultorio Urológico
                    </p>
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
                    }
                `}
            </style>
        </div>
    );
};
