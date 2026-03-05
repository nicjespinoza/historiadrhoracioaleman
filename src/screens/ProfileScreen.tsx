import React, { useState } from 'react';
import { User, FileText, Stethoscope, ArrowLeft, Plus, Calendar, Edit, X, Save, Trash2, Eye, Image as ImageIcon, Video, Clock, CheckCircle, Brain, Lightbulb, AlertTriangle, ClipboardList, Loader2, PenTool, ChevronDown, Globe, Database, AlertCircle, ShieldCheck, ExternalLink, MapPin, Target, Droplet, Hexagon, Minimize2, Shield } from 'lucide-react';
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

const INPUT_CLASS = "w-full px-4 py-2.5 bg-white border border-2 border-black/10 text-gray-800 text-sm rounded-xl focus:ring-4 focus:ring-[#00a63e]/20 focus:border-[#00a63e] block transition-all duration-200 outline-none placeholder-gray-400 hover:bg-white";

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
    const [currentTab, setCurrentTab] = useState<'general' | 'consents' | 'stats' | 'prescriptions'>('general');
    const [showFullInfo, setShowFullInfo] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Partial<Patient>>({});
    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [deleteSnapshotId, setDeleteSnapshotId] = useState<string | null>(null);
    const [deletePrescriptionId, setDeletePrescriptionId] = useState<string | null>(null);
    const [deleteHistoryId, setDeleteHistoryId] = useState<string | null>(null);
    const [deletedHistoryIds, setDeletedHistoryIds] = useState<Set<string>>(new Set());
    const [deleteConsultId, setDeleteConsultId] = useState<string | null>(null);
    const [deletedConsultIds, setDeletedConsultIds] = useState<Set<string>>(new Set());
    const [allObservations, setAllObservations] = useState<any[]>([]);

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

    // Fallback patient loaded directly from Firestore
    const [localPatient, setLocalPatient] = useState<Patient | null>(null);

    React.useEffect(() => {
        if (patientId) {
            // Load Snapshots
            api.getSnapshots(patientId).then(setSnapshots).catch(console.error);

            // Load Appointments
            api.getAppointments().then(all => {
                const patientApts = all.filter((a: any) => a.patientId === patientId);
                setAppointments(patientApts);
            }).catch(console.error);
            // Load Prescriptions (legacy & new)
            api.getPrescriptions(patientId).then(setPrescriptions).catch(console.error);

            // Load All Observations for Disease Design view
            api.getObservations(patientId).then(setAllObservations).catch(console.error);

            // Lazy Load Histories & Consults if not provided via props (or if empty due to optimization)
            if (histories.filter(h => h.patientId === patientId).length === 0) {
                api.getHistories(patientId).then(data => {
                    setLocalHistories(data);
                });

                api.getConsults(patientId).then(data => {
                    setLocalConsults(data);
                });
            }

            // Fallback: fetch patient directly from Firestore if not in paginated list
            if (!patients.find(p => p.id === patientId)) {
                api.getPatientById(patientId).then(p => {
                    if (p) setLocalPatient(p);
                }).catch(console.error);
            }
        }
    }, [patientId, histories]); // Dependencies

    const patient = patients.find(p => p.id === patientId) || localPatient;

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

    const translateLocation = (loc: string) => {
        if (!loc) return 'Localización general';
        const lower = loc.toLowerCase();

        // Specific checks for mesh artifacts
        const isLeft = lower.includes('left') || lower.includes('izq') || lower.includes('l_') || lower.includes('_l') || lower.includes(' iz') || lower.includes('_left') || lower.includes('366');
        const isRight = lower.includes('right') || lower.includes('der') || lower.includes('r_') || lower.includes('_r') || lower.includes(' de') || lower.includes('_right') || lower.includes('365');
        const side = isRight ? 'Derecho' : isLeft ? 'Izquierdo' : '';

        if (lower.includes('kidney') || lower.includes('renal') || lower.includes('riñon') || lower.includes('surface') || lower.includes('vein') || lower.includes('artery')) {
            // Most "surface" or "vein/artery" in this urology context refer to the kidneys if no other organ is mentioned
            if (lower.includes('ureter')) return `Uréter ${side}`.trim();
            if (lower.includes('bladder') || lower.includes('vejiga') || lower.includes('vesic')) return 'Vejiga';
            if (lower.includes('urethr') || lower.includes('uretra')) return 'Uretra';
            return `Riñón ${side}`.trim();
        }

        if (lower.includes('ureter')) return `Uréter ${side}`.trim();
        if (lower.includes('bladder') || lower.includes('vejiga') || lower.includes('vesic')) return 'Vejiga';
        if (lower.includes('urethr') || lower.includes('uretra')) return 'Uretra';
        if (lower.includes('prostat')) return 'Próstata';
        if (lower.includes('pene')) return 'Pene';
        if (lower.includes('uter')) return 'Útero';
        if (lower.includes('ovari')) return 'Ovario';
        if (lower.includes('vagina')) return 'Vagina';

        return loc.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    };

    const translateMarkerType = (type: string) => {
        const types: any = {
            piedra: 'Piedra',
            litiasis: 'Litiasis',
            tumor: 'Tumor',
            quiste: 'Quiste',
            estenosis: 'Estenosis',
            line: 'Trazo',
            marker: 'Gral'
        };
        return types[type] || 'Hallazgo';
    };

    const markerIcons: any = {
        marker: MapPin,
        tumor: Target,
        quiste: Droplet,
        piedra: Hexagon,
        litiasis: Shield,
        estenosis: Minimize2,
        line: PenTool
    };

    const CONSENTS_LIST = [
        { id: '1', title: 'Consentimiento para Cistoscopia y Procedimientos Urológicos' },
        { id: '2', title: 'Consentimiento para Biopsia de Próstata Transrectal' },
        { id: '3', title: 'Consentimiento para Cirugía de Próstata (RTUP/Abierta)' },
        { id: '4', title: 'Consentimiento para Vasectomía' },
        { id: '5', title: 'Consentimiento Informado General de Urología' },
        { id: '6', title: 'Autorización para Tratamiento de Disfunción Eréctil' },
        { id: '7', title: 'Consentimiento para Telemedicina Urológica' },
        { id: '8', title: 'Autorización de Uso de Datos Personales (Ley 787 Nicaragua)' },
        { id: '9', title: 'Rechazo Informado de Tratamiento Urológico' },
        { id: '10', title: 'Consentimiento para Procedimientos con Láser de Holmio' },
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
        if (!patient) return;

        // Check if we already have a result unless the user wants a recount
        if (aiResult && patient.id !== 'HA33290') {
            setShowAIModal(true);
            return;
        }

        setShowAIModal(true);
        setIsAnalyzing(true);

        try {
            // Demonstration for specific patient ID HA33290
            if (patient.id === 'HA33290') {
                // simulate network delay
                await new Promise(resolve => setTimeout(resolve, 2500));

                setAiResult({
                    summary: "Paciente urológico con antecedentes de hiperplasia prostática benigna (HPB) y seguimiento por litiasis renal bilateral. Presenta una evolución estable con el tratamiento actual de Tamsulosina, aunque los últimos reportes indican un aumento leve en la sintomatología obstructiva baja. Se observa una correlación entre los episodios de dolor lumbar reportados en las consultas subsecuentes y los hallazgos radiológicos de micro-litiasis.",
                    risks: [
                        "Riesgo moderado de retención urinaria aguda debido al crecimiento prostático progresivo.",
                        "Potencial desarrollo de cólico nefrítico por progresión de micro-litiasis renal.",
                        "Posible interacción medicamentosa si se añaden antihipertensivos adicionales al esquema actual.",
                        "Riesgo de infección de vías urinarias recurrente asociado a estasis urinaria."
                    ],
                    recommendations: [
                        "Realizar uroflujometría para evaluar objetivamente el grado de obstrucción infravesical.",
                        "Considerar terapia combinada (Tamsulosina + Dutasterida) si el volumen prostático es >40cc.",
                        "Aumentar ingesta hídrica a 2.5L/día y dieta hiposódica para manejo de litiasis.",
                        "Programar ultrasonido renal y de vías urinarias de control en 3 meses.",
                        "Educar al paciente sobre signos de alarma (hematuria, fiebre, anuria)."
                    ]
                });
                setIsAnalyzing(false);
                return;
            }

            // Real AI Analysis Call
            const generateAI = httpsCallable(functions, 'generateAIAnalysis');

            // Prepare rich context
            const context = {
                patientInfo: {
                    name: `${patient.firstName} ${patient.lastName}`,
                    age: patient.ageDetails,
                    sex: patient.sex,
                    history: patient.initialReason
                },
                clinicalHistories: patientHistories.map(h => ({
                    date: h.date,
                    reason: h.otherMotive || Object.keys(h.motives || {}).filter(k => h.motives[k]).join(', '),
                    assessment: h.assessment,
                    diagnosis: h.diagnosis
                })),
                consultations: patientConsults.map(c => ({
                    date: c.date,
                    reason: c.otherMotive,
                    diagnosis: c.diagnosis,
                    notes: c.historyOfPresentIllness
                })),
                prescriptions: prescriptions.map(p => ({
                    date: p.date,
                    tipo: p.Tipo || p.documentTypes,
                    diagnostico: p.diagnostico || p.Diagnostico,
                    procedimiento: p.procedimiento || p.Procedimiento
                }))
            };

            const result = await generateAI({
                patientId: patient.id,
                fullContext: context // Passing full data for better analysis
            });

            const data = result.data as any;
            setAiResult({
                summary: data.summary,
                risks: data.risks || [],
                recommendations: data.recommendations || []
            });
        } catch (error) {
            console.error("Error AI:", error);
            // alert("Error al generar análisis IA");
            // setShowAIModal(false);

            // Fallback content if function is not deployed or fails
            setAiResult({
                summary: "No se pudo conectar con el servicio de análisis avanzado. Sin embargo, basándose en los registros locales: El paciente requiere seguimiento preventivo. Por favor revise el historial manualmente.",
                risks: ["Error de conexión con el motor de IA", "Datos parciales disponibles"],
                recommendations: ["Reintentar en unos minutos", "Verificar conexión a internet"]
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!patient) {
        return <div className="p-8 text-center text-gray-400">Paciente no encontrado.</div>;
    }

    // Merge props data with local lazy-loaded data - prioritize local and deduplicate
    const safePatientId = patient?.id || '';

    const combinedHistories = [...histories.filter(h => h.patientId === safePatientId), ...localHistories];
    const patientHistories = Array.from(new Map(
        combinedHistories
            .filter(h => !deletedHistoryIds.has(h.id))
            .map(h => [h.id, h])
    ).values()).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    const combinedConsults = [...consults.filter(c => c.patientId === safePatientId), ...localConsults];
    const patientConsults = Array.from(new Map(
        combinedConsults
            .filter(c => !deletedConsultIds.has(c.id))
            .map(c => [c.id, c])
    ).values()).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    if (!patient) return <div className="flex items-center justify-center min-h-screen">Paciente no encontrado</div>;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Banner */}
            <div className="bg-white border-b-2 border-black">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/app/patients')} className="bg-black hover:bg-gray-900 p-2 rounded-xl text-white transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-[#00a63e] flex items-center gap-2">
                                    {patient?.firstName} {patient?.lastName}
                                    {patient?.isOnline && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online" />}
                                </h1>
                                <p className="text-gray-400 flex items-center gap-2 mt-1">
                                    <span className="bg-gray-100 text-black px-2 py-0.5 rounded text-sm font-bold">Pac. {patient?.id?.slice(0, 6)}</span>
                                    • {patient?.birthDate ? calculateAge(patient.birthDate) : 'N/A'} años • {patient?.sex}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                            <button
                                onClick={handleAIAnalysis}
                                className="flex-1 md:flex-none bg-[#00a63e] text-white border border-[#00a63e] px-6 py-3 rounded-xl font-bold hover:bg-[#008f36] transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                <Brain size={20} /> Análisis IA
                            </button>
                            <button
                                onClick={() => setShowAppointmentModal(true)}
                                className="flex-1 md:flex-none bg-[#000000] text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-[#00a63e] transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Calendar size={20} /> Agendar
                            </button>
                            <button
                                onClick={() => navigate(`/app/consult/${patient.id}`)}
                                className="flex-1 md:flex-none bg-[#000000] text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-[#00a63e] transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Nueva Consulta
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-6 mt-8 overflow-x-auto">
                        <button
                            onClick={() => setCurrentTab('general')}
                            className={`pb-3 font-bold text-sm transition-all whitespace-nowrap ${currentTab === 'general' ? 'text-black border-b-2 border-black' : 'text-[#000000] hover:text-[#00a63e]/70'}`}
                        >
                            Información General
                        </button>
                        <button
                            onClick={() => setCurrentTab('prescriptions')}
                            className={`pb-3 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'prescriptions' ? 'text-black border-b-2 border-black' : 'text-[#000000] hover:text-[#00a63e]/70'}`}
                        >
                            <ClipboardList size={16} /> Recetas y Documentos
                            {prescriptions.length > 0 && (
                                <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${(currentTab === 'prescriptions' || currentTab === 'general') ? 'bg-[#00a63e]' : 'bg-[#000000]'}`}>{prescriptions.length}</span>
                            )}
                        </button>
                        <button
                            onClick={() => setCurrentTab('consents')}
                            className={`pb-3 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'consents' ? 'text-black border-b-2 border-black' : 'text-[#000000] hover:text-[#00a63e]/70'}`}
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
                            <div className="bg-white p-6 border-2 border-black rounded-xl shadow-none">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-[#000000] text-lg">Información Personal</h3>
                                    <button onClick={handleEditClick} className="text-gray-400 hover:text-[#00a63e] transition-colors bg-white p-2 rounded-xl hover:bg-white">
                                        <Edit size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <InputGroup label="Fecha de Nacimiento">
                                        <div className="font-medium text-[#000000]">{patient.birthDate}</div>
                                        <div className="text-sm text-black">Edad: {calculateAge(patient.birthDate)}</div>
                                    </InputGroup>

                                    <InputGroup label="Teléfono">
                                        <div className="font-medium text-[#000000]">{patient.phone || 'No registrado'}</div>
                                    </InputGroup>

                                    <InputGroup label="Email">
                                        <div className="font-medium text-[#000000] break-all">{patient.email || 'No registrado'}</div>
                                    </InputGroup>

                                    {/* Collapsible Section */}
                                    <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${showFullInfo ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-4 border-t border-dashed border-2 border-black/30 space-y-4">
                                            <InputGroup label="Estado Civil">
                                                <div className="font-medium text-black">{patient.civilStatus || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Religión">
                                                <div className="font-medium text-black">{patient.religion || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Ocupación">
                                                <div className="font-medium text-black">{patient.occupation || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Profesión">
                                                <div className="font-medium text-black">{patient.profession || 'No especificada'}</div>
                                            </InputGroup>
                                            <InputGroup label="Procedencia">
                                                <div className="font-medium text-black">{patient.origin || 'No especificada'}</div>
                                            </InputGroup>
                                            <InputGroup label="Acompañante">
                                                <div className="font-medium text-black">{patient.companion || 'No especificado'}</div>
                                            </InputGroup>
                                            <InputGroup label="Dirección">
                                                <div className="font-medium text-black">{patient.address || 'No especificada'}</div>
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowFullInfo(!showFullInfo)}
                                        className="w-full mt-2 py-2 text-sm font-bold text-[#000000] hover:bg-white rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {showFullInfo ? 'Ver menos' : 'Ver más información'}
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${showFullInfo ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-2 border-black rounded-xl shadow-none">
                                <h4 className="font-bold text-[#000000] mb-4 text-sm uppercase tracking-wide">Etiquetas</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${patient.patientType === 'Historia Clinica' ? 'bg-[#00a63e] text-white border-2 border-black/10' : 'bg-[#00a63e] text-white border-green-100'}`}>
                                        {patient.patientType || 'Historia Clinica'}
                                    </span>
                                    {patient.isOnline && (
                                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00a63e] text-white border border-green-100 flex items-center gap-1">
                                            <Globe size={10} /> Online
                                        </span>
                                    )}
                                    {patient.migrated && (
                                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00a63e] text-white border border-purple-100 flex items-center gap-1">
                                            <Database size={10} /> Migrado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clinical Histories Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-[#000000] flex items-center gap-3 text-xl">
                                    <div className="p-2 bg-green-100 text-[#00a63e] rounded-xl border-2 border-black">
                                        <FileText size={24} />
                                    </div>
                                    Historias Clínicas
                                </h3>
                                <button
                                    onClick={() => navigate(`/app/history/${patient.id}`, { replace: false })} // Clear state for new history
                                    className="text-sm bg-[#00a63e] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#008f36] transition-colors shadow-lg shadow-green-900/20"
                                >
                                    + Crear
                                </button>
                            </div>

                            {patientHistories.length > 0 ? (
                                <div className="grid gap-4">
                                    {patientHistories.map(h => (
                                        <div key={h.id} className={`relative p-5 border-2 border-black rounded-xl transition-all duration-300 group ${h.isValidated === false
                                            ? 'bg-amber-50 border-amber-200'
                                            : 'bg-white hover:border-[#00a63e] hover:shadow-xl hover:shadow-green-900/5'
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
                                                            <p className="text-[#000000] font-medium text-lg leading-tight">
                                                                {Object.keys(h.motives || {}).filter(k => h.motives[k]).join(', ') || h.otherMotive || 'Consulta General'}
                                                            </p>
                                                            <p className="text-gray-400 text-sm line-clamp-1">
                                                                {h.historyOfPresentIllness || 'Sin detalles adicionales...'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    {h.isValidated === false ? (
                                                        <button
                                                            onClick={() => navigate(`/app/history/edit/${patient.id}/${h.id}`, { state: { history: h } })}
                                                            className="bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-900/20"
                                                        >
                                                            Completar
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const targetUrl = `/app/history/view/${patient.id}/${h.id}`;
                                                                    console.log("Navigating to:", targetUrl);
                                                                    navigate(targetUrl, { state: { history: h } });
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-white text-gray-500 border-2 border-black/10 hover:bg-[#000000] hover:text-white transition-all flex items-center justify-center pointer-events-auto"
                                                                title="Ver Detalles"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/app/history/edit/${patient.id}/${h.id}`, { state: { history: h } })}
                                                                className="w-10 h-10 rounded-xl bg-white text-gray-500 border-2 border-black/10 hover:bg-[#00a63e] hover:text-white transition-all flex items-center justify-center"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteHistoryId(h.id)}
                                                                className="w-10 h-10 rounded-xl bg-white text-red-400 border-2 border-black/10 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
                                                            >
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
                                <div className="text-center py-12 bg-white rounded-xl border-dashed border-2 border-black">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-gray-400 font-medium mb-4">No hay historia clínica registrada</p>
                                    <button onClick={() => navigate(`/app/history/${patient.id}`)} className="text-[#000000] font-bold hover:underline">
                                        Crear Historia Inicial
                                    </button>
                                </div>
                            )}
                            {/* Diseñar Enfermedad Section inside column */}
                            <div className="bg-[#000000] rounded-xl p-6 text-white shadow-lg overflow-hidden relative border-2 border-black">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-xl">
                                            <Brain size={20} className="text-[#00a63e]" />
                                        </div>
                                        Diseñar Enfermedad
                                    </h3>
                                    <p className="text-white mb-4 text-sm max-w-md">
                                        Utiliza esta herramienta de modelado 3D para visualizar y marcar áreas afectadas en el cuerpo humano.
                                    </p>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <button
                                            onClick={() => navigate(`/app/crearimagen/${patient.id}/new`)}
                                            className="bg-[#00a63e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#008f36] transition-colors shadow-lg flex items-center gap-2"
                                        >
                                            <span>Crear imagen 3D</span>
                                            <ArrowLeft className="rotate-180" size={18} />
                                        </button >

                                        {snapshots.length > 0 && (
                                            <div className="flex flex-col gap-3 w-full mt-4">
                                                {snapshots.map((snap, idx) => {
                                                    const snapObs = allObservations.filter(o => o.snapshotId === snap.id);
                                                    return (
                                                        <div key={snap.id || idx} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 group hover:bg-white/[0.06] transition-all">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-[#00a63e]/10 text-[#00a63e] rounded-xl flex items-center justify-center border border-[#00a63e]/20 group-hover:scale-105 transition-transform">
                                                                        <ImageIcon size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-black text-white tracking-tight leading-none mb-1.5">
                                                                            {snapObs.length > 0
                                                                                ? Array.from(new Set(snapObs.map(o => translateLocation(o.location || o.organ)))).join(', ')
                                                                                : (snap.name || `Estudio 3D #${idx + 1}`)}
                                                                        </p>
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock size={8} className="text-[#00a63e]" />
                                                                            <span className="text-[9px] text-[#00a63e] font-black uppercase tracking-[0.1em]">
                                                                                {new Date(snap.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <button
                                                                        onClick={() => navigate(`/app/crearimagen/${patient.id}/${snap.id}`)}
                                                                        className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                                                        title="Explorar"
                                                                    >
                                                                        <Eye size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteSnapshotId(snap.id)}
                                                                        className="w-10 h-10 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {snapObs.length > 0 ? (
                                                                <div className="mt-4 overflow-hidden rounded-xl border border-white/5 bg-black/20">
                                                                    <table className="w-full text-left border-collapse">
                                                                        <thead>
                                                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                                                <th className="px-4 py-2 text-[8px] font-black text-white/40 uppercase tracking-widest">Hallazgo</th>
                                                                                <th className="px-4 py-2 text-[8px] font-black text-white/40 uppercase tracking-widest">Ubicación</th>
                                                                                <th className="px-4 py-2 text-[8px] font-black text-white/40 uppercase tracking-widest">Comentario</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {snapObs.map((o, oIdx) => {
                                                                                const Icon = markerIcons[o.markerType || 'marker'] || MapPin;
                                                                                return (
                                                                                    <tr key={oIdx} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] transition-colors">
                                                                                        <td className="px-4 py-2.5">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Icon size={12} className="text-[#00a63e]" />
                                                                                                <span className="text-[10px] font-bold text-white uppercase tracking-tight">{translateMarkerType(o.markerType || 'hallazgo')}</span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5">
                                                                                            <span className="text-[11px] text-white/70 font-medium">{translateLocation(o.location || o.organ)}</span>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5">
                                                                                            <p className="text-[10px] text-white/40 italic truncate max-w-[150px]" title={o.note}>
                                                                                                {o.note || '---'}
                                                                                            </p>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-white/20 italic text-center mt-2 px-4 py-2 bg-white/5 rounded-xl border border-dashed border-white/5">Sin hallazgos detallados</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div >
                            </div >

                            {/* Consultas de Seguimiento Section inside column */}
                            <div>
                                <h3 className="font-bold text-[#000000] flex items-center gap-2 text-lg mb-4">
                                    <Stethoscope className="text-[#00a63e]" /> Consultas de Seguimiento
                                </h3>
                                {patientConsults.length > 0 ? (
                                    <div className="space-y-3">
                                        {patientConsults.map(c => (
                                            <div key={c.id} className="bg-white p-5 rounded-xl border-2 border-black hover:border-[#00a63e] hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 group">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
                                                                {c.date}
                                                            </span>
                                                            <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                                                                <Clock size={14} /> {c.time}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[#000000] font-medium text-lg leading-tight">
                                                                {Object.keys(c.motives || {}).filter(k => c.motives[k]).join(', ') || c.otherMotive || (c as any).consultReason || 'Consulta de Seguimiento'}
                                                            </p>
                                                            <p className="text-gray-400 text-sm line-clamp-1">
                                                                {c.historyOfPresentIllness || 'Sin detalles adicionales...'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 self-end sm:self-center">
                                                        <button
                                                            onClick={() => navigate(`/app/consult/view/${patient.id}/${c.id}`, { state: { consult: c } })}
                                                            className="w-10 h-10 rounded-xl bg-white text-gray-500 border-2 border-black/10 hover:bg-[#000000] hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                            title="Ver Detalles"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/app/consult/edit/${patient.id}/${c.id}`)}
                                                            className="w-10 h-10 rounded-xl bg-white text-gray-500 border-2 border-black/10 hover:bg-[#00a63e] hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConsultId(c.id)}
                                                            className="w-10 h-10 rounded-xl bg-white text-red-400 border-2 border-black/10 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border-dashed border-2 border-black">
                                        <p className="text-gray-400">No hay consultas registradas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Appointments Section */}
            {appointments.filter(a => a.type === 'virtual' && (a.paymentStatus === 'paid' || a.paid)).length > 0 && (
                <div className="border-2 border-black rounded-xl shadow-xl p-6 mb-8 text-white overflow-hidden relative mx-8" style={{ backgroundColor: '#083c79' }}>
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
                                    <div key={apt.id} className="bg-white p-4 rounded-xl border border-2 border-black/10 shadow-none">
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
                                                            <span className="text-gray-400">Sala no iniciada</span>
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



            {/* TAB: Prescriptions Content */}
            {currentTab === 'prescriptions' && (
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="font-bold text-[#000000] flex items-center gap-3 text-2xl">
                            <div className="p-2 bg-gray-100 text-black rounded-xl">
                                <ClipboardList size={24} />
                            </div>
                            Historial de Recetas y Documentos
                        </h3>
                        <button
                            onClick={() => navigate(`/app/prescription/new/${patient.id}`)}
                            className="bg-[#000000] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#00a63e] transition shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            <Plus size={20} /> Crear +
                        </button>
                    </div>

                    {prescriptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prescriptions.map((p, idx) => {
                                const docType = Array.isArray(p.documentTypes)
                                    ? p.documentTypes.join(', ')
                                    : (Array.isArray(p.Tipo)
                                        ? p.Tipo.join(', ')
                                        : (p.documentTypes || p.Tipo || 'Recetario Médico'));
                                const displayDate = p.date ? new Date(p.date).toLocaleDateString() : 'N/A';

                                return (
                                    <div key={p.id || idx} className="bg-white border-2 border-2 border-black/10 border-2 border-black rounded-xl p-6 hover:border-[#000000] transition-all group shadow-none hover:shadow-xl relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white text-gray-400 group-hover:bg-white group-hover:text-[#000000] rounded-xl transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{displayDate}</span>
                                                <span className="text-[10px] text-gray-300 font-medium">#{p.legacyId || p.id?.slice(0, 8)}</span>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-[#000000] text-lg mb-2 line-clamp-1">{docType}</h4>

                                        <div className="space-y-4 mb-6">
                                            {(p.diagnostico || p.Diagnostico) && (
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Diagnóstico</p>
                                                    <p className="text-sm text-gray-700">{p.diagnostico || p.Diagnostico}</p>
                                                </div>
                                            )}
                                            {(p.procedimiento || p.Procedimiento) && (
                                                <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Procedimiento</p>
                                                    <p className="text-sm text-gray-700">{p.procedimiento || p.Procedimiento}</p>
                                                </div>
                                            )}
                                            {(p.indicaciones || p.Indicaciones) && (
                                                <div className="bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                                                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Indicaciones</p>
                                                    <p className="text-sm text-gray-700">{p.indicaciones || p.Indicaciones}</p>
                                                </div>
                                            )}
                                            {(p.prescriptionText || p.recetas || p.Recetas) && (
                                                <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
                                                    <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Recetario / Tratamiento</p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{p.prescriptionText || p.recetas || p.Recetas}</div>
                                                </div>
                                            )}
                                            {(p.Radio || p.radio) && (
                                                <div className="bg-purple-50/30 p-3 rounded-xl border border-purple-100/50">
                                                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">Estudios Radiológicos</p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{p.Radio || p.radio}</div>
                                                </div>
                                            )}
                                            {(p.Examen || p.examen) && (
                                                <div className="bg-cyan-50/30 p-3 rounded-xl border border-cyan-100/50">
                                                    <p className="text-[10px] font-bold text-cyan-600 uppercase mb-1">Examen de Laboratorio</p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{p.Examen || p.examen}</div>
                                                </div>
                                            )}
                                            {(p.constancia || p.Constancia) && (
                                                <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100/50">
                                                    <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Constancia Médica</p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{p.constancia || p.Constancia}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => navigate(`/app/prescriptions/${patient.id}/${p.legacyWixId || p.legacyId || p.id}`)}
                                                className="flex-1 py-3 rounded-xl bg-[#000000] text-white font-bold text-sm hover:bg-[#00a63e] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                                            >
                                                Ver
                                                <ExternalLink size={16} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/app/prescription/edit/${patient.id}/${p.id}`)}
                                                className="flex-1 py-3 rounded-xl bg-white text-black border-2 border-black font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Edit size={16} />
                                                Editar Orden
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setDeletePrescriptionId(p.id)}
                                            className="w-full py-2 rounded-xl text-red-500 font-bold text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                                        >
                                            <Trash2 size={14} /> Eliminar Registro
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-2 border-black/10">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <ClipboardList size={40} />
                            </div>
                            <h4 className="text-xl font-bold text-[#000000] mb-2">Sin recetas registradas</h4>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                No se encontraron documentos asociados a este paciente en el sistema actual o migrado.
                            </p>
                        </div>
                    )}
                </div>
            )}
            {
                currentTab === 'consents' && (
                    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar: List */}
                        <div className="lg:col-span-1 bg-white border-2 border-black rounded-xl shadow-none border border-2 border-black/10 overflow-hidden h-fit">
                            <div className="p-4 border-b border-2 border-black/10 bg-white/50">
                                <h3 className="font-bold text-[#000000] flex items-center gap-2">
                                    <FileText size={18} className="text-gray-400" /> Documentos Disponibles
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
                                            className={`w-full text-left p-4 hover:bg-white transition-colors flex items-start gap-3 group ${selectedConsent?.id === consent.id ? 'bg-white/50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className={`mt-0.5 ${selectedConsent?.id === consent.id ? 'text-[#00a63e]' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                {isSigned ? <CheckCircle size={18} className="text-green-500" /> : <Edit size={18} />}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${selectedConsent?.id === consent.id ? 'text-black' : 'text-gray-700'}`}>
                                                    {consent.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {isSigned ? `Firmado el ${new Date().toLocaleDateString()}` : 'Pendiente de firma'}
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
                                    <div className="bg-white border-2 border-black rounded-xl shadow-none border border-2 border-black/10 overflow-hidden">
                                        <div className="p-4 border-b border-2 border-black/10 flex justify-between items-center bg-white/50">
                                            <h3 className="font-bold text-[#000000] flex items-center gap-2">
                                                <Eye size={18} className="text-gray-400" /> Visualizando: {selectedConsent.title}
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
                                                    <h1 className="text-xl font-bold uppercase mb-1">República de Nicaragua</h1>
                                                    <h2 className="text-md font-bold text-gray-700 mb-2 underline">CONSENTIMIENTO INFORMADO ESPECIALIZADO EN UROLOGÍA</h2>
                                                    <h3 className="text-lg text-black font-semibold">{selectedConsent.title}</h3>
                                                </div>
                                                <div className="space-y-4 text-gray-800 text-sm leading-relaxed text-justify">
                                                    <p>
                                                        En la ciudad de Managua, Nicaragua, yo, <strong>{patient.firstName} {patient.lastName}</strong>, en pleno uso de mis facultades, declaro que el especialista en Urología ha explicado de forma clara y comprensible la naturaleza de mi condición urológica y el procedimiento propuesto.
                                                    </p>
                                                    <p>
                                                        He sido informado sobre los riesgos específicos asociados a la intervención urológica, las posibles complicaciones y las alternativas de tratamiento disponibles en el país. Entiendo que la medicina no es una ciencia exacta y que no se pueden garantizar resultados específicos.
                                                    </p>
                                                    <p>
                                                        Asimismo, autorizo el tratamiento de mis datos personales de salud conforme a la <strong>Ley No. 787, Ley de Protección de Datos Personales</strong> de la República de Nicaragua, para los fines estrictamente médicos y legales de mi expediente clínico.
                                                    </p>
                                                    <p className="mt-8 font-bold border-l-4 border-blue-600 pl-4 bg-white py-2">
                                                        Mediante mi firma digital, expreso mi consentimiento libre, previo, expreso e informado para la realización de dicho acto médico.
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
                                        <div className="bg-white border-2 border-black rounded-xl shadow-none border border-2 border-black/10 overflow-hidden animate-in slide-in-from-bottom-4">
                                            <div className="p-4 border-b border-2 border-black/10 bg-white/30">
                                                <h3 className="font-bold text-[#000000] flex items-center gap-2">
                                                    <PenTool size={18} className="text-[#00a63e]" /> Panel de Firma
                                                </h3>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-sm text-gray-400 mb-4">
                                                    Firme dentro del recuadro punteado usando su mouse o pantalla táctil.
                                                </p>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-400 transition-colors cursor-crosshair relative">
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
                                                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
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
                                <div className="bg-white border-2 border-black rounded-xl shadow-none border border-2 border-black/10 p-12 text-center h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                                    <div className="p-6 bg-white rounded-full mb-4">
                                        <FileText size={48} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-500 mb-2">Seleccione un documento</h3>
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
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-2 border-black/10 p-6 flex justify-between items-center z-10">
                                <h2 className="text-xl font-bold text-[#000000] flex items-center gap-2">
                                    <ClipboardList className="text-[#000000]" /> Recetas y Órdenes
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
                                            <div className="text-center py-10 text-gray-400">
                                                <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
                                                <div className="bg-white p-4 rounded-xl border border-2 border-black/10">
                                                    <h3 className="font-bold text-[#000000] mb-2 text-sm uppercase tracking-wide">Notas de Receta</h3>
                                                    <p className="whitespace-pre-wrap text-gray-700 text-sm">{legacyText}</p>
                                                </div>
                                            )}

                                            {/* Structured Prescriptions */}
                                            {linkedPrescriptions.map((p, idx) => (
                                                <div key={p.id || idx} className="border border-2 border-black/10 rounded-xl overflow-hidden">
                                                    <div className="bg-white px-4 py-2 border-b border-2 border-black/10 flex justify-between items-center">
                                                        <span className="font-bold text-gray-700 text-sm">Documento #{idx + 1}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString()}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setShowPrescriptionsModal(false);
                                                                    navigate(`/app/prescriptions/${patient.id}/${p.legacyWixId || p.legacyId || p.id}`);
                                                                }}
                                                                className="p-1 hover:bg-white rounded text-[#00a63e] transition-colors"
                                                                title="Ver Documento Completo"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        {p.medications && (
                                                            <div>
                                                                <h4 className="font-semibold text-[#000000] text-sm mb-1">Medicamentos:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-500 text-sm bg-white p-3 rounded-xl">{p.medications}</p>
                                                            </div>
                                                        )}
                                                        {p.labs && (
                                                            <div>
                                                                <h4 className="font-semibold text-[#000000] text-sm mb-1">Exámenes:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-500 text-sm bg-white p-3 rounded-xl">{p.labs}</p>
                                                            </div>
                                                        )}
                                                        {p.imaging && (
                                                            <div>
                                                                <h4 className="font-semibold text-[#000000] text-sm mb-1">Radiología:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-500 text-sm bg-white p-3 rounded-xl">{p.imaging}</p>
                                                            </div>
                                                        )}
                                                        {p.indications && (
                                                            <div>
                                                                <h4 className="font-semibold text-[#000000] text-sm mb-1">Indicaciones:</h4>
                                                                <p className="whitespace-pre-wrap text-gray-500 text-sm bg-white p-3 rounded-xl">{p.indications}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="p-4 border-t border-2 border-black/10 bg-white flex justify-end">
                                <button
                                    onClick={() => setShowPrescriptionsModal(false)}
                                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white transition-colors"
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
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-2 border-black/10 p-6 flex justify-between items-center z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 border-2 border-black rounded-xl flex items-center justify-center text-indigo-600">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#000000]">Análisis IA</h2>
                                        <p className="text-sm text-gray-400">Asistente Clínico Inteligente</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-500">
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
                                        <h3 className="text-xl font-bold text-[#000000] mb-2">Analizando Historia Clínica...</h3>
                                        <p className="text-gray-400 max-w-md mx-auto">
                                            Nuestra IA está procesando los antecedentes, consultas y signos vitales del paciente para generar insights médicos.
                                        </p>
                                    </div>
                                ) : aiResult ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Disclaimer */}
                                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 leading-tight">
                                                <strong>Aviso Médico:</strong> Este análisis es generado por Inteligencia Artificial basado en los registros cargados.
                                                Debe ser validado por un profesional de la salud antes de tomar decisiones clínicas. No reemplaza el juicio del médico tratante.
                                            </p>
                                        </div>

                                        {/* Summary Card */}
                                        <div className="bg-gradient-to-br from-[#00a63e]/5 to-white p-6 border-2 border-black rounded-xl shadow-none relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 text-[#00a63e]/10">
                                                <Brain size={80} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                                <ClipboardList size={24} className="text-[#00a63e]" />
                                                Análisis Médico Detallado
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed text-lg relative z-10">
                                                {aiResult.summary}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Risks Card */}
                                            <div className="bg-white p-6 border-2 border-black rounded-xl hover:shadow-lg transition-shadow">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                                        <AlertTriangle size={22} className="text-red-500" />
                                                        Puntos de Alerta
                                                    </h3>
                                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Prioridad</span>
                                                </div>
                                                <ul className="space-y-4">
                                                    {aiResult.risks?.map((risk: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-gray-700">
                                                            <div className="w-6 h-6 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                                                            <span className="text-sm leading-snug">{risk}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Recommendations Card */}
                                            <div className="bg-white p-6 border-2 border-black rounded-xl hover:shadow-lg transition-shadow">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold text-[#00a63e] flex items-center gap-2">
                                                        <Lightbulb size={22} className="text-[#00a63e]" />
                                                        Plan Sugerido
                                                    </h3>
                                                    <span className="bg-[#00a63e]/10 text-[#00a63e] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Acción</span>
                                                </div>
                                                <ul className="space-y-4">
                                                    {aiResult.recommendations?.map((rec: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-gray-700">
                                                            <div className="w-6 h-6 bg-green-50 text-[#00a63e] rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                                                                <CheckCircle size={14} />
                                                            </div>
                                                            <span className="text-sm leading-snug font-medium">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-6 border-t border-black/5">
                                            <button
                                                onClick={() => window.print()}
                                                className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm"
                                            >
                                                <ImageIcon size={18} /> Imprimir Reporte AI
                                            </button>
                                            <button
                                                onClick={() => setShowAIModal(false)}
                                                className="bg-[#000000] text-white px-10 py-3.5 rounded-xl font-bold hover:bg-[#00a63e] transition shadow-xl hover:-translate-y-0.5"
                                            >
                                                Entendido, Cerrar
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
                        <div className="bg-white border-2 border-black rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-2 border-black/10 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-[#000000]">Editar Información del Paciente</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
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
                                                className="w-4 h-4 text-[#00a63e]"
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
                                                className="w-4 h-4 text-[#00a63e]"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Recetario</span>
                                        </label>
                                    </div>
                                </InputGroup>
                            </div>
                            <div className="p-6 border-t border-2 border-black/10 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
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
                        <div className="bg-red-600 p-6 border-2 border-black rounded-xl shadow-2xl max-w-sm w-full border border-red-500 animate-in zoom-in-95 duration-200">
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
                                    className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold transition-all shadow-md hover:bg-gray-100 hover:shadow-lg hover:scale-105 border-b-4 border-2 border-black/10 hover:border-gray-300"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Delete Prescription Confirmation Modal */}
            {
                deletePrescriptionId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white p-8 border-4 border-black rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-black font-extrabold text-2xl mb-4 text-center leading-tight">
                                ¿Eliminar Registro?
                            </h3>
                            <p className="text-gray-500 text-center text-sm mb-8">
                                Esta acción es permanente y eliminará el documento de la base de datos completamente.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletePrescriptionId(null)}
                                    className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.deletePrescription(patient.id, deletePrescriptionId);
                                            setPrescriptions(prev => prev.filter(p => p.id !== deletePrescriptionId));
                                            setDeletePrescriptionId(null);
                                        } catch (e) {
                                            alert('Error al eliminar');
                                            console.error(e);
                                        }
                                    }}
                                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:bg-red-700 active:scale-95"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Delete History Confirmation Modal */}
            {deleteHistoryId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-red-600 p-8 border-4 border-black rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-white font-extrabold text-2xl mb-4 text-center leading-tight">
                            ¿Eliminar Historia Clínica?
                        </h3>
                        <p className="text-white/80 text-center text-sm mb-8">
                            Esta acción es permanente. No se podrá recuperar la información y se eliminará de la base de datos completamente.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteHistoryId(null)}
                                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:bg-white/20 border border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (!patient) return;
                                    try {
                                        await api.deleteHistory(patient.id, deleteHistoryId);
                                        setDeletedHistoryIds(prev => new Set(prev).add(deleteHistoryId));
                                        setLocalHistories(prev => prev.filter(h => h.id !== deleteHistoryId));
                                        setDeleteHistoryId(null);
                                    } catch (e) {
                                        alert('Error al eliminar la historia clínica');
                                        console.error(e);
                                    }
                                }}
                                className="flex-1 bg-white text-red-600 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:bg-gray-100 active:scale-95"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Consult Confirmation Modal */}
            {deleteConsultId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-red-600 p-8 border-4 border-black rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-white font-extrabold text-2xl mb-4 text-center leading-tight">
                            ¿Eliminar Consulta?
                        </h3>
                        <p className="text-white/80 text-center text-sm mb-8">
                            Esta acción es permanente. No se podrá recuperar la información de la consulta de seguimiento.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConsultId(null)}
                                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:bg-white/20 border border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (!patient) return;
                                    try {
                                        await api.deleteConsult(patient.id, deleteConsultId);
                                        setDeletedConsultIds(prev => new Set(prev).add(deleteConsultId));
                                        setLocalConsults(prev => prev.filter(c => c.id !== deleteConsultId));
                                        setDeleteConsultId(null);
                                    } catch (e) {
                                        alert('Error al eliminar la consulta');
                                        console.error(e);
                                    }
                                }}
                                className="flex-1 bg-white text-red-600 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:bg-gray-100 active:scale-95"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

