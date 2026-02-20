<<<<<<< HEAD
import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, ArrowLeft, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight, FileText, Pill, Globe, UserCog, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
=======
import React, { useState } from 'react';
import { Users, UserPlus, FileBarChart, Calendar, Search, ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
import { Patient } from '../types';
import { api } from '../../api';
import { GlassCard } from '../components/premium-ui/GlassCard';

interface PatientListScreenProps {
    patients: Patient[];
    onPatientDelete: (id: string) => void;
<<<<<<< HEAD
    totalCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    onSearch?: (term: string) => void;
    selectedType?: string;
    onTypeChange?: (type: string) => void;
}

const ITEMS_PER_PAGE = 9; // 3 rows x 3 columns

export const PatientListScreen = ({
    patients,
    onPatientDelete,
    totalCount,
    currentPage = 1,
    onPageChange,
    isLoading = false,
    onSearch,
    selectedType = 'all',
    onTypeChange
}: PatientListScreenProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [clientPage, setClientPage] = useState(1);
    const navigate = useNavigate();

    // ... (rest of logic)

    // Tabs for filtering
    const tabs = [
        { id: 'Historia Clinica', label: 'Historia Clínica', icon: FileText },
        { id: 'Recetario', label: 'Recetario', icon: Pill },
    ];

    // Determine if we are using server-side pagination
    const isServerPagination = typeof totalCount !== 'undefined' && typeof onPageChange !== 'undefined';

    // Determine the active page to display
    const activePage = isServerPagination ? (currentPage || 1) : clientPage;

=======
}

export const PatientListScreen = ({ patients, onPatientDelete }: PatientListScreenProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const navigate = useNavigate();

>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
    const handleDelete = async () => {
        if (!patientToDelete) return;
        try {
            await api.deletePatient(patientToDelete.id);
            onPatientDelete(patientToDelete.id);
            setPatientToDelete(null);
        } catch (error) {
            console.error(error);
            alert('Error al eliminar paciente');
        }
    };

<<<<<<< HEAD
    // Filter patients
    const filtered = useMemo(() => {
        return patients.filter(p =>
            p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id?.includes(searchTerm)
        );
    }, [patients, searchTerm]);

    // Pagination / Load More Logic
    // If we have totalCount and onLoadMore, we use server-side pagination (Load More)
    // Otherwise we fallback to client-side pagination (for compatibility or small lists)
    // Get items to display
    const visiblePatients = isServerPagination ? (patients || []) : filtered.slice((activePage - 1) * ITEMS_PER_PAGE, (activePage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

    // Calculate total pages
    const totalPages = isServerPagination
        ? Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
        : Math.ceil(filtered.length / ITEMS_PER_PAGE);

    // Generate page numbers to display (max 3, centered around current)
    const getVisiblePageNumbers = (): number[] => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (activePage === 1) {
            return [1, 2, 3];
        }

        if (activePage === totalPages) {
            return [totalPages - 2, totalPages - 1, totalPages];
        }

        return [activePage - 1, activePage, activePage + 1];
    };

    const visiblePages = getVisiblePageNumbers();
=======
    const filtered = patients.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.includes(searchTerm)
    );
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99

    return (
        <div className="min-h-screen p-4 md:p-8">
            <GlassCard className="p-4 md:p-10 max-w-7xl mx-auto shadow-2xl">
<<<<<<< HEAD
                <div className="flex flex-col gap-6 mb-8">
                    {/* Header & Create Button */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-3xl font-bold text-cenlae-primary flex items-center gap-3">
                            <Users className="text-blue-600" /> Pacientes
                            <span className="text-base font-normal text-gray-500">
                                ({totalCount || filtered.length})
                            </span>
                        </h2>
=======
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <h2 className="text-3xl font-bold text-cenlae-primary flex items-center gap-3">
                        <Users className="text-blue-600" /> Pacientes
                    </h2>
                    <div className="flex w-full md:w-auto gap-3">
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
                        <button
                            onClick={() => navigate('/app/register')}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-600/20 w-full md:w-auto justify-center font-medium"
                        >
                            <UserPlus size={20} /> Crear Nuevo
                        </button>
                    </div>
<<<<<<< HEAD

                    {/* Tabs & Search Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        {/* Tabs */}
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (onTypeChange) onTypeChange(tab.id);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedType === tab.id
                                        ? 'bg-[#083c79] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#083c79] focus:ring-2 focus:ring-[#083c79]/10 transition-all text-gray-700 text-sm font-medium"
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    if (onSearch) onSearch(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visiblePatients.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all group relative overflow-hidden">
                            {/* Migrated Badge */}
                            {p.migrated && (
                                <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                                    <Globe size={10} /> MIGRADO
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-4 mt-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                                            {p.firstName} {p.lastName}
                                        </h3>
                                    </div>

                                    {/* Patient Type & Origin Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {/* Type Badge */}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.patientType === 'Recetario'
                                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {p.patientType === 'Recetario' ? 'RECETARIO' : 'HISTORIA CLÍNICA'}
                                        </span>

                                        {/* Origin Badge */}
                                        {p.registrationSource === 'online' || p.isOnline ? (
                                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                                <Globe size={8} /> ONLINE
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 flex items-center gap-1">
                                                <UserCog size={8} /> MANUAL
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p className="flex items-center gap-2"><span className="w-4 text-center">📅</span> {p.ageDetails || 'Edad no registrada'}</p>
                                        <p className="flex items-center gap-2"><span className="w-4 text-center">📱</span> {p.phone || 'Sin teléfono'}</p>
                                        <p className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-2">ID: {p.id?.slice(0, 8)}...</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Link
                                        to={`/app/profile/${p.id}`}
                                        className="bg-[#083c79] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10"
                                        title="Ver Perfil"
                                    >
                                        <ArrowLeft className="rotate-180" size={18} />
                                    </Link>
                                    <button
                                        onClick={() => setPatientToDelete(p)}
                                        className="bg-white text-red-500 border border-red-100 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all"
                                        title="Eliminar Paciente"
                                    >
                                        <Trash2 size={16} />
=======
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o ID..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-xl shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-black hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{p.firstName} {p.lastName}</h3>
                                        {p.registrationSource === 'online' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">ONLINE</span>
                                                <div
                                                    className={`w-3 h-3 rounded-full border border-white shadow-sm ${p.isOnline ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-300'}`}
                                                    title={p.isOnline ? 'Conectado' : 'Desconectado'}
                                                />
                                            </div>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">MANUAL</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mt-1">{p.ageDetails}</p>
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 mt-3 inline-block bg-gray-50 px-2 py-1 rounded">ID: {p.id}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to={`/app/profile/${p.id}`}
                                        className="bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-center"
                                    >
                                        <ArrowLeft className="rotate-180 mx-auto" size={20} />
                                    </Link>
                                    <button
                                        onClick={() => setPatientToDelete(p)}
                                        className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                                    >
                                        <Trash2 size={20} className="mx-auto" />
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
<<<<<<< HEAD
                    {visiblePatients.length === 0 && (
=======
                    {filtered.length === 0 && (
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
                        <div className="col-span-full text-center py-20">
                            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4 text-gray-400">
                                <Search size={40} />
                            </div>
                            <p className="text-gray-500 font-medium">No se encontraron pacientes registrados.</p>
                        </div>
                    )}
                </div>

<<<<<<< HEAD
                {/* Server Side Pagination Controls (Next/Prev) */}
                {isServerPagination && totalPages > 1 && !searchTerm && (
                    <div className="flex flex-col items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200">

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onPageChange?.(activePage - 1)}
                                disabled={activePage === 1 || isLoading}
                                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <span className="text-sm font-bold text-gray-600">
                                Página {activePage} de {totalPages || 1}
                            </span>

                            <button
                                onClick={() => onPageChange?.(activePage + 1)}
                                disabled={activePage >= totalPages || isLoading}
                                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Cargando pacientes...
                            </div>
                        )}

                    </div>
                )}

                {/* Pagination Controls (Client Side Fallback) */}
                {!isServerPagination && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                        {/* Previous Arrow */}
                        <button
                            onClick={() => setClientPage(prev => Math.max(1, prev - 1))}
                            disabled={activePage === 1}
                            className={`p-2 rounded-lg transition-all ${activePage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                }`}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Page Numbers */}
                        {visiblePages.map(page => (
                            <button
                                key={page}
                                onClick={() => setClientPage(page)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${activePage === page
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Arrow */}
                        <button
                            onClick={() => setClientPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={activePage === totalPages}
                            className={`p-2 rounded-lg transition-all ${activePage === totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                }`}
                            aria-label="Página siguiente"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {patientToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                                    <AlertTriangle /> Advertencia
                                </h3>
                                <button onClick={() => setPatientToDelete(null)} className="text-red-400 hover:text-red-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="bg-red-600 text-white p-4 rounded-xl mb-6 shadow-inner">
                                    <p className="font-medium text-center">
                                        Se eliminará toda información del paciente, incluyendo historia clínica, agenda, imágenes, recetas, notas y documentación.
                                    </p>
                                </div>
                                <p className="text-gray-600 text-center mb-6">
                                    ¿Estás seguro que deseas eliminar a <strong>{patientToDelete.firstName} {patientToDelete.lastName}</strong>?
                                    <br />Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPatientToDelete(null)}
                                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                    >
                                        Eliminación completa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
=======

                {/* Delete Confirmation Modal */}
                {
                    patientToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                                <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                                        <AlertTriangle /> Advertencia
                                    </h3>
                                    <button onClick={() => setPatientToDelete(null)} className="text-red-400 hover:text-red-600">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="bg-red-600 text-white p-4 rounded-xl mb-6 shadow-inner">
                                        <p className="font-medium text-center">
                                            Se eliminará toda información del paciente, incluyendo historia clínica, agenda, imágenes, recetas, notas y documentación.
                                        </p>
                                    </div>
                                    <p className="text-gray-600 text-center mb-6">
                                        ¿Estás seguro que deseas eliminar a <strong>{patientToDelete.firstName} {patientToDelete.lastName}</strong>?
                                        <br />Esta acción no se puede deshacer.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPatientToDelete(null)}
                                            className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                        >
                                            Eliminación completa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
            </GlassCard>
        </div>
    );
};
