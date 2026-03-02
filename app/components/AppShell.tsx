
'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../../src/AppRoutes';

const AppShell = () => {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
};

export default AppShell;
