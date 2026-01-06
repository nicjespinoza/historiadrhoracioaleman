import React from 'react';
import { motion } from 'framer-motion';

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

export const HeroCenlae = () => {
    return (
        <div className="bg-white pb-6 sm:pb-8 lg:pb-10">
            {/* Contenedor Exterior - padding reducido en móvil */}
            <div className="relative w-full px-2 sm:px-4 pt-4 sm:pt-6 md:pt-8">

                {/* Marco del Video - altura responsive */}
                <div className="max-w-7xl mx-auto h-[350px] sm:h-[450px] md:h-[550px] lg:h-[700px] relative rounded-lg sm:rounded-xl lg:rounded-[1.0rem] overflow-hidden shadow-xl sm:shadow-2xl">

                    {/* Video de Fondo */}
                    <div className="absolute inset-0 w-full h-full">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover filter brightness-75 scale-105"
                        >
                            <source src="https://video.wixstatic.com/video/3743a7_d10ddd2a6d9f420db179933b6a4542d6/1080p/mp4/file.mp4" type="video/mp4" />
                            Tu navegador no soporta video HTML5.
                        </video>
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    {/* Contenido - texto responsive */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
                        <h1
                            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold text-white drop-shadow-xl sm:drop-shadow-2xl leading-tight mb-2 sm:mb-4 tracking-wide"
                            style={{ textShadow: '0px 3px 8px rgba(0, 0, 0, 0.6)' }}
                        >
                            <ExpandingBlock delay={0.2}>
                                Clínica de Endoscopia y Laparoscopia
                            </ExpandingBlock>
                            <ExpandingBlock delay={0.5}>
                                de Alta Especialidad
                            </ExpandingBlock>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Botón debajo del video - tamaño responsive */}
            <div className="relative mt-4 sm:mt-6 lg:mt-8 flex justify-center px-4">
                <ExpandingBlock delay={0.8}>
                    <button className="bg-cenlae-primary text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold py-2 px-6 sm:px-8 rounded-lg shadow-md uppercase tracking-wide">
                        Bienvenido
                    </button>
                </ExpandingBlock>
            </div>
        </div>
    );
};