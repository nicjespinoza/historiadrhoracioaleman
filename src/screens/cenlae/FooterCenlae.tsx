import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';

const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
];

const footerLinks = {
    perfil: [
        { name: 'Misión y Visión', href: '#' },
        { name: 'Experiencia Laboral', href: '#' },
        { name: 'Formación Académica', href: '#' },
    ],
    servicios: [
        { name: 'Quirúrgicos', href: '#services' },
        { name: 'Endoscópicos', href: '#services' },
    ],
};

// Componente reutilizable para efecto de expansión de texto completo
interface ExpandingBlockProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

const ExpandingBlock = ({ children, delay = 0, className = '' }: ExpandingBlockProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1]
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const FooterCenlae = () => {
    return (
        <footer className="bg-cenlae-footer text-white py-8 sm:py-10 lg:py-12" id="contact">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                {/* Grid responsive: todo en columnas en móvil */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:flex lg:flex-row lg:justify-between gap-6 sm:gap-8 lg:gap-8">

                    {/* Logo Section */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:flex-shrink-0 lg:w-1/4">
                        <div className="flex flex-col items-center sm:items-start">
                            <ExpandingBlock delay={0}>
                                <div className="text-white font-semibold text-5xl sm:text-6xl lg:text-8xl tracking-tighter leading-none select-none mb-1">
                                    MM
                                </div>
                            </ExpandingBlock>
                            <div className="border-t border-white/40 w-full pt-2 text-center sm:text-left">
                                <ExpandingBlock delay={0.1}>
                                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold tracking-widest uppercase">
                                        Dr. Milton Mairena Valle
                                    </h3>
                                </ExpandingBlock>
                                <ExpandingBlock delay={0.2}>
                                    <p className="text-[10px] sm:text-xs text-white/80 uppercase tracking-wider mt-1">
                                        Endoscopia y Laparoscopia de Alta Especialidad
                                    </p>
                                </ExpandingBlock>
                            </div>
                        </div>
                    </div>

                    {/* Perfil Profesional */}
                    <div className="col-span-1 flex flex-col space-y-2 sm:space-y-3">
                        <ExpandingBlock delay={0}>
                            <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Perfil Profesional</h4>
                        </ExpandingBlock>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/90">
                            {footerLinks.perfil.map((link, index) => (
                                <ExpandingBlock key={link.name} delay={0.1 + index * 0.05}>
                                    <li>
                                        <a href={link.href} className="hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                </ExpandingBlock>
                            ))}
                        </ul>
                    </div>

                    {/* Servicios */}
                    <div className="col-span-1 flex flex-col space-y-2 sm:space-y-3">
                        <ExpandingBlock delay={0}>
                            <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Servicios</h4>
                        </ExpandingBlock>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/90">
                            {footerLinks.servicios.map((link, index) => (
                                <ExpandingBlock key={link.name} delay={0.1 + index * 0.05}>
                                    <li>
                                        <a href={link.href} className="hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                </ExpandingBlock>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-span-1 flex flex-col space-y-2 sm:space-y-3">
                        <ExpandingBlock delay={0}>
                            <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Contacto</h4>
                        </ExpandingBlock>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-white/90">
                            <ExpandingBlock delay={0.1}>
                                <p className="font-medium">Hospital Vivian Pellas</p>
                            </ExpandingBlock>
                            <ExpandingBlock delay={0.15}>
                                <p>Torre 1, Piso 2, Consultorio 208</p>
                            </ExpandingBlock>
                            <ExpandingBlock delay={0.2}>
                                <p>Consulta: (505) 87893709</p>
                            </ExpandingBlock>
                            <ExpandingBlock delay={0.25}>
                                <p>Emergencias: (505) 85500592</p>
                            </ExpandingBlock>
                            <ExpandingBlock delay={0.3}>
                                <p>8:00 am - 5:00 pm</p>
                            </ExpandingBlock>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="col-span-1 flex flex-col items-center sm:items-start">
                        <ExpandingBlock delay={0}>
                            <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">Síguenos</h4>
                        </ExpandingBlock>
                        <div className="flex space-x-2 sm:space-x-3">
                            {socialLinks.map((social, index) => (
                                <ExpandingBlock key={index} delay={index * 0.08}>
                                    <a
                                        href={social.href}
                                        className="bg-white text-cenlae-footer hover:bg-gray-100 transition-colors w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center"
                                    >
                                        <social.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5" />
                                    </a>
                                </ExpandingBlock>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <ExpandingBlock delay={0.4}>
                    <div className="mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8 border-t border-white/20 text-[10px] sm:text-xs font-medium text-white/60 text-center">
                        <p>© 2025 Todos los Derechos Reservados Dr. Milton Mairena Valle</p>
                    </div>
                </ExpandingBlock>
            </div>

            {/* Floating Chat Button - más pequeño en móvil */}
            <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-cenlae-primary hover:bg-blue-800 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </footer>
    );
};
