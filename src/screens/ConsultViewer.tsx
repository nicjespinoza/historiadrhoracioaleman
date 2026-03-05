import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../../api';
import { Patient, SubsequentConsult } from '../types';

export const ConsultViewer = () => {
    const { patientId, consultId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if Consult was passed through location state
    const consultFromState = location.state?.consult as SubsequentConsult | undefined;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [consult, setConsult] = useState<SubsequentConsult | null>(consultFromState || null);
    const [loading, setLoading] = useState(!consultFromState);

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!patientId || !consultId) return;
            try {
                if (!consultFromState) {
                    const [p, c] = await Promise.all([
                        api.getPatientById(patientId),
                        api.getConsultById(patientId, consultId)
                    ]);
                    setPatient(p || null);
                    setConsult(c || null);
                } else {
                    const p = await api.getPatientById(patientId);
                    setPatient(p || null);
                }
            } catch (error) {
                console.error("Error loading consult/patient:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, consultId, consultFromState]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-white">Cargando documento...</div>;
    if (!consult) return <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-gray-500">No se encontró la consulta solicitada.</p>
        <button onClick={() => navigate(-1)} className="bg-[#00a63e] text-white px-4 py-2 rounded-lg font-bold">Volver</button>
    </div>;

    const renderField = (label: string, value: string | undefined | null) => {
        if (!value) return null;
        return (
            <div className="mb-4">
                <h4 className="text-[14px] font-black text-green-700 uppercase mb-1">{label}</h4>
                <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">{value}</p>
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
                            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 shadow-md transition-all"
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
                    <h3 className="text-2xl font-black uppercase text-black tracking-widest">CONSULTA SUBSECUENTE</h3>
                </div>

                {/* Patient Info Header */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm border-b border-gray-100 pb-6">
                    <div className="space-y-2">
                        <p><span className="font-bold text-gray-900">Paciente:</span> <span className="text-green-800 font-medium uppercase">{patient?.firstName} {patient?.lastName}</span></p>
                        <p><span className="font-bold text-gray-900">ID Único:</span> <span className="text-green-800 font-medium">{patient?.id}</span></p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p><span className="font-bold text-gray-900">ID Consulta:</span> <span className="text-green-800 font-medium">{consult.id?.slice(0, 8)}</span></p>
                        <p><span className="font-bold text-gray-900">Fecha:</span> <span className="text-green-800 font-medium">{consult.date ? new Date(consult.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}</span></p>
                    </div>
                </div>

                <div className="mb-6 text-sm">
                    <p><span className="font-bold text-gray-900">Edad:</span> <span className="text-green-700 font-medium">{patient?.ageDetails || '---'}</span></p>
                </div>

                {/* Body Content */}
                <div className="border border-gray-300 rounded-sm p-6 space-y-6">
                    {renderField('Motivo de la Consulta', (consult as any).consultReason || consult.otherMotive)}

                    {/* Vital Signs Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 border-b border-gray-100 pb-4 mb-6">
                        {[
                            { label: 'PA', val: consult.vitalSigns?.pa, unit: 'mmHg' },
                            { label: 'FC', val: consult.vitalSigns?.fc, unit: 'lpm' },
                            { label: 'FR', val: consult.vitalSigns?.fr, unit: 'rpm' },
                            { label: 'Temp', val: consult.vitalSigns?.temp, unit: '°C' },
                            { label: 'SatO2', val: consult.vitalSigns?.sat02, unit: '%' },
                            { label: 'IMC', val: consult.anthropometrics?.imc, unit: '' },
                        ].map((v, i) => (
                            <div key={i} className="text-center">
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-tighter">{v.label}</p>
                                <p className="text-sm font-bold text-gray-900">{v.val || '---'}</p>
                                {v.unit && <p className="text-[8px] text-gray-400">{v.unit}</p>}
                            </div>
                        ))}
                    </div>

                    {renderField('Historia de la Enfermedad Actual', consult.historyOfPresentIllness)}

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-[14px] font-black text-green-700 uppercase mb-2">Examen Físico</h4>
                        {renderField('General', consult.physicalExamGeneral)}
                        {renderField('Abdomen', consult.abdomen)}
                        {renderField('TDR', consult.tdr)}
                        {renderField('Genitales', consult.genitals)}
                        {renderField('Miembros', consult.limbs)}
                        {renderField('Neurológico', consult.neurological)}
                        {renderField('Avalúo', consult.assessment)}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        {renderField('Diagnóstico', consult.diagnosis)}
                        {renderField('Estudios de Laboratorio', consult.labStudies)}
                    </div>

                    {/* Medical Order */}
                    {(consult.medicalOrder?.recetarioMedico || consult.medicalOrder?.estudiosRadiologicos || consult.medicalOrder?.examenLaboratorio || consult.medicalOrder?.constanciaMedica || consult.medicalOrder?.ordenIngreso?.diagnostico) && (
                        <div className="border-t border-gray-200 pt-4 bg-gray-50 p-4 rounded-md">
                            <h4 className="text-[14px] font-black text-green-700 uppercase mb-2 text-center">Orden Médica Asociada</h4>
                            {renderField('Recetario Médico', consult.medicalOrder.recetarioMedico)}
                            {renderField('Estudios Radiológicos', consult.medicalOrder.estudiosRadiologicos)}
                            {renderField('Examen de Laboratorio', consult.medicalOrder.examenLaboratorio)}
                            {renderField('Constancia Médica', consult.medicalOrder.constanciaMedica)}

                            {consult.medicalOrder.ordenIngreso?.diagnostico && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-[12px] font-black text-gray-700 uppercase mb-2 text-center underline">Orden de Ingreso</h5>
                                    {renderField('Diagnóstico (OI)', consult.medicalOrder.ordenIngreso.diagnostico)}
                                    {renderField('Procedimiento', consult.medicalOrder.ordenIngreso.procedimiento)}
                                    {renderField('Indicaciones Pre-Quirúrgicas', consult.medicalOrder.ordenIngreso.indicacionesPreQuirurgicas)}
                                </div>
                            )}
                        </div>
                    )}
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
