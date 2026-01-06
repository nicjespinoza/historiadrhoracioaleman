import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarCenlaeProps {
    activePage?: 'inicio' | 'perfil' | 'servicios' | 'contacto';
}

export const NavbarCenlae = ({ activePage = 'inicio' }: NavbarCenlaeProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Inicio', href: '/cenlae', id: 'inicio' },
        { name: 'Perfil', href: '/perfil', id: 'perfil' },
        { name: 'Servicios', href: '/cenlae#services', id: 'servicios' },
        { name: 'Contacto', href: '/cenlae#contact', id: 'contacto' },
    ];

    return (
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">

                    {/* Logo - responsive sizing */}
                    <Link to="/cenlae" className="flex-shrink-0 flex items-center -ml-2 sm:-ml-4 lg:-ml-8">
                        <img
                            src="https://static.wixstatic.com/media/3743a7_bc65d6328e9c443e95b330a92181fbc8~mv2.png/v1/crop/x_13,y_9,w_387,h_61/fill/w_542,h_85,al_c,lg_1,q_85,enc_avif,quality_auto/logo-drmairenavalle.png"
                            alt="Dr. Milton Mairena Valle - Endoscopia y Laparoscopia"
                            className="h-10 sm:h-12 lg:h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Language Selector */}
                        <div className="flex items-center text-black hover:text-cenlae-primary cursor-pointer transition-colors">
                            <Globe className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Español</span>
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </div>

                        {/* Nav Links */}
                        <nav className="flex space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    // CAMBIO: Se reemplazó font-medium por font-semibold para aplicar Open Sans Semi Bold
                                    className={`text-base font-semibold transition-colors tracking-wide ${activePage === link.id
                                            ? 'text-cenlae-primary hover:text-blue-700'
                                            : 'text-black hover:text-cenlae-primary'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <Link
                        to="/app/patient/login"
                        // CAMBIOS AQUI:
                        // 1. bg-black: Fondo negro
                        // 2. text-white: Letras blancas
                        // 3. hover:bg-cenlae-primary: Al pasar el mouse cambia al azul de tu marca
                        className="bg-black text-white px-6 py-2 rounded text-sm font-semibold hover:bg-cenlae-primary transition-colors"
                        >
                        Acceso pacientes
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-black hover:text-gray-500 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    // CAMBIO: También aplicamos font-semibold en móvil
                                    className={`block text-base font-semibold py-2 ${activePage === link.id ? 'text-cenlae-primary' : 'text-gray-400'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/app/patient/login"
                                className="block w-full text-center bg-gray-100 text-gray-500 px-6 py-3 rounded text-sm font-semibold mt-4"
                            >
                                Acceso pacientes
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};