import React from 'react';
import { motion } from 'framer-motion';

// Datos de ejemplo
const experienciaLaboral = [
    { text: 'Jefe del Centro de Endoscopia', subtext: 'Hospital Vivian Pellas.' },
    { text: 'Cirujano Endoscopista Gastrointestinal', subtext: 'Hospital Vivian Pellas.' },
    { text: 'Jefe de Cirugía General y Endoscopia', subtext: 'Hospital SUMEDICO.' },
];

const formacionAcademica = [
    { text: 'Postgrado en Enteroscopia y Capsula', subtext: 'Mexico' },
    { text: 'Alta Especialidad de Ultrasonido Endoscópico', subtext: 'Mexico' },
    { text: 'Cirugía Laparoscópica y Toracoscopia', subtext: 'Argentina' },
];

// Componente reutilizable para animaciones suaves
const ExpandingBlock = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => (
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

// Ítem de la lista (Texto + Conector Linea-Punto) CON ANIMACIÓN
const TimelineItemClean = ({ text, subtext, isLast, index, delay = 0 }: { text: string, subtext: string, isLast: boolean, index: number, delay?: number }) => (
    <div className="flex flex-col items-center w-full mb-1">
        {/* Texto Animado */}
        <ExpandingBlock delay={delay} className="w-full">
            <div className="flex flex-col items-center text-center px-1 mb-1">
                <h4 className="font-semibold text-[#083c79] text-xs sm:text-sm leading-tight mb-0.5">
                    {text}
                </h4>
                <p className="text-[#083c79] text-[10px] sm:text-xs font-medium">
                    {subtext}
                </p>
            </div>
        </ExpandingBlock>

        {/* Conector: Línea y Punto (Animado) */}
        {!isLast && (
            <ExpandingBlock delay={delay + 0.15} className="flex flex-col items-center">
                <div className="h-6 w-[1.5px] bg-black"></div>
                <div className="w-3 h-3 bg-black rounded-full"></div>
            </ExpandingBlock>
        )}
    </div>
);

// Sección de Lista CON CÁLCULO DE DELAY
const TimelineSectionClean = ({ title, items, delay = 0 }: { title: string, items: { text: string, subtext: string }[], delay?: number }) => (
    <div className="w-full flex flex-col items-center mb-6 last:mb-0">
        <ExpandingBlock delay={delay}>
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 text-center">
                {title}
            </h3>
        </ExpandingBlock>

        <div className="flex flex-col w-full items-center">
            {items.map((item, index) => (
                <TimelineItemClean
                    key={index}
                    text={item.text}
                    subtext={item.subtext}
                    isLast={index === items.length - 1}
                    index={index}
                    delay={delay + (index * 0.3)}
                />
            ))}
        </div>

        <ExpandingBlock delay={delay + (items.length * 0.3) + 0.1}>
            <div className="mt-2">
                <a href="#" className="text-black text-xs font-bold hover:underline tracking-wide">
                    Ver mas..
                </a>
            </div>
        </ExpandingBlock>
    </div>
);

export const ProfileCenlae = () => {
    return (
        <section className="bg-white py-8" id="profile">
            <div className="w-full px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">

                        {/* COLUMNA 1: FOTO (Izquierda) */}
                        <div className="md:col-span-1 lg:col-span-4 relative min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            {/* APLICADO EFECTO A LA IMAGEN */}
                            <ExpandingBlock delay={0} className="w-full h-full">
                                <img
                                    src="https://static.wixstatic.com/media/3743a7_ed960fadcab344f7a15a387961202ba7~mv2.png/v1/fill/w_432,h_588,al_c,q_85,enc_avif,quality_auto/drmiltonmairena-2_edited.png"
                                    alt="Dr. Milton Mairena Valle"
                                    className="absolute inset-0 w-full h-full object-cover object-top"
                                />
                            </ExpandingBlock>
                        </div>

                        {/* COLUMNA 2: TARJETA AZUL (Centro) */}
                        <div className="md:col-span-1 lg:col-span-5 bg-cenlae-primary rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-center items-center text-center text-white relative overflow-hidden">

                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                            {/* Contenido Agrupado con EFECTOS DE EXPANSIÓN EN CASCADA */}
                            <div className="relative z-10 flex flex-col items-center gap-10">

                                {/* Título */}
                                <ExpandingBlock delay={0.1}>
                                    <h2 className="text-2xl lg:text-4xl font-semibold leading-tight">
                                        Experiencia y Tecnología al servicio de su salud
                                    </h2>
                                </ExpandingBlock>

                                {/* Texto Descriptivo */}
                                <ExpandingBlock delay={0.3}>
                                    <div className="space-y-4 text-blue-50 text-sm lg:text-base font-medium leading-relaxed">
                                        <p>
                                            Con más de una década de experiencia en Endoscopía y Laparoscopía Avanzada, estoy comprometido con ofrecer diagnósticos precisos.
                                        </p>
                                        <p>
                                            Cada procedimiento se realiza con dedicación, priorizando siempre su salud y bienestar con técnicas mínimamente invasivas.
                                        </p>
                                        <p>
                                            Mi misión es brindarle un servicio médico de calidad, personalizado y confiable.
                                        </p>
                                    </div>
                                </ExpandingBlock>

                                {/* Botón y frase final */}
                                <ExpandingBlock delay={0.5}>
                                    <div className="pt-4">
                                        <p className="font-semibold text-white text-xl lg:text-3xl mb-6">
                                            ¡Su salud es mi prioridad!
                                        </p>
                                        <button className="bg-white text-cenlae-primary font-bold py-2 px-6 rounded-lg shadow hover:bg-gray-100 transition-colors text-sm sm:text-base">
                                            Más información
                                        </button>
                                    </div>
                                </ExpandingBlock>

                            </div>
                        </div>

                        {/* COLUMNA 3: LISTAS ANIMADAS (Derecha) */}
                        <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-center py-4 lg:pl-4">
                            <TimelineSectionClean title="Experiencia Laboral" items={experienciaLaboral} delay={0.6} />

                            <div className="h-4"></div>

                            <TimelineSectionClean title="Formación Académica" items={formacionAcademica} delay={0.8} />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};