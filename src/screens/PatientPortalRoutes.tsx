import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientLoginScreen, PatientRegisterScreen } from './PatientAuthScreens';
import { PatientDashboardScreen } from './PatientDashboardScreen';
import { PatientHistoryScreen } from './PatientHistoryScreen';

export const PatientPortalRoutes = () => {
    return (
        <Routes>
            <Route path="login" element={<PatientLoginScreen />} />
            <Route path="register" element={<PatientRegisterScreen />} />
            <Route path="dashboard" element={<PatientDashboardScreen />} />
            <Route path="history" element={<PatientHistoryScreen />} />
            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
};
