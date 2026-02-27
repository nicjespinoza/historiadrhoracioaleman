import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, LogOut, User, MessageCircle, X, CheckCircle2, Video, Save, Briefcase, MapPin } from 'lucide-react';
import { api } from '../../api';
import { GlassCard } from '../components/premium-ui/GlassCard';
import { ActionPill } from '../components/premium-ui/ActionPill';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChatInterface } from '../components/premium-ui/ChatInterface';
import { PaymentModal } from '../components/premium-ui/PaymentModal';
import { JitsiMeetModal } from '../components/premium-ui/JitsiMeetModal';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { calculateAge } from '../lib/helpers';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { InputGroup } from '../components/ui/InputGroup';
import { useAuth } from '../context/AuthContext';

export const PatientDashboardScreen = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [searchParams] = useSearchParams();
    const [patient, setPatient] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [consults, setConsults] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Video Consultation State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoAppointment, setVideoAppointment] = useState<any>(null);

    // Profile Completion State
    const [showProfileCompletion, setShowProfileCompletion] = useState(false);
    const [profileForm, setProfileForm] = useState({
        birthDate: '',
        sex: 'Masculino',
        profession: '',
        address: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        const storedPatient = localStorage.getItem('currentPatient');
        if (storedPatient) {
            const p = JSON.parse(storedPatient);
            setPatient(p);

            // Check if profile is complete (using ageDetails as proxy for birthDate/complete profile)
            if (!p.ageDetails || !p.birthDate) {
                setShowProfileCompletion(true);
                // Pre-fill form if data exists partially
                setProfileForm({
                    birthDate: p.birthDate || '',
                    sex: p.sex || 'Masculino',
                    profession: p.profession || '',
                    address: p.address || ''
                });
            } else {
                // Only load dashboard data if profile is complete
                api.getAppointments().then(all => {
                    setAppointments(all.filter((a: any) => a.patientId === p.id));
                });

                api.getConsults(p.id).then(setConsults);

                // Check history
                api.getHistories(p.id).then(histories => {
                    if (histories.length === 0) {
                        // Redirect to history form if not completed
                        navigate('/app/patient/history');
                    }
                });

                // Check chat status
                api.getPatientStatus(p.id).then(status => {
                    setCanChat(status.canChat);
                });
            }
        } else {
            navigate('/app/patient/login');
        }

        // Check for payment success
        if (searchParams.get('payment') === 'success') {
            setShowSuccessModal(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Refresh status
            if (patient) {
                api.getPatientStatus(patient.id).then(status => setCanChat(status.canChat));
            }
        }
    }, [navigate, searchParams]);

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('currentPatient');
            navigate('/app/patient/login');
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    const handleSaveProfile = async () => {
        if (!profileForm.birthDate || !profileForm.sex || !profileForm.profession || !profileForm.address) {
            alert("Por favor complete todos los campos");
            return;
        }

        setIsSavingProfile(true);
        try {
            const ageDetails = calculateAge(profileForm.birthDate);
            const updatedData = {
                ...profileForm,
                ageDetails
            };

            await api.updatePatient(patient.id, updatedData as any);

            // Update local storage
            const updatedPatient = { ...patient, ...updatedData };
            localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
            setPatient(updatedPatient);

            // Redirect to history
            navigate('/app/patient/history');
        } catch (e) {
            console.error(e);
            alert("Error al guardar perfil");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChatClick = () => {
        if (canChat) {
            setIsChatOpen(true);
        } else {
            setShowPremiumModal(true);
        }
    };

    const handlePayClick = (apt: any) => {
        setSelectedAppointment(apt);
        setShowPaymentModal(true);
    };

    const handleVideoConsultClick = (apt: any) => {
        setVideoAppointment(apt);
        setShowVideoModal(true);
    };

    const handlePremiumAction = () => {
        // Redirect to login or show upgrade modal
        setShowPremiumModal(false);
    };

    // Parse appointment date - handles ISO strings, timestamps, or DD/MM/YYYY
    const parseAppointmentDate = (date: string | number, time?: string): Date | null => {
        try {
            // Try parsing as ISO string or timestamp first
            let aptDate = new Date(date);

            // If invalid, try DD/MM/YYYY format
            if (isNaN(aptDate.getTime()) && typeof date === 'string') {
                const parts = date.split('/');
                if (parts.length === 3) {
                    const [day, month, year] = parts.map(Number);
                    aptDate = new Date(year, month - 1, day);
                }
            }

            // Add time if provided and valid
            if (time && !isNaN(aptDate.getTime())) {
                const timeParts = time.split(':').map(Number);
                if (timeParts.length >= 2) {
                    aptDate.setHours(timeParts[0], timeParts[1], 0, 0);
                }
            }

            return isNaN(aptDate.getTime()) ? null : aptDate;
        } catch {
            return null;
        }
    };

    // Check if appointment is within 5 minutes of start time
    const isWithin5Minutes = (date: string | number, time: string): boolean => {
        const appointmentDate = parseAppointmentDate(date, time);
        if (!appointmentDate) return false;

        const now = new Date();
        const diffMs = appointmentDate.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes <= 5 && diffMinutes >= -60;
    };

    // Alias for backward compatibility
    const isWithin10Minutes = isWithin5Minutes;

    // Get countdown to appointment
    const getCountdown = (date: string | number, time: string): { days: number; hours: number; minutes: number; isPast: boolean } => {
        const appointmentDate = parseAppointmentDate(date, time);
        if (!appointmentDate) {
            return { days: 0, hours: 0, minutes: 0, isPast: true };
        }

        const now = new Date();
        const diffMs = appointmentDate.getTime() - now.getTime();

        if (diffMs < 0) {
            return { days: 0, hours: 0, minutes: 0, isPast: true };
        }

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const d = Math.floor(totalMinutes / (60 * 24));
        const h = Math.floor((totalMinutes % (60 * 24)) / 60);
        const m = totalMinutes % 60;

        return { days: d, hours: h, minutes: m, isPast: false };
    };


    // Find the next pending appointment to pay for premium modal
    const handlePremiumPay = () => {
        setShowPremiumModal(false);
        const pendingApt = appointments.find(a => a.paymentStatus !== 'paid');
        if (pendingApt) {
            setSelectedAppointment(pendingApt);
            setShowPaymentModal(true);
        } else {
            alert("Por favor agenda una cita primero.");
        }
    };

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Profile Completion View
    if (showProfileCompletion) {
        const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all";

        return (
            <div className="min-h-screen bg-[#083c79] p-4 font-sans flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Complete su Perfil</h2>
                            <p className="text-gray-500">Necesitamos algunos datos adicionales para su expediente.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Birth Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        required
                                        className={inputClass}
                                        value={profileForm.birthDate}
                                        onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Age (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Edad Calculada</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        readOnly
                                        className={`${inputClass} bg-gray-50 text-gray-500`}
                                        value={calculateAge(profileForm.birthDate)}
                                        placeholder="Automático"
                                    />
                                </div>
                            </div>

                            {/* Sex */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        className={inputClass}
                                        value={profileForm.sex}
                                        onChange={e => setProfileForm({ ...profileForm, sex: e.target.value })}
                                    >
                                        <option>Masculino</option>
                                        <option>Femenino</option>
                                    </select>
                                </div>
                            </div>

                            {/* Profession */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profesión/Ocupación</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        value={profileForm.profession}
                                        onChange={e => setProfileForm({ ...profileForm, profession: e.target.value })}
                                        placeholder="Ej. Ingeniero, Estudiante..."
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <textarea
                                        rows={3}
                                        required
                                        className={inputClass}
                                        value={profileForm.address}
                                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                        placeholder="Dirección completa"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 mt-6 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSavingProfile ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Guardar y Continuar <Save size={20} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans relative overflow-hidden" style={{ backgroundColor: '#083c79' }}>
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[25%] bg-secondary/20 rounded-full blur-[80px]" />

            <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-tr from-primary to-blue-600 p-2.5 rounded-xl shadow-lg shadow-primary/20">
                            <User className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Hola, {patient.firstName}</h1>
                            <p className="text-xs text-gray-500 font-medium">Portal del Paciente</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all duration-300 border border-red-100 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10">
                {/* Appointments Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Calendar className="text-white" /> Próximas Citas
                        </h2>
                        {appointments.length > 0 && (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                {appointments.length} {appointments.length === 1 ? 'Cita' : 'Citas'}
                            </span>
                        )}
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16 text-gray-500 flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                                <Calendar size={40} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No tienes citas programadas</h3>
                            <p className="max-w-xs mx-auto mb-8 text-gray-500">
                                Agenda tu próxima revisión para mantener tu salud al día.
                            </p>
                            <a
                                href="https://wa.me/50587893709?text=Hola%20acabo%20de%20completar%20mi%20historia%20cl%C3%ADnica%20quisiera%20agendar%20cita"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-[#128C7E] transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
                            >
                                <MessageCircle size={20} /> Agendar mi primera revisión
                            </a>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                            {appointments
                                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                                .map((apt, index) => {
                                    const isNext = index === 0;
                                    const isPaid = apt.paymentStatus === 'paid';

                                    return (
                                        <div
                                            key={apt.id}
                                            className={`
                                                relative overflow-hidden transition-all duration-300 hover:shadow-xl !p-4 bg-white rounded-xl border border-gray-100 shadow-sm
                                                ${isNext ? 'md:col-span-1 border-blue-100' : 'hover:scale-[1.02]'}
                                                ${isPaid && searchParams.get('payment') === 'success' ? 'ring-4 ring-green-400 ring-offset-2' : ''}
                                            `}
                                        >
                                            {/* Decorative Background for Next Appointment */}
                                            {isNext && (
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                            )}

                                            {isPaid && (
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl z-10 shadow-sm">
                                                    PAGADO
                                                </div>
                                            )}

                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${apt.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${apt.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                        {apt.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                                                    </div>
                                                    {isNext && (
                                                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                            PRÓXIMA
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: '#083c79' }}>
                                                            <Calendar size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Fecha</p>
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: '#083c79' }}>
                                                            <Clock size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Hora</p>
                                                            <span className="text-gray-700 font-bold text-sm">{apt.time}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-lg border border-gray-100 mb-3" style={{ backgroundColor: '#083c79' }}>
                                                    <p className="text-[10px] text-white/70 font-bold uppercase">MOTIVO</p>
                                                    <p className="text-white text-xs leading-relaxed line-clamp-2 font-medium">
                                                        {apt.reason}
                                                    </p>
                                                </div>

                                                <div className="mt-auto space-y-3">
                                                    {apt.status === 'pending' && (
                                                        <a
                                                            href={`https://wa.me/50589776879?text=Hola, confirmo mi cita para el ${apt.date} a las ${apt.time}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-full text-center bg-[#25D366] text-white py-3.5 rounded-xl font-bold hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            <MessageCircle size={18} /> Confirmar por WhatsApp
                                                        </a>
                                                    )}

                                                    {/* Video Call Button - Jitsi Integration */}
                                                    {apt.type === 'virtual' && isPaid && (() => {
                                                        const countdown = getCountdown(apt.date, apt.time);
                                                        const canJoin = apt.videoRoomActive && isWithin5Minutes(apt.date, apt.time);

                                                        return (
                                                            <div className="space-y-2">
                                                                {/* Countdown Timer - Compact */}
                                                                {!countdown.isPast && (
                                                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-100">
                                                                        <p className="text-[10px] text-purple-600 font-bold uppercase mb-1">⏱️ Tiempo para tu consulta</p>
                                                                        <div className="flex justify-center gap-2">
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-purple-700">{countdown.days}</div>
                                                                                <div className="text-[8px] text-purple-500 uppercase">Días</div>
                                                                            </div>
                                                                            <div className="text-purple-300 text-lg">:</div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-purple-700">{countdown.hours}</div>
                                                                                <div className="text-[8px] text-purple-500 uppercase">Hrs</div>
                                                                            </div>
                                                                            <div className="text-purple-300 text-lg">:</div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-purple-700">{countdown.minutes}</div>
                                                                                <div className="text-[8px] text-purple-500 uppercase">Min</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Join Button - Professional Disabled State */}
                                                                {canJoin ? (
                                                                    <button
                                                                        onClick={() => handleVideoConsultClick(apt)}
                                                                        className="w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 animate-pulse"
                                                                    >
                                                                        <Video size={16} />
                                                                        <span>🟢 Unirse Ahora</span>
                                                                    </button>
                                                                ) : (
                                                                    <div>
                                                                        <button
                                                                            disabled
                                                                            className="w-full text-center bg-gradient-to-r from-gray-300 to-gray-400 text-white py-2.5 rounded-lg font-bold text-sm cursor-not-allowed opacity-70 flex items-center justify-center gap-2"
                                                                        >
                                                                            <Video size={16} />
                                                                            <span>Video Consulta</span>
                                                                        </button>
                                                                        <p className="text-center text-[10px] text-gray-500 mt-1">
                                                                            {apt.videoRoomActive
                                                                                ? '⏳ Se habilitará 5 min antes'
                                                                                : '⏳ Esperando al doctor...'}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Presencial Appointment Info */}
                                                    {apt.type === 'presencial' && isPaid && (() => {
                                                        const countdown = getCountdown(apt.date, apt.time);

                                                        return (
                                                            <div className="space-y-2">
                                                                {/* Countdown Timer - Compact */}
                                                                {!countdown.isPast && (
                                                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                                                                        <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">⏱️ Tiempo para tu consulta</p>
                                                                        <div className="flex justify-center gap-2">
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-blue-700">{countdown.days}</div>
                                                                                <div className="text-[8px] text-blue-500 uppercase">Días</div>
                                                                            </div>
                                                                            <div className="text-blue-300 text-lg">:</div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-blue-700">{countdown.hours}</div>
                                                                                <div className="text-[8px] text-blue-500 uppercase">Hrs</div>
                                                                            </div>
                                                                            <div className="text-blue-300 text-lg">:</div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-blue-700">{countdown.minutes}</div>
                                                                                <div className="text-[8px] text-blue-500 uppercase">Min</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Hospital Address - Compact */}
                                                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-200">
                                                                    <p className="text-[10px] text-amber-700 font-bold uppercase mb-1 flex items-center gap-1">
                                                                        <MapPin size={10} /> Dirección
                                                                    </p>
                                                                    <p className="text-xs text-amber-900 font-bold">Hospital Vivian Pellas</p>
                                                                    <p className="text-[10px] text-amber-800">Torre 1, 2do Piso, Consultorio 208</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {!isPaid && (
                                                        <button
                                                            onClick={() => handlePayClick(apt)}
                                                            className="block w-full text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            <span>Pagar Consulta</span>
                                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">C$ 1,200</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </section>

                {/* History Section */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                        <FileText className="text-white" /> Historial de Consultas
                    </h2>

                    {consults.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>Aún no hay consultas registradas.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Motivo</th>
                                        <th className="px-6 py-4">Diagnóstico</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {consults.map(c => (
                                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{c.date}</td>
                                            <td className="px-6 py-4">{Object.keys(c.motives || {}).filter(k => c.motives[k]).join(', ') || c.otherMotive}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                                    {c.diagnosis}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* Chat FAB */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleChatClick}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold ${canChat
                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {canChat ? <MessageCircle size={24} /> : <div className="relative"><MessageCircle size={24} /><div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white"></div></div>}
                    <span className="hidden md:inline">{canChat ? 'Chat con el Médico' : 'Chat Bloqueado'}</span>
                </button>
            </div>

            {/* Premium Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                    <MessageCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Servicio Premium Bloqueado</h3>
                                <p className="text-gray-600">
                                    Para chatear con el Dr. en tiempo real y enviar imágenes, por favor agenda y abona tu consulta.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePremiumAction}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                                >
                                    Ir a Pagar / Agendar
                                </button>
                                <button
                                    onClick={() => setShowPremiumModal(false)}
                                    className="w-full py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h3>
                            <p className="text-gray-600 mb-6">
                                Tu consulta ha sido confirmada y el chat con el médico ha sido activado.
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            {
                selectedAppointment && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        appointment={selectedAppointment}
                        patientId={patient.id}
                    />
                )
            }

            {/* Chat Modal/Overlay */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="w-full md:w-auto h-[90vh] md:h-auto"
                        >
                            <div className="relative">
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="absolute -top-12 right-0 text-white hover:text-gray-200 md:hidden"
                                >
                                    <X size={32} />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsChatOpen(false)}
                                        className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-700 hidden md:block"
                                    >
                                        <X size={20} />
                                    </button>
                                    <ChatInterface
                                        patientId={patient.id}
                                        chatRoomId={patient.id} // Using patientId as room ID for 1-to-1
                                        isPremium={canChat}
                                        currentUserId={patient.id}
                                        userName={patient.firstName}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Consultation Modal - Jitsi Integration */}
            {videoAppointment && (
                <JitsiMeetModal
                    isOpen={showVideoModal}
                    onClose={() => {
                        setShowVideoModal(false);
                        setVideoAppointment(null);
                    }}
                    roomName={`consulta-${videoAppointment.id}`}
                    displayName={patient.firstName}
                    appointmentId={videoAppointment.id}
                />
            )}
        </div >
    );
};
// End of file
