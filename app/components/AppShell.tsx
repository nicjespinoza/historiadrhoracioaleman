
'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../../src/AppRoutes';
import { AuthProvider } from '../../src/context/AuthContext';
import '../../src/index.css'; // Ensure styles are available if not global

const AppShell = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default AppShell;
