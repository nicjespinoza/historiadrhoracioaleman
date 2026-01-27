import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { PatientListScreen } from './PatientListScreen';
import { RegisterScreen } from './RegisterScreen';
import { AgendaScreen } from './AgendaScreen';
import { ProfileScreen } from './ProfileScreen';
import { InitialHistoryScreen } from './InitialHistoryScreen';
import { SpecialtyHistoryScreen } from './SpecialtyHistoryScreen';
import { ConsultScreen } from './ConsultScreen';
import { ReportScreen } from './ReportScreen';
import { Body3DDesigner } from './Body3DDesigner';
import { Patient, InitialHistory, SubsequentConsult, ModalContent, User } from '../types';
import { api } from '../../api';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const DoctorDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser: firebaseUser, logout } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [histories, setHistories] = useState<InitialHistory[]>([]);
    const [consults, setConsults] = useState<SubsequentConsult[]>([]);
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check Firebase authentication
    useEffect(() => {
        if (!firebaseUser) {
            navigate('/app/doctor/login');
        }
    }, [firebaseUser, navigate]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            if (!firebaseUser) {
                setLoading(false);
                return;
            }
            try {
                // Clear any corrupted localStorage data
                localStorage.removeItem('patients');
                localStorage.removeItem('histories');
                localStorage.removeItem('consults');

                const [p, h, c] = await Promise.all([
                    api.getPatients(),
                    api.getHistories(),
                    api.getConsults()
                ]);

                // Filter out corrupted patients (those without valid IDs)
                const validPatients = p.filter(patient => patient.id && patient.id.trim() !== '');



                console.log('Loaded patients from Firestore:', validPatients.length);
                if (p.length !== validPatients.length) {
                    console.warn(`Filtered out ${p.length - validPatients.length} corrupted patient(s) with empty IDs`);
                }

                setPatients(validPatients);
                setHistories(h);
                setConsults(c);

                // Set user info from Firebase Auth
                const userInfo = {
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Doctor',
                    role: 'doctor'
                };
                setCurrentUser(userInfo as any);
                localStorage.setItem('currentUser', JSON.stringify(userInfo));
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [firebaseUser]);

    // Note: We no longer cache patients in localStorage since we're using Firestore
    // This prevents issues with stale or corrupted IDs

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('currentUser');
            navigate('/app/doctor/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Access Control Check - REMOVED FOR DEMO
    // if (!currentUser || currentUser.role !== 'doctor') { ... }

    return (
        <DoctorLayout onLogout={handleLogout} currentUser={currentUser ? currentUser.name : 'Doctor'}>
            <ErrorBoundary>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full"
                    >
                        <Routes location={location}>
                            <Route path="/" element={<Navigate to="/app/patients" replace />} />
                            <Route path="patients" element={
                                <PatientListScreen
                                    patients={patients}
                                    onPatientDelete={(id) => setPatients(prev => prev.filter(p => p.id !== id))}
                                />
                            } />
                            <Route path="patients-specialty" element={
                                <PatientListScreen
                                    patients={patients}
                                    onPatientDelete={(id) => setPatients(prev => prev.filter(p => p.id !== id))}
                                />
                            } />
                            <Route path="register" element={<RegisterScreen setPatients={setPatients} />} />
                            <Route path="agenda" element={<AgendaScreen />} />
                            <Route path="profile/:patientId" element={
                                <ProfileScreen
                                    patients={patients}
                                    histories={histories}
                                    consults={consults}
                                    onPatientUpdate={(updated) => {
                                        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                    }}
                                />
                            } />
                            <Route path="history/:patientId" element={
                                <InitialHistoryScreen
                                    patients={patients}
                                    setHistories={setHistories}
                                />
                            } />
                            <Route path="history-specialty/:patientId" element={
                                <SpecialtyHistoryScreen
                                    patients={patients}
                                    setHistories={setHistories}
                                />
                            } />
                            <Route path="consult/:patientId" element={
                                <ConsultScreen
                                    patients={patients}
                                    setConsults={setConsults}
                                />
                            } />

                            <Route path="reports" element={
                                <ReportScreen
                                    patients={patients}
                                    histories={histories}
                                    consults={consults}
                                />
                            } />
                            <Route path="body-designer" element={<Body3DDesigner />} />
                            <Route path="crearimagen/:patientId" element={<Body3DDesigner />} />
                            <Route path="crearimagen/:patientId/:snapshotId" element={<Body3DDesigner />} />

                            {/* DEBUG: Show 404 instead of redirect to catch routing errors */}
                            <Route path="*" element={
                                <div className="p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-800">404 - Página no encontrada</h2>
                                    <p className="text-gray-600 mb-4">La ruta solicitada no existe dentro del Dashboard.</p>
                                    <p className="text-sm font-mono text-gray-400 mb-6">Path: {window.location.pathname}</p>
                                    <button
                                        onClick={() => navigate('/app/patients')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700"
                                    >
                                        Volver al Inicio
                                    </button>
                                </div>
                            } />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </ErrorBoundary>
        </DoctorLayout>
    );
};
