'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/api';

export const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [theme, setTheme] = useState('light');
    const t = useTranslations('Index');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isLangOpen, setIsLangOpen] = useState(false);

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

    const changeLanguage = (newLocale: string) => {
        const segments = pathname.split('/');
        segments[1] = newLocale;
        router.push(segments.join('/'));
        setIsLangOpen(false);
    };

    const handleLogoClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            // LOGIC FOR LOGO CLICK
            router.push(`/${locale}`);
        } catch (error) {
            router.push(`/${locale}`);
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
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-green-700 transition-all font-bold py-2 px-4 rounded-xl border border-gray-200 hover:border-green-200 bg-white shadow-sm active:scale-95"
                            >
                                <img
                                    alt={locale === 'es' ? 'Español' : 'English'}
                                    className="rounded-full w-5 h-5 object-cover"
                                    src={locale === 'es' ? "https://flagcdn.com/w40/sv.png" : "https://flagcdn.com/w40/us.png"}
                                />
                                <span className="text-sm font-bold uppercase tracking-wider">{locale === 'es' ? 'Español' : 'English'}</span>
                                <span className={`material-icons-outlined text-lg transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {isLangOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden z-50">
                                    <button
                                        onClick={() => changeLanguage('es')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${locale === 'es' ? 'bg-green-50/50 text-green-700' : 'text-gray-700'}`}
                                    >
                                        <img className="rounded-full w-5 h-5 object-cover" src="https://flagcdn.com/w40/sv.png" alt="ES" />
                                        <span className="text-sm font-bold">Español</span>
                                        {locale === 'es' && <span className="material-icons-outlined text-sm ml-auto">check</span>}
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${locale === 'en' ? 'bg-green-50/50 text-green-700' : 'text-gray-700'}`}
                                    >
                                        <img className="rounded-full w-5 h-5 object-cover" src="https://flagcdn.com/w40/us.png" alt="EN" />
                                        <span className="text-sm font-bold">English</span>
                                        {locale === 'en' && <span className="material-icons-outlined text-sm ml-auto">check</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Link href={`/${locale}`} className="px-5 py-2 rounded-md bg-green-700 text-white shadow-sm text-sm font-medium transition-all">Inicio</Link>
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
