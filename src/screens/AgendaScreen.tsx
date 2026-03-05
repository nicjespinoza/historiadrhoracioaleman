import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X, Trash2, Edit2, MapPin, Globe, LogOut } from 'lucide-react';
import { api } from '../../api';
import { Patient, Appointment } from '../types';
import { GlassCard } from '../components/premium-ui/GlassCard';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../components/premium-ui/FloatingLabelSelect';

interface AgendaScreenProps {
    patients?: Patient[];
}

export const AgendaScreen = ({ patients: propPatients = [] }: AgendaScreenProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [localPatients, setLocalPatients] = useState<Patient[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);

    // Merge prop patients with fetched patients
    const patients = propPatients.length > 0 ? propPatients : localPatients;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Check Google Connection
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            let isGC = false;
            if (auth.currentUser) {
                const docSnap = await api.getUser(auth.currentUser.uid);
                isGC = !!docSnap?.googleCalendarConnected;
                setIsGoogleConnected(isGC);
            }

            // Load local appointments
            const apps = await api.getAppointments();
            const mappedApps = apps.map((a, i) => ({
                ...a,
                confirmed: a.confirmed ?? (i % 2 === 0),
                uniqueId: a.uniqueId || `CITA-${1000 + i}`
            }));

            // Load GC events if connected
            let allApps = [...mappedApps];
            if (isGC) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const timeMin = `${year}-${month}-01T00:00:00Z`;
                const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();
                const timeMax = `${year}-${month}-${lastDay}T23:59:59Z`;

                const gcEvents = await api.getGoogleCalendarEvents(timeMin, timeMax);
                allApps = [...allApps, ...gcEvents];
            }

            setAppointments(allApps);

            // Load patients if not provided via props
            if (propPatients.length === 0) {
                const result = await api.getPatients({ limitCount: 200 });
                setLocalPatients(result.patients);
            }
        } catch (error) {
            console.error("Error loading agenda data:", error);
        }
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    const getAppointmentsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return appointments.filter(a => a.date === dateStr);
    };

    // Upcoming List Logic
    const upcomingAppointments = appointments
        .filter(a => new Date(a.date + 'T' + a.time) >= new Date())
        .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

    // Edit Modal State
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleEditAppointment = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const apt = appointments.find(a => a.id === id);
        if (apt) {
            setEditingAppointment(apt);
        }
    };

    const handleUpdateAppointment = async () => {
        if (!editingAppointment) return;
        setIsSaving(true);
        try {
            await api.updateAppointment(editingAppointment.id, {
                date: editingAppointment.date,
                time: editingAppointment.time,
                type: editingAppointment.type,
                reason: editingAppointment.reason
            });
            setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? editingAppointment : a));
            setEditingAppointment(null);
            alert('Cita actualizada con éxito');
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert("Error al actualizar la cita");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAppointment = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Está seguro de eliminar esta cita permanentemente?')) {
            try {
                await api.deleteAppointment(id);
                setAppointments(prev => prev.filter(a => a.id !== id));
            } catch (error: any) {
                console.error("Error deleting appointment:", error);
                if (error.code === 'permission-denied') {
                    alert("Error: Permisos insuficientes para eliminar. Verifique las reglas de seguridad de Firebase.");
                } else {
                    alert("Error al eliminar la cita: " + error.message);
                }
            }
        }
    };

    // Modal Logic
    const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[] | null>(null);

    const handleDayClick = (dayApts: Appointment[]) => {
        const sorted = [...dayApts].sort((a, b) => a.time.localeCompare(b.time));
        setSelectedDayAppointments(sorted);
    };

    return (
        <div className="min-h-screen font-sans bg-[#083c79]">
            <div className="p-4 md:p-8 w-full max-w-[95%] mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="text-white" /> Agenda Médica
                        </h2>
                        <p className="text-blue-100">Vista general de citas y disponibilidad</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                await api.connectGoogleCalendar();
                                loadData();
                            }}
                            className={`${isGoogleConnected ? 'bg-green-50 text-green-700' : 'bg-white text-[#083c79]'} px-6 py-3 rounded-xl font-bold hover:brightness-105 transition shadow-xl flex items-center gap-2`}
                        >
                            {isGoogleConnected ? (
                                <>
                                    <CheckCircle size={20} /> Google Calendar Conectado
                                </>
                            ) : (
                                <>
                                    <Globe size={20} /> Conectar Google Calendar
                                </>
                            )}
                        </button>
                        {isGoogleConnected && (
                            <button
                                onClick={async () => {
                                    await api.disconnectGoogleCalendar();
                                    loadData();
                                }}
                                title="Cerrar sesión de Google Calendar"
                                className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 transition border border-white/20"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar - White Background, Black Lines */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                            {/* Calendar Header */}
                            <div className="p-6 flex justify-between items-center border-b-2 border-black bg-white">
                                <h3 className="text-xl font-bold text-black capitalize">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"><ChevronLeft size={20} /></button>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 text-center border-b-2 border-black bg-gray-50">
                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                                    <div key={d} className="py-3 text-sm font-black text-black uppercase tracking-wider">{d}</div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 auto-rows-fr bg-white">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[140px] border-b-2 border-r-2 border-black bg-white" />
                                ))}
                                {Array.from({ length: days }).map((_, i) => {
                                    const day = i + 1;
                                    const dayApts = getAppointmentsForDay(day);
                                    const hasMany = dayApts.length > 2;
                                    const isCurrentDay = isToday(day);

                                    return (
                                        <div key={day} className={`min-h-[140px] p-2 border-b-2 border-r-2 border-black relative group transition-colors hover:bg-gray-50 ${isCurrentDay ? 'bg-blue-50' : 'bg-white'}`}>
                                            <span className={`text-sm font-bold mb-2 block w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-[#083c79] text-white' : 'text-black'}`}>
                                                {day}
                                            </span>

                                            <div className="space-y-1.5">
                                                {!hasMany ? (
                                                    dayApts.map(apt => {
                                                        const patient = patients.find(p => p.id === apt.patientId);
                                                        return (
                                                            <div
                                                                key={apt.id}
                                                                onClick={() => setSelectedDayAppointments(dayApts)}
                                                                className={`text-[10px] p-1.5 rounded-md shadow-sm hover:brightness-110 transition-all cursor-pointer border-none ${(apt as any).isExternal ? 'bg-orange-500 text-white' : 'bg-[#083c79] text-white'}`}
                                                            >
                                                                <div className="pl-1">
                                                                    <div className="flex justify-between items-center mb-0.5">
                                                                        <span className="font-bold">{apt.time}</span>
                                                                        {(apt as any).isExternal && <Globe size={10} />}
                                                                    </div>
                                                                    <div className="font-medium truncate opacity-90">
                                                                        {(apt as any).isExternal ? apt.reason : (patient ? `${patient.firstName} ${patient.lastName}` : 'Desconocido')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <button
                                                        onClick={() => handleDayClick(dayApts)}
                                                        className="w-full text-center py-2 bg-[#083c79]/10 text-[#083c79] text-xs font-bold rounded-md hover:bg-[#083c79]/20 transition-colors border border-[#083c79]/20"
                                                    >
                                                        Ver {dayApts.length} Citas
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Appointments List - Side Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="text-white" />
                            <h3 className="text-xl font-bold text-white">Próximas Citas</h3>
                        </div>

                        <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map(apt => {
                                    const patient = patients.find(p => p.id === apt.patientId);
                                    return (
                                        <div key={apt.id} className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-[#083c79] hover:translate-x-1 transition-transform duration-200 cursor-pointer group">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="text-[#083c79] w-4 h-4" />
                                                    <span className="text-xs font-bold text-[#083c79]">
                                                        {new Date(apt.date + 'T12:00:00').toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${apt.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {apt.confirmed ? 'CONF' : 'PEND'}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight truncate">
                                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente Desconocido'}
                                            </h4>

                                            <div className="flex items-start gap-2 mb-2">
                                                <div className="min-w-[4px] h-full rounded-full bg-gray-200"></div>
                                                <p className="text-xs text-gray-600 line-clamp-2 italic">{apt.reason}</p>
                                            </div>

                                            <div className="flex justify-between items-center text-xs font-bold text-[#083c79] border-t border-[#083c79]/10 pt-2 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {apt.time}
                                                </div>

                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => handleEditAppointment(apt.id, e)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={(e) => handleDeleteAppointment(apt.id, e)} className="text-red-600 hover:text-red-800" title="Eliminar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <CheckCircle className="w-12 h-12 text-white/50 mx-auto mb-3" />
                                    <p className="text-white font-medium text-sm">No hay citas próximas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Day Details Modal */}
                {selectedDayAppointments && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <GlassCard className="w-full max-w-lg p-0 overflow-hidden shadow-2xl">
                            <div className="bg-[#083c79] p-6 flex justify-between items-center text-white">
                                <h3 className="text-xl font-bold">Citas del Día</h3>
                                <button onClick={() => setSelectedDayAppointments(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50">
                                {selectedDayAppointments.map(apt => {
                                    const patient = patients.find(p => p.id === apt.patientId);
                                    return (
                                        <div key={apt.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#083c79] transition-colors group">
                                            <div className="h-10 w-10 rounded-full bg-[#083c79] flex items-center justify-center text-white font-bold mr-3 shrink-0 text-sm">
                                                {patient ? patient.firstName.charAt(0) : '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate text-sm">
                                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Desconocido'}
                                                </h4>
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <span className="font-mono bg-[#083c79]/5 text-[#083c79] px-1.5 py-0.5 rounded font-bold">{apt.time}</span>
                                                    <span className="truncate">{apt.reason}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleEditAppointment(apt.id, e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={(e) => handleDeleteAppointment(apt.id, e)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {selectedDayAppointments.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No hay citas para este día.</p>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Edit Appointment Modal - Kept GlassCard for Modal as user didn't specify changing this, but inputs inside are consistent */}
                {editingAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <GlassCard className="w-full max-w-md p-0 overflow-hidden shadow-2xl">
                            <div className="bg-[#083c79] p-6 flex justify-between items-center text-white">
                                <h3 className="text-xl font-bold">Editar Cita</h3>
                                <button onClick={() => setEditingAppointment(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-0.5 bg-white">
                                <FloatingLabelInput
                                    label="Fecha"
                                    type="date"
                                    value={editingAppointment.date}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                                />
                                <FloatingLabelInput
                                    label="Hora"
                                    type="time"
                                    value={editingAppointment.time}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                                />
                                <FloatingLabelSelect
                                    label="Tipo de Cita"
                                    value={editingAppointment.type}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, type: e.target.value as 'presencial' | 'virtual' })}
                                    options={[
                                        { label: 'Presencial', value: 'presencial' },
                                        { label: 'Virtual', value: 'virtual' }
                                    ]}
                                />
                                <FloatingLabelInput
                                    label="Motivo"
                                    as="textarea"
                                    value={editingAppointment.reason}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, reason: e.target.value })}
                                    rows={3}
                                />

                                <div className="flex justify-end gap-3 pt-6">
                                    <button
                                        onClick={() => setEditingAppointment(null)}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateAppointment}
                                        disabled={isSaving}
                                        className="px-6 py-3 rounded-xl font-bold text-white bg-[#083c79] hover:brightness-110 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};
