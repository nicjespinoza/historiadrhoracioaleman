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
import { PrescriptionViewer } from './PrescriptionViewer';
import { CreatePrescriptionScreen } from './CreatePrescriptionScreen';
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
    const [totalPatients, setTotalPatients] = useState(0);
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCursors, setPageCursors] = useState<any[]>([]); // Stores the lastDoc of each page to be used as startAfter for next page
    const [loadingMore, setLoadingMore] = useState(false);
    // Search State
    const [isSearching, setIsSearching] = useState(false);
    // Filter State
    const [selectedPatientType, setSelectedPatientType] = useState<string>('Historia Clinica');

    // Check Firebase authentication
    useEffect(() => {
        if (!firebaseUser) {
            navigate('/app/doctor/login');
        }
    }, [firebaseUser, navigate]);

    // Load initial data (Paginated)
    useEffect(() => {
        const loadData = async () => {
            if (!firebaseUser) {
                setLoading(false);
                return;
            }
            try {
                // Fetch first page of patients (limit 9) and total count
                const [pResult, count] = await Promise.all([
                    api.getPatients({ limitCount: 9, patientType: selectedPatientType }),
                    api.getPatientsCount(selectedPatientType)
                ]);

                // Filter out corrupted patients
                const validPatients = pResult.patients.filter(patient => patient.id && patient.id.trim() !== '');

                setPatients(validPatients);
                setTotalPatients(count);


                // Reset pagination state
                setCurrentPage(1);
                setPageCursors([pResult.lastVisible]); // Store first page's end cursor

                // Clear histories and consults from global state to favor lazy loading in profile
                setHistories([]);
                setConsults([]);

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
    }, [firebaseUser, selectedPatientType]); // Re-run when filter changes

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

    const handlePageChange = async (newPage: number) => {
        if (loadingMore || newPage < 1) return;

        const direction = newPage > currentPage ? 'next' : 'prev';
        setLoadingMore(true);

        try {
            let cursor = null;

            if (newPage > 1) {
                // For page 2, we need the cursor stored at index 0 (end of page 1)
                // For page 3, we need the cursor stored at index 1 (end of page 2)
                cursor = pageCursors[newPage - 2];
            }

            const result = await api.getPatients({
                limitCount: 9,
                lastDoc: cursor,
                patientType: selectedPatientType
            });

            const newPatients = result.patients.filter(patient => patient.id && patient.id.trim() !== '');
            setPatients(newPatients);
            setCurrentPage(newPage);

            // If we moved forward and successfully got data, ensure we store the new cursor
            if (direction === 'next' && result.lastVisible) {
                const newCursors = [...pageCursors];
                // Ensure we store it at the correct index for the *current* page we just finished
                newCursors[newPage - 1] = result.lastVisible;
                setPageCursors(newCursors);
            }

        } catch (error) {
            console.error("Error changing page:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Access Control Check - REMOVED FOR DEMO
    // if (!currentUser || currentUser.role !== 'doctor') { ... }

    const handleSearch = async (term: string) => {
        if (!term) {
            // Restore initial state (Page 1)
            setIsSearching(false);
            setLoadingMore(true);
            try {
                // Fetch first page of patients (limit 9) and total count
                const [pResult, count] = await Promise.all([
                    api.getPatients({ limitCount: 9, patientType: selectedPatientType }),
                    api.getPatientsCount(selectedPatientType)
                ]);

                const validPatients = pResult.patients.filter(patient => patient.id && patient.id.trim() !== '');

                setPatients(validPatients);
                setTotalPatients(count);

                // Reset pagination state
                setCurrentPage(1);
                setPageCursors([pResult.lastVisible]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingMore(false);
            }
            return;
        }

        setIsSearching(true);
        setLoadingMore(true);
        try {
            // Use specialized search function with type filtering
            const results = await api.searchPatients(term, selectedPatientType);
            const validResults = results.filter(patient => patient.id && patient.id.trim() !== '');
            setPatients(validResults);
            // We set totalPatients to undefined (or ignore it) so PatientListScreen falls back to client pagination
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoadingMore(false);
        }
    };

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
                                    totalCount={isSearching ? undefined : totalPatients}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                    isLoading={loadingMore}
                                    onSearch={handleSearch}
                                    selectedType={selectedPatientType}
                                    onTypeChange={setSelectedPatientType}
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

                            <Route path="prescriptions/:patientId/:prescriptionId" element={<PrescriptionViewer />} />
                            <Route path="prescription/new/:patientId" element={<CreatePrescriptionScreen patients={patients} />} />

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
