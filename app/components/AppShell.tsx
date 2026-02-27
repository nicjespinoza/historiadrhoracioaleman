
'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLocale } from 'next-intl';
import AppRoutes from '../../src/AppRoutes';
import '../../src/index.css'; // Ensure styles are available if not global

const AppShell = () => {
    const locale = useLocale();

    return (
        <BrowserRouter basename={`/${locale}`}>
            <AppRoutes />
        </BrowserRouter>
    );
};

export default AppShell;
