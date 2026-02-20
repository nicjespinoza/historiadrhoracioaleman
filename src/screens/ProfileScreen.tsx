import React, { useState } from 'react';
import { User, FileText, Stethoscope, ArrowLeft, Plus, Calendar, Edit, X, Save, Trash2, Eye, Video, Clock, CheckCircle, Brain, Lightbulb, AlertTriangle, ClipboardList, Loader2, PenTool, ChevronDown, Globe, Database, AlertCircle, ShieldCheck } from 'lucide-react';
import { Patient, InitialHistory, SubsequentConsult } from '../types';
import { calculateAge } from '../lib/helpers';
import { api } from '../../api';
import { InputGroup } from '../components/ui/InputGroup';
import { AppointmentModal } from '../components/AppointmentModal';
import { JitsiMeetModal } from '../components/premium-ui/JitsiMeetModal';
import { useParams, useNavigate } from 'react-router-dom';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import ReactSignatureCanvas from 'react-signature-canvas';

const INPUT_CLASS = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 block transition-all duration-200 outline-none placeholder-gray-400 hover:bg-white";

interface ProfileScreenProps {
    patients: Patient[];
    histories: InitialHistory[];
    consults: SubsequentConsult[];
    onPatientUpdate: (patient: Patient) => void;
}

export const ProfileScreen = ({ patients, histories = [], consults = [], onPatientUpdate }: ProfileScreenProps) => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // UI States
    const [currentTab, setCurrentTab] = useState<'general' | 'consents' | 'stats'>('general');
    const [showFullInfo, setShowFullInfo] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Partial<Patient>>({});
    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [deleteSnapshotId, setDeleteSnapshotId] = useState<string | null>(null);

    // Local state for lazy loaded data
    const [localHistories, setLocalHistories] = useState<InitialHistory[]>([]);
    const [localConsults, setLocalConsults] = useState<SubsequentConsult[]>([]);

    // Video consultation state
    const [appointments, setAppointments] = useState<any[]>([]);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoAppointment, setVideoAppointment] = useState<any>(null);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState<string | null>(null);

    // Prescriptions State
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

    React.useEffect(() => {
        if (patientId) {
            // Load Snapshots
            api.getSnapshots(patientId).then(setSnapshots).catch(console.error);

            // Load Appointments
            api.getAppointments().then(all => {
                const patientApts = all.filter((a: any) => a.patientId === patientId);
                setAppointments(patientApts);
            }).catch(console.error);

            // Lazy Load Histories & Consults if not provided via props (or if empty due to optimization)
            if (histories.filter(h => h.patientId === patientId).length === 0) {
                api.getHistories(patientId).then(data => {
                    // We can't update the parent state easily from here without a huge refactor, 
                    // so we should probably use a local state merge or assume the parent keeps them empty
                    // Actually, better to use local state for this screen's display if parent doesn't have them.
                    setLocalHistories(data);
                });

                api.getConsults(patientId).then(data => {
                    setLocalConsults(data);
                });

                // Load Prescriptions (legacy & new)
                api.getPrescriptions(patientId).then(setPrescriptions).catch(console.error);
            }
        }
    }, [patientId, histories]); // Dependencies

    const patient = patients.find(p => p.id === patientId);

    const handleEditClick = () => {
        if (patient) {
            setEditingPatient(patient);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdatePatient = async () => {
        if (!patient || !editingPatient) return;
        try {
            const updated = await api.updatePatient(patient.id, editingPatient);
            onPatientUpdate(updated);
            setIsEditModalOpen(false);
            alert('Paciente actualizado correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar paciente');
        }
    };

    // Create video room and open Jitsi for doctor
    const handleCreateVideoRoom = async (apt: any) => {
        setCreatingRoom(apt.id);
        try {
            // Update appointment to mark video room as active
            await api.updateAppointment(apt.id, {
                videoRoomActive: true,
                videoRoomCreatedAt: new Date().toISOString(),
                videoRoomId: `HistoriaClinica_${apt.id} `
            } as any);

            // Update local state
            setAppointments(prev => prev.map(a =>
                a.id === apt.id
                    ? { ...a, videoRoomActive: true, videoRoomCreatedAt: new Date().toISOString() }
                    : a
            ));

            // Open video modal for doctor
            setVideoAppointment(apt);
            setShowVideoModal(true);
        } catch (error) {
            console.error('Error creating video room:', error);
            alert('Error al crear la sala de video');
        } finally {
            setCreatingRoom(null);
        }
    };

    // AI Analysis State
    const [showAIModal, setShowAIModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    // Consent Manager State
    const [selectedConsent, setSelectedConsent] = useState<any>(null);
    const [signatureRef, setSignatureRef] = useState<any>(null);
    const [signedDocs, setSignedDocs] = useState<string[]>([]);

    const CONSENTS_LIST = [
        { id: '1', title: 'Consentimiento para Endoscopia' },
        { id: '2', title: 'Consentimiento para Cirugía Menor' },
        { id: '3', title: 'Consentimiento para Telemedicina' },
        { id: '4', title: 'Consentimiento de Tratamiento de Datos' },
        { id: '5', title: 'Consentimiento Informado General' },
        { id: '6', title: 'Autorización de Procedimientos' },
        { id: '7', title: 'Consentimiento para Anestesia' },
        { id: '8', title: 'Consentimiento para Transfusión' },
        { id: '9', title: 'Rechazo de Tratamiento' },
        { id: '10', title: 'Consentimiento COVID-19' },
    ];

    const handleSaveConsent = () => {
        if (signatureRef && !signatureRef.isEmpty()) {
            const signatureImage = signatureRef.toDataURL();
            console.log("Firma guardada:", signatureImage);

            // Simulation of saving
            if (selectedConsent) {
                setSignedDocs(prev => [...prev, selectedConsent.id]);
                alert('Documento firmado correctamente');
                signatureRef.clear();
            }
        } else {
            alert('Por favor firme el documento antes de guardar');
        }
    };

    const handleAIAnalysis = async () => {
        if (aiResult) {
            setShowAIModal(true);
            return;
        }

        setShowAIModal(true);
        setIsAnalyzing(true);

        try {
            const generateAI = httpsCallable(functions, 'generateAIAnalysis');
            const result = await generateAI({ patientId: patient.id });
            const data = result.data as any;
            setAiResult({
                summary: data.summary,
                risks: data.risks,
                recommendations: data.recommendations
            });
        } catch (error) {
            console.error("Error AI:", error);
            alert("Error al generar análisis IA");
            setShowAIModal(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Paciente no encontrado.</div>;
    }

    // Merge props data with local lazy-loaded data
    const safePatientId = patient?.id || '';
    const patientHistories = [...histories.filter(h => h.patientId === safePatientId), ...localHistories];
    const patientConsults = [...consults.filter(c => c.patientId === safePatientId), ...localConsults];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/app/patients')} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl text-gray-600 transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-cenlae-primary flex items-center gap-2">
                                    {patient.firstName} {patient.lastName}
                                    {patient.isOnline && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online" />}
                                </h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">Pac. {patient.id.slice(0, 6)}</span>
                                    • {calculateAge(patient.birthDate)} años • {patient.sex}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                            <button
                                onClick={handleAIAnalysis}
                                className="flex-1 md:flex-none bg-indigo-600 text-white border border-indigo-400 px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                            >
                                <Brain size={20} /> Análisis IA
                            </button>
                            <button
                                onClick={() => setShowAppointmentModal(true)}
                                className="flex-1 md:flex-none bg-[#083c79] text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-[#0a4b96] transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Calendar size={20} /> Agendar
                            </button>
                            <button
                                onClick={() => navigate(`/app/consult/${patient.id}`)}
                                className="flex-1 md:flex-none bg-[#083c79] text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-[#0a4b96] transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Nueva Consulta
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-6 mt-8 overflow-x-auto">
                        <button
                            onClick={() => setCurrentTab('general')}
                            className={`pb-3 font-bold text-sm transition-all whitespace-nowrap ${currentTab === 'general' ? 'text-[#083c79] border-b-2 border-[#083c79]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Información General
                        </button>
                        <button
                            onClick={() => setCurrentTab('consents')}
                            className={`pb-3 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'consents' ? 'text-[#083c79] border-b-2 border-[#083c79]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <PenTool size={16} /> Consentimientos y Firmas
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB: General Profile Content */}
            {currentTab === 'general' && (
                <div className="space-y-8">
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                        {/* Personal Information Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900 text-lg">Información Personal</h3>
                                    <button onClick={handleEditClick} className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 p-2 rounded-lg hover:bg-blue-50">
                                        <Edit size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <InputGroup label="Fecha de Nacimiento">
                                        <div className="font-medium text-gray-900">{patient.birthDate}</div>
                                        <div className="text-sm text-gray-500">Edad: {calculateAge(patient.birthDate)}</div>
                                    </InputGroup>

                                    <InputGroup label="Teléfono">
                                        <div className="font-medium text-gray-900">{patient.phone || 'No registrado'}</div>
                                    </InputGroup>

                                    <InputGroup label="Email">
                                        <div className="font-medium text-gray-900 break-all">{patient.email || 'No registrado'}</div>
                                    </InputGroup>

                                    {/* Collapsible Section */}
                                    <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${showFullInfo ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-4 border-t border-dashed border-gray-200 space-y-4">
                                            <InputGroup label="Estado Civil">
                                                <div className="font-medium text-gray-700">{patient.civilStatus || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Religión">
                                                <div className="font-medium text-gray-700">{patient.religion || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Ocupación">
                                                <div className="font-medium text-gray-700">{patient.occupation || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Profesión">
                                                <div className="font-medium text-gray-700">{patient.profession || 'No especificada'}</div>
                                            </InputGroup>
                                            <InputGroup label="Procedencia">
                                                <div className="font-medium text-gray-700">{patient.origin || 'No especificada'}</div>
                                            </InputGroup>
                                            <InputGroup label="Acompañante">
                                                <div className="font-medium text-gray-700">{patient.companion || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Dirección">
                                                <div className="font-medium text-gray-700">{patient.address || 'No especificada'}</div>
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowFullInfo(!showFullInfo)}
                                        className="w-full mt-2 py-2 text-sm font-bold text-[#083c79] hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {showFullInfo ? 'Ver menos' : 'Ver más información'}
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${showFullInfo ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Etiquetas</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${patient.patientType === 'Historia Clinica' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                        {patient.patientType || 'Historia Clinica'}
                                    </span>
                                    {patient.isOnline && (
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                                            <Globe size={10} /> Online
                                        </span>
                                    )}
                                    {patient.migrated && (
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                                            <Database size={10} /> Migrado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clinical Histories Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-3 text-xl">
                                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    Historias Clínicas
                                </h3>
                                {patientHistories.length === 0 && (
                                    <button onClick={() => navigate(`/app/history/${patient.id}`)} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">
                                        + Nueva Historia
                                    </button>
                                )}
                            </div>

                            {patientHistories.length > 0 ? (
                                <div className="grid gap-4">
                                    {patientHistories.map(h => (
                                        <div key={h.id} className={`relative p-5 rounded-2xl transition-all duration-300 group ${h.isValidated === false
                                            ? 'bg-amber-50 border border-amber-200'
                                            : 'bg-white border border-gray-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-900/5'
                                            }`}>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${h.isValidated === false ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {h.date}
                                                        </span>
                                                        <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                                                            <Clock size={14} /> {h.time}
                                                        </span>
                                                    </div>

                                                    {h.isValidated === false ? (
                                                        <p className="text-amber-800 font-medium flex items-center gap-2">
                                                            <AlertCircle size={16} /> Historia clínica pendiente de completar
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <p className="text-gray-900 font-medium text-lg leading-tight">
                                                                {Object.keys(h.motives || {}).filter(k => h.motives[k]).join(', ') || h.otherMotive || 'Consulta General'}
                                                            </p>
                                                            <p className="text-gray-500 text-sm line-clamp-1">
                                                                {h.historyOfPresentIllness || 'Sin detalles adicionales...'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    {h.isValidated === false ? (
                                                        <button
                                                            onClick={() => navigate(`/app/history/${patient.id}`, { state: { history: h } })}
                                                            className="bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-900/20"
                                                        >
                                                            Completar
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => navigate(`/app/history/${patient.id}`, { state: { history: h } })}
                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#083c79] hover:text-white transition-all flex items-center justify-center pointer-events-auto"
                                                                title="Ver Detalles"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedHistoryId(h.id);
                                                                    setShowPrescriptionsModal(true);
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"
                                                                title="Ver Recetas"
                                                            >
                                                                <ClipboardList size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/app/history/${patient.id}`, { state: { history: h } })}
                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button className="w-10 h-10 rounded-xl bg-gray-50 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-4">No hay historia clínica registrada</p>
                                    <button onClick={() => navigate(`/app/history/${patient.id}`)} className="text-[#083c79] font-bold hover:underline">
                                        Crear Historia Inicial
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#083c79] rounded-xl p-6 text-white shadow-lg overflow-hidden relative mx-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <span className="bg-white/20 p-1.5 rounded-lg">🧬</span> Diseñar Enfermedad
                            </h3>
                            <p className="text-blue-100 mb-4 text-sm max-w-md">
                                Utiliza nuestra herramienta de modelado 3D para visualizar y marcar áreas afectadas en el cuerpo humano.
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const newSnap = await api.createSnapshot(patient.id);
                                        navigate(`/app/crearimagen/${patient.id}/${newSnap.id}`);
                                    } catch (e) {
                                        alert('Error al crear nueva imagen');
                                    }
                                }}
                                className="bg-white text-blue-900 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 mb-6"
                            >
                                <span>Crear imagen 3D</span>
                                <ArrowLeft className="rotate-180" size={18} />
                            </button >

                            {
                                snapshots.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-sm text-blue-200 uppercase tracking-widest border-b border-white/20 pb-1 mb-2">Imágenes Guardadas</h4>
                                        {snapshots.map(snap => (
                                            <div key={snap.id} className="bg-white/10 p-3 rounded-lg border border-white/10 flex justify-between items-center group hover:bg-white/20 transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm">{snap.name}</p>
                                                    <p className="text-xs text-blue-200">{new Date(snap.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/app/crearimagen/${patient.id}/${snap.id}`)}
                                                        className="bg-blue-500 hover:bg-blue-600 p-1.5 rounded-md transition-colors" title="Ver"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteSnapshotId(snap.id)}
                                                        className="bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition-colors" title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div >
                    </div >

                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg mb-4">
                            <Stethoscope className="text-purple-600" /> Consultas de Seguimiento
                        </h3>
                        {patientConsults.length > 0 ? (
                            <div className="space-y-3">
                                {patientConsults.map(c => (
                                    <div key={c.id} className="bg-gray-50 p-4 rounded-xl border-2 border-black hover:border-purple-900 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{c.date} - {c.time}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-bold">Motivo consulta:</span> {Object.keys(c.motives || {}).filter(k => c.motives[k]).join(', ') || c.otherMotive || 'Sin motivo'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => navigate(`/app/consult/${patient.id}`)}
                                                    className="bg-[#083c79] text-white px-4 py-1 rounded-lg text-xs font-medium hover:bg-[#0a4b96] transition-colors"
                                                >
                                                    Ver
                                                </button>
                                                <button className="bg-[#083c79] text-white px-4 py-1 rounded-lg text-xs font-medium hover:bg-[#0a4b96] transition-colors">
                                                    Editar
                                                </button>
                                                <button className="bg-[#083c79] text-white px-4 py-1 rounded-lg text-xs font-medium hover:bg-[#0a4b96] transition-colors">
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No hay consultas registradas</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upcoming Appointments Section */}
            {appointments.filter(a => a.type === 'virtual' && (a.paymentStatus === 'paid' || a.paid)).length > 0 && (
                <div className="rounded-2xl shadow-xl p-6 mb-8 text-white overflow-hidden relative mx-8" style={{ backgroundColor: '#083c79' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Video className="text-white" size={24} />
                            Consultas Virtuales Pendientes
                        </h3>
                        <div className="space-y-3">
                            {appointments
                                .filter(a => a.type === 'virtual' && (a.paymentStatus === 'paid' || a.paid))
                                .map(apt => (
                                    <div key={apt.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={16} style={{ color: '#083c79' }} />
                                                    <span className="font-bold" style={{ color: '#083c79' }}>{apt.date}</span>
                                                    <Clock size={16} style={{ color: '#083c79' }} className="ml-2" />
                                                    <span className="font-bold" style={{ color: '#083c79' }}>{apt.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {apt.videoRoomActive ? (
                                                        <>
                                                            <CheckCircle size={14} className="text-green-500" />
                                                            <span className="text-green-600 font-medium">Sala activa - El paciente puede unirse</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span className="text-gray-500">Sala no iniciada</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {apt.videoRoomActive ? (
                                                    <button
                                                        onClick={() => {
                                                            setVideoAppointment(apt);
                                                            setShowVideoModal(true);
                                                        }}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                                                    >
                                                        <Video size={18} />
                                                        Entrar a la Sala
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCreateVideoRoom(apt)}
                                                        disabled={creatingRoom === apt.id}
                                                        className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-70"
                                                    >
                                                        {creatingRoom === apt.id ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                                                                Creando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Video size={18} />
                                                                Crear Video Llamada
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}



            {/* TAB: Consent Manager */}
            {
                currentTab === 'consents' && (
                    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar: List */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={18} className="text-gray-500" /> Documentos Disponibles
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {CONSENTS_LIST.map(consent => {
                                    const isSigned = signedDocs.includes(consent.id);
                                    return (
                                        <button
                                            key={consent.id}
                                            onClick={() => {
                                                setSelectedConsent(consent);
                                                // Reset signature when switching? Maybe better to keep if unsaved? For now, simple switch.
                                                if (signatureRef) signatureRef.clear();
                                            }}
                                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group ${selectedConsent?.id === consent.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className={`mt-0.5 ${selectedConsent?.id === consent.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                {isSigned ? <CheckCircle size={18} className="text-green-500" /> : <Edit size={18} />}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${selectedConsent?.id === consent.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {consent.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {isSigned ? 'Firmado el 18/12/2025' : 'Pendiente de firma'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main: Viewer & Signature */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedConsent ? (
                                <>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Eye size={18} className="text-gray-500" /> Visualizando: {selectedConsent.title}
                                            </h3>
                                            {signedDocs.includes(selectedConsent.id) && (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle size={12} /> Documento Firmado
                                                </span>
                                            )}
                                        </div>
                                        {/* Mock PDF Viewer */}
                                        <div className="h-[400px] bg-gray-100 p-8 overflow-y-auto">
                                            <div className="bg-white shadow-lg min-h-full p-8 mx-auto max-w-2xl">
                                                <div className="text-center mb-8">
                                                    <h1 className="text-xl font-bold uppercase mb-2">Consentimiento Informado</h1>
                                                    <h2 className="text-lg text-gray-600">{selectedConsent.title}</h2>
                                                </div>
                                                <div className="space-y-4 text-gray-800 text-sm leading-relaxed text-justify">
                                                    <p>
                                                        Yo, <strong>{patient.firstName} {patient.lastName}</strong>, identificado con la historia clínica número <strong>{patient.id}</strong>, declaro que he sido informado/a detalladamente sobre el procedimiento.
                                                    </p>
                                                    <p>
                                                        Entiendo los beneficios, riesgos y alternativas del mismo. He tenido la oportunidad de hacer preguntas y éstas han sido respondidas a mi satisfacción.
                                                    </p>
                                                    <p>
                                                        Autorizo al equipo médico a realizar el procedimiento y cualquier intervención adicional que se considere necesaria durante el proceso por mi bienestar.
                                                    </p>
                                                    <p className="mt-8 font-bold">
                                                        Mediante mi firma a continuación, expreso mi consentimiento libre y voluntario.
                                                    </p>
                                                    <div className="mt-12 pt-8 border-t border-gray-300">
                                                        <p className="mb-2">Firmado digitalmente:</p>
                                                        {signedDocs.includes(selectedConsent.id) ? (
                                                            <div className="border-2 border-green-500 border-dashed bg-green-50 p-4 text-center text-green-700 font-bold rounded-xl">
                                                                FIRMA REGISTRADA
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 italic">Espacio para firma digital abajo...</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature Pad */}
                                    {!signedDocs.includes(selectedConsent.id) && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4">
                                            <div className="p-4 border-b border-gray-100 bg-blue-50/30">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <PenTool size={18} className="text-blue-600" /> Panel de Firma
                                                </h3>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Firme dentro del recuadro punteado usando su mouse o pantalla táctil.
                                                </p>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 transition-colors cursor-crosshair relative">
                                                    <ReactSignatureCanvas
                                                        ref={(ref) => setSignatureRef(ref)}
                                                        canvasProps={{
                                                            className: 'signature-canvas w-full h-[200px] rounded-xl',
                                                            style: { width: '100%', height: '200px' }
                                                        }}
                                                        backgroundColor="rgba(255,255,255,0)"
                                                    />
                                                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 pointer-events-none select-none">
                                                        Powered by Medirecord
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center mt-4">
                                                    <button
                                                        onClick={() => signatureRef?.clear()}
                                                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} /> Borrar Firma
                                                    </button>
                                                    <button
                                                        onClick={handleSaveConsent}
                                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                                    >
                                                        <Save size={18} /> Guardar Documento
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                                    <div className="p-6 bg-gray-50 rounded-full mb-4">
                                        <FileText size={48} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">Seleccione un documento</h3>
                                    <p className="max-w-xs mx-auto">
                                        Elija un consentimiento de la lista lateral para visualizarlo y habilitar el panel de firma.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Jitsi Video Modal for Doctor */}
            {
                showVideoModal && videoAppointment && (
                    <JitsiMeetModal
                        isOpen={showVideoModal}
                        onClose={() => {
                            setShowVideoModal(false);
                            setVideoAppointment(null);
                        }}
                        appointmentId={videoAppointment.id}
                        roomName={`HistoriaClinica_${videoAppointment.id}`}
                        displayName="Doctor"
                    />
                )
            }

            <AppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => setShowAppointmentModal(false)}
                onSuccess={() => {
                    // Optional: Refresh data if needed, but appointments are not shown here yet
                    alert('Cita agendada correctamente');
                }}
                patients={patients}
                preSelectedPatientId={patient.id}
            />

            {/* Prescriptions Modal */}
            {
                showPrescriptionsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowPrescriptionsModal(false)}
                        />

                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-6 flex justify-between items-center z-10">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <ClipboardList className="text-[#083c79]" /> Recetas y Órdenes
                                </h2>
                                <button onClick={() => setShowPrescriptionsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {(() => {
                                    // Find linked prescriptions
                                    const history = patientHistories.find(h => h.id === selectedHistoryId);
                                    const linkedPrescriptions = prescriptions.filter(p =>
                                        (p.legacyRelatedId && history?.legacyRandomId && p.legacyRelatedId === history.legacyRandomId) ||
                                        (p.date && history?.date && p.date.split('T')[0] === history.date) // Fallback by date
                                    );

                                    const legacyText = history?.legacyPrescription;

                                    if (!legacyText && linkedPrescriptions.length === 0) {
                                        return (
                                            <div className="text-center py-10 text-gray-500">
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                                    <FileText className="text-gray-400" size={32} />
                                                </div>
                                                <p>No hay recetas registradas para esta historia.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {/* Legacy Text Content */}
                                            {legacyText && (
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <h3 className="font-bold text-[#083c79] mb-2 text-sm uppercase tracking-wide">Notas de Receta</h3>
                                                    <p className="whitespace-pre-wrap text-gray-700 text-sm">{legacyText}</p>
                                                </div>
                                            )}

                                            {/* Structured Prescriptions */}
                                            {linkedPrescriptions.map((p, idx) => (
                                                <div key={p.id || idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                                        <span className="font-bold text-gray-700 text-sm">Documento #{idx + 1}</span>
                                                        <span className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        {p.medications && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">Medicamentos:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{p.medications}</p>
                                                            </div>
                                                        )}
                                                        {p.labs && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">Exámenes:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{p.labs}</p>
                                                            </div>
                                                        )}
                                                        {p.imaging && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">Radiología:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{p.imaging}</p>
                                                            </div>
                                                        )}
                                                        {p.indications && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">Indicaciones:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{p.indications}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowPrescriptionsModal(false)}
                                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* AI Analysis Modal */}
            {
                showAIModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowAIModal(false)}
                        />

                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-6 flex justify-between items-center z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Análisis IA</h2>
                                        <p className="text-sm text-gray-500">Asistente Clínico Inteligente</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                                            <Loader2 size={48} className="text-indigo-600 animate-spin relative z-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analizando Historia Clínica...</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            Nuestra IA está procesando los antecedentes, consultas y signos vitales del paciente para generar insights médicos.
                                        </p>
                                    </div>
                                ) : aiResult ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Summary Card */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                                            <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                                <ClipboardList size={20} className="text-indigo-600" />
                                                Resumen Clínico
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {aiResult.summary}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Risks Card */}
                                            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm ring-1 ring-orange-50">
                                                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                                                    <AlertTriangle size={20} className="text-orange-500" />
                                                    Riesgos Detectados
                                                </h3>
                                                <ul className="space-y-3">
                                                    {aiResult.risks?.map((risk: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 bg-orange-50/50 p-3 rounded-xl">
                                                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 flex-shrink-0" />
                                                            <span className="leading-snug">{risk}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Recommendations Card */}
                                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm ring-1 ring-emerald-50">
                                                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                                    <Lightbulb size={20} className="text-emerald-500" />
                                                    Recomendaciones
                                                </h3>
                                                <ul className="space-y-3">
                                                    {aiResult.recommendations?.map((rec: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 bg-emerald-50/50 p-3 rounded-xl">
                                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2.5 flex-shrink-0" />
                                                            <span className="leading-snug">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={() => setShowAIModal(false)}
                                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                                            >
                                                Cerrar Análisis
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Edit Patient Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-gray-900">Editar Información del Paciente</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Nombre">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.firstName || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Apellido">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.lastName || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Fecha de Nacimiento">
                                    <input
                                        type="date"
                                        className={INPUT_CLASS}
                                        value={editingPatient.birthDate || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, birthDate: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Sexo">
                                    <select
                                        className={INPUT_CLASS}
                                        value={editingPatient.sex || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, sex: e.target.value as any })}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Estado Civil">
                                    <select
                                        className={INPUT_CLASS}
                                        value={editingPatient.civilStatus || 'Soltero'}
                                        onChange={e => setEditingPatient({ ...editingPatient, civilStatus: e.target.value })}
                                    >
                                        <option value="Soltero">Soltero</option>
                                        <option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option>
                                        <option value="Viudo">Viudo</option>
                                        <option value="Unión Libre">Unión Libre</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Religión">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.religion || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, religion: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Ocupación">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.occupation || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, occupation: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Profesión">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.profession || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, profession: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Procedencia">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.origin || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, origin: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Acompañante">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.companion || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, companion: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Email">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.email || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, email: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Teléfono">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.phone || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Dirección">
                                    <input
                                        className={INPUT_CLASS}
                                        value={editingPatient.address || ''}
                                        onChange={e => setEditingPatient({ ...editingPatient, address: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Tipo de Paciente">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="patientType"
                                                value="Historia Clinica"
                                                checked={(editingPatient.patientType || 'Historia Clinica') === 'Historia Clinica'}
                                                onChange={e => setEditingPatient({ ...editingPatient, patientType: e.target.value as any })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Historia Clínica</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="patientType"
                                                value="Recetario"
                                                checked={editingPatient.patientType === 'Recetario'}
                                                onChange={e => setEditingPatient({ ...editingPatient, patientType: e.target.value as any })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Recetario</span>
                                        </label>
                                    </div>
                                </InputGroup>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdatePatient}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    <Save size={20} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>

                )
            }
            {/* Delete Snapshot Confirmation Modal */}
            {
                deleteSnapshotId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-red-600 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-red-500 animate-in zoom-in-95 duration-200">
                            <h3 className="text-white font-bold text-lg mb-6 text-center leading-snug">
                                ¿Estás seguro de que deseas eliminar permanentemente esta imagen?
                            </h3>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setDeleteSnapshotId(null)}
                                    className="bg-white/90 text-red-600 px-6 py-2 rounded-xl font-bold transition-all shadow-md hover:bg-white hover:shadow-lg hover:scale-105"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.deleteSnapshot(patient.id, deleteSnapshotId);
                                            setSnapshots(prev => prev.filter(s => s.id !== deleteSnapshotId));
                                            setDeleteSnapshotId(null);
                                        } catch (e) {
                                            alert('Error al eliminar imagen');
                                            console.error(e);
                                        }
                                    }}
                                    className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold transition-all shadow-md hover:bg-gray-100 hover:shadow-lg hover:scale-105 border-b-4 border-gray-200 hover:border-gray-300"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};
