
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [theme, setTheme] = useState('light');

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

    return (
        <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <span className="material-icons-outlined text-green-700 text-4xl">medical_services</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-lg leading-tight tracking-tight">CONSULTORIO UROLÓGICO</span>
                            <span className="text-xs text-green-700 font-medium tracking-wide uppercase">Dr. Horacio H. Alemán E.</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-500 transition-colors py-2 px-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <img alt="El Salvador" className="rounded-sm w-6" src="https://flagcdn.com/w40/sv.png" />
                            <span className="text-sm font-medium">Español</span>
                            <span className="material-icons-outlined text-sm">expand_more</span>
                        </button>

                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <Link href="/" className="px-5 py-2 rounded-md bg-green-700 text-white shadow-sm text-sm font-medium transition-all">Inicio</Link>
                            <Link href="/app/doctor/login" className="px-5 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white text-sm font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700">Acceso</Link>
                        </div>

                        <Link href="/app/patient/login" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-lg text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all transform hover:-translate-y-0.5">
                            <span className="material-icons-outlined text-base mr-2">person</span>
                            Acceso pacientes
                        </Link>

                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            {darkMode ? (
                                <span className="material-icons-outlined block">light_mode</span>
                            ) : (
                                <span className="material-icons-outlined block">dark_mode</span>
                            )}
                        </button>
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
