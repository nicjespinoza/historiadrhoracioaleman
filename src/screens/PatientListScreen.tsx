import React, { useState } from 'react';
import { Users, UserPlus, FileBarChart, Calendar, Search, ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { api } from '../../api';
import { GlassCard } from '../components/premium-ui/GlassCard';

interface PatientListScreenProps {
    patients: Patient[];
    onPatientDelete: (id: string) => void;
}

export const PatientListScreen = ({ patients, onPatientDelete }: PatientListScreenProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const navigate = useNavigate();

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

    const filtered = patients.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.includes(searchTerm)
    );

    return (
        <div className="min-h-screen p-4 md:p-8">
            <GlassCard className="p-4 md:p-10 max-w-7xl mx-auto shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <h2 className="text-3xl font-bold text-cenlae-primary flex items-center gap-3">
                        <Users className="text-blue-600" /> Pacientes
                    </h2>
                    <div className="flex w-full md:w-auto gap-3">
                        <button
                            onClick={() => navigate('/app/register')}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-600/20 w-full md:w-auto justify-center font-medium"
                        >
                            <UserPlus size={20} /> Crear Nuevo
                        </button>
                    </div>
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
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4 text-gray-400">
                                <Search size={40} />
                            </div>
                            <p className="text-gray-500 font-medium">No se encontraron pacientes registrados.</p>
                        </div>
                    )}
                </div>


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
            </GlassCard>
        </div>
    );
};
