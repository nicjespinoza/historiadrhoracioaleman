'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PatientDashboardPage = () => {
    const { currentUser, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // State for patient data
    const [patient, setPatient] = React.useState<any>(null);
    const [uniqueId, setUniqueId] = React.useState('');

    // Check for clinical history and fetch patient data
    React.useEffect(() => {
        const initDashboard = async () => {
            if (currentUser) {
                // Dynamic import to avoid SSR issues
                const { api } = await import('@/api');
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('@/src/lib/firebase');

                try {
                    // 1. Check history
                    const histories = await api.getHistories(currentUser.uid);
                    if (!histories || histories.length === 0) {
                        router.push('/app/patient/history');
                        return;
                    }

                    // 2. Fetch Patient Data (for WhatsApp message)
                    // Assuming patient ID is same as Auth UID
                    // We need to fetch from 'patients' collection directly
                    const patientDoc = await getDoc(doc(db, 'patients', currentUser.uid));
                    if (patientDoc.exists()) {
                        const pData = patientDoc.data();
                        setPatient(pData);
                    }

                    // 3. Generate Short Unique ID (last 6 chars of UID)
                    setUniqueId(currentUser.uid.slice(-6).toUpperCase());

                } catch (error) {
                    console.error("Error initializing dashboard:", error);
                }
            }
        };
        initDashboard();
    }, [currentUser, router]);

    const handleLogoClick = async () => {
        try {
            const { api } = await import('@/api');
            const response = await fetch('https://api4.ipify.org?format=json');
            const data = await response.json();
            const ip = data.ip;

            const authorized = await api.checkIPAccess(ip);
            if (authorized) {
                router.push('/app/doctor/login');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error checking IP for logo click:", error);
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div
                                onClick={handleLogoClick}
                                className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="flex items-center">
                                    <Image
                                        src="/images/logo-dr-horacio-aleman.png"
                                        alt="Logo"
                                        width={120}
                                        height={40}
                                        className="h-8 w-auto object-contain"
                                        unoptimized
                                    />
                                </div>
                                <span className="text-xl font-bold text-gray-900 hidden sm:block">Dr. Horacio Alemán</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Hola, {currentUser?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <span className="material-icons-outlined mr-2">logout</span>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Panel de Paciente
                        </h2>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none grayscale">
                    {/* Appointments Card */}
                    <div className="bg-white overflow-hidden shadow rounded-2xl border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-xl p-3">
                                    <span className="material-icons-outlined text-green-600 text-2xl">event</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Próxima Cita</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">Sin citas programadas</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <span className="font-medium text-green-700 flex items-center">
                                    Agendar nueva cita <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Medical History Card */}
                    <div className="bg-white overflow-hidden shadow rounded-2xl border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-xl p-3">
                                    <span className="material-icons-outlined text-blue-600 text-2xl">history_edu</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Historial Médico</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">Ver expediente</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <span className="font-medium text-blue-700 flex items-center">
                                    Consultar historial <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white overflow-hidden shadow rounded-2xl border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-xl p-3">
                                    <span className="material-icons-outlined text-purple-600 text-2xl">person</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Mi Perfil</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">Actualizar datos</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <span className="font-medium text-purple-700 flex items-center">
                                    Editar perfil <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Action Button */}
                <div className="mt-12 flex justify-center">
                    <a
                        href={`https://wa.me/50576741168?text=${encodeURIComponent(
                            `Hola Any acabo de completar mi ficha clinica estoy interesado en agenda una consulta con el Dr, estos son mi Datos:\n${patient?.firstName || ''} ${patient?.lastName || ''}\n${patient?.phone || ''}\n${patient?.email || currentUser?.email || ''}\n${uniqueId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 animate-bounce"
                    >
                        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.896 3.056.896 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.77-5.767-5.77zm0 10.09c-1.009 0-1.942-.296-2.936-.782l-.21-.102-1.967.515.525-1.917-.119-.189c-.529-.838-.813-1.636-.813-2.614.001-2.57 2.094-4.661 4.664-4.661 2.574 0 4.666 2.091 4.666 4.661 0 2.57-2.092 4.661-4.666 4.661z" />
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403c-5.54 0-10.057-4.516-10.057-10.057S6.491 1.671 12.051 1.671s10.057 4.516 10.057 10.057-4.516 10.057-10.057 10.057z" />
                        </svg>
                        Contactar para Agendar Cita
                    </a>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboardPage;
