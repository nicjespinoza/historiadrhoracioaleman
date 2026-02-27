'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/api';
import { useRouter } from 'next/navigation';

interface IPProtectedAreaProps {
    children: React.ReactNode;
}

export const IPProtectedArea: React.FC<IPProtectedAreaProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [userIp, setUserIp] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const checkIP = async () => {
            // TEMPORARILY DISABLED FOR ONLINE TESTING
            // To reactivate, remove these 3 lines:
            setIsAuthorized(true);
            setLoading(false);
            return;

            try {
                // 1. Get client IP
                const response = await fetch('https://api4.ipify.org?format=json');
                const data = await response.json();
                const ip = data.ip;
                setUserIp(ip);

                // 2. Check if IP is authorized in Firestore
                const authorized = await api.checkIPAccess(ip);
                setIsAuthorized(authorized);

                if (!authorized) {
                    console.warn(`Unauthorized IP access attempt: ${ip}`);
                    // Redirect to home if not authorized after a short delay
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                }
            } catch (error) {
                console.error("Error verifying IP:", error);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkIP();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#00a63e] flex flex-col items-center justify-center text-white p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                <p className="font-bold text-xl">Verificando seguridad...</p>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center text-white p-4 text-center">
                <span className="material-icons-outlined text-7xl mb-4">gpp_bad</span>
                <h2 className="text-3xl font-bold mb-2">Acceso Restringido</h2>
                <p className="max-w-md opacity-90">
                    Tu dirección IP (<strong>{userIp}</strong>) no está autorizada para acceder a esta área privada.
                </p>
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-white text-red-600 font-bold rounded-full shadow-lg"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
