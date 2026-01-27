import React, { useEffect } from 'react';
import { LoginScreen } from './LoginScreen';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Check roles or user data in Firestore later
            // For now, redirect to main app
            navigate('/app');
        }
    }, [currentUser, navigate]);

    const handlePatientAccess = () => {
        navigate('/app/patient/login');
    };

    return (
        <LoginScreen
            onLogin={() => { }} // No longer needed as LoginScreen handles it internally via Context
            onPatientAccess={handlePatientAccess}
        />
    );
};
