
'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../../src/AppRoutes';
import { AuthProvider } from '../../src/context/AuthContext';
import '../../src/index.css'; // Ensure styles are available if not global

import { useParams } from 'next/navigation';

const AppShell = () => {
    const params = useParams();
    const locale = params?.locale as string || 'es';
    const basename = `/${locale}`;

    return (
        <AuthProvider>
            <BrowserRouter basename={basename}>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default AppShell;
