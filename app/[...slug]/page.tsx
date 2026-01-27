
'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../../src/AppRoutes';
import { AuthProvider } from '../../src/context/AuthContext';

export default function AppSPA() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
