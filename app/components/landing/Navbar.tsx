'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/api';

export const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [theme, setTheme] = useState('light');
    const router = useRouter();

    useEffect(() => {
        // Init theme
        if (typeof window !== 'undefined') {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
                setDarkMode(true);
            } else {
                setTheme('light');
                document.documentElement.classList.remove('dark');
                setDarkMode(false);
            }
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        }
    };

    const handleLogoClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            // 1. Get client IP
            const response = await fetch('https://api4.ipify.org?format=json');
            const data = await response.json();
            const ip = data.ip;

            // 2. Check if IP is authorized
            const authorized = await api.checkIPAccess(ip);

            if (authorized) {
                // If authorized, go to staff login area
                router.push('/app/doctor/login');
            } else {
                // Otherwise normal behavior: go home
                router.push('/');
            }
        } catch (error) {
            console.error("Error checking IP for logo click:", error);
            router.push('/');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div
                        onClick={handleLogoClick}
                        className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="flex items-center">
                            <Image
                                src="/images/logo-dr-horacio-aleman.png"
                                alt="Dr. Horacio H. Alemán Escobar"
                                width={180}
                                height={60}
                                className="h-10 md:h-12 w-auto object-contain"
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-700 transition-colors py-2 px-3 rounded-lg border border-transparent hover:border-gray-200">
                            <img alt="El Salvador" className="rounded-sm w-6" src="https://flagcdn.com/w40/sv.png" />
                            <span className="text-sm font-medium">Español</span>
                            <span className="material-icons-outlined text-sm">expand_more</span>
                        </button>

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Link href="/" className="px-5 py-2 rounded-md bg-green-700 text-white shadow-sm text-sm font-medium transition-all">Inicio</Link>
                            <Link href="/app/doctor/login" className="px-5 py-2 rounded-md text-gray-600 hover:text-green-700 text-sm font-medium transition-all hover:bg-gray-200">Acceso</Link>
                        </div>

                        <Link href="/app/patient/login" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-lg text-white bg-gray-900 hover:bg-gray-800 transition-all transform hover:-translate-y-0.5">
                            <span className="material-icons-outlined text-base mr-2">person</span>
                            Acceso pacientes
                        </Link>
                    </div>
                    <div className="md:hidden flex items-center">
                        <button className="text-gray-500 hover:text-green-700 focus:outline-none">
                            <span className="material-icons-outlined text-3xl">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
