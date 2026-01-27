import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AssistantLayout } from '../layouts/AssistantLayout';
import { motion } from 'framer-motion';

// Placeholder components - will be replaced by actual implementations
const DashboardHome = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Panel de Asistente</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Pacientes Online</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Citas Hoy</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Notificaciones Pendientes</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
            </div>
        </div>
    </div>
);

const OnlinePatients = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Pacientes en Línea</h1>
        <p>Lista de pacientes conectados...</p>
    </div>
);

const Agenda = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Agenda Médica</h1>
        <p>Calendario y citas...</p>
    </div>
);

const Notifications = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Centro de Notificaciones</h1>
        <p>Enviar correos y WhatsApp...</p>
    </div>
);

export const AssistantDashboard = () => {
    const navigate = useNavigate();
    // Mock user for now
    const currentUser = "Asistente Demo";

    const handleLogout = () => {
        // Implement logout logic
        navigate('/auth');
    };

    return (
        <AssistantLayout onLogout={handleLogout} currentUser={currentUser}>
            <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/patients" element={<OnlinePatients />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<Navigate to="/app/assistant" replace />} />
            </Routes>
        </AssistantLayout>
    );
};
