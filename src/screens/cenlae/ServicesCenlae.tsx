import React from 'react';
import { motion } from 'framer-motion';

const serviciosQuirurgicos = [
    {
        title: 'Cirugía General',
        description: 'Técnicas quirúrgicas convencionales para el tratamiento de enfermedades prevalentes (hernias, patología ano-orificial, cirugías menores).',
    },
    {
        title: 'Cirugía Gastrointestinal',
        description: 'Procedimientos quirúrgicos a nivel del tracto digestivo a través de incisiones mínimas produciendo menos cicatrices, menos dolor y una rápida recuperación.',
    },
    {
        title: 'Minilaparoscopia',
        description: 'Técnica quirúrgica en enfermedades gastrointestinales o patología herniaria utilizando instrumentos muy finos (3 mm) con cicatrices mínimas y una rápida recuperación.',
    },
];

const serviciosEndoscopicos = [
    {
        title: 'Endoscopia Alta',
        description: 'Procedimiento endoscópico que permite la evaluación interna del esófago, estómago y duodeno con fines diagnósticos y de tratamiento.',
    },
    {
        title: 'Colonoscopia',
        description: 'Procedimiento endoscópico que evalúa el interior del colon y recto para el diagnóstico y tratamiento de sus enfermedades.',
    },
    {
        title: 'Duodenoscopia',
        description: 'Procedimiento endoscópico que permite evaluar el duodeno y la Ampolla de Vater con fines diagnósticos y terapéuticos.',
    },
    {
        title: 'CPRE',
        description: 'La Colangiopancreatografía Endoscópica Retrograda es un procedimiento endoscópico empleado en el tratamiento de las enfermedades de la vía biliar y el conducto pancreático.',
    },
    {
        title: 'Ultrasonido Endoscópico',
        description: 'Estudio endoscópico que permite realizar una evaluación zonografica de los órganos intrabdominales con fines diagnósticos o terapéuticos.',
    },
    {
        title: 'Colangioscopia',
        description: 'Procedimiento endoscópico que permite el diagnóstico y tratamiento de las enfermedades la vía biliar y el conducto pancreático.',
    },
    {
        title: 'Enteroscopia',
        description: 'Procedimiento endoscópico que permite el tratamiento de las enfermedades benignas y malignas del intestino delgado.',
    },
    {
        title: 'Cápsula Endoscópica',
        description: 'Estudio que consiste en ingerir un dispositivo electrónico con forma de cápsula el cual toma fotografías del intestino delgado o del colon con fines diagnósticos.',
    },
    {
        title: 'Balón Intragástrico',
        description: 'Consiste en colocar por vía endoscópica un balón relleno de agua durante 1 año con el objetivo de promover la pérdida de peso en el paciente obeso.',
    },
    {
        title: 'Asistencia Nutricional',
        description: 'Colocación endoscópica de sondas de alimentación en el estómago e intestino delgado (yeyuno) con el objetivo de la administración de medicamentos y alimentos.',
    },
];

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

interface ServiceCardProps {
    title: string;
    description: string;
    index: number;
}

const ServiceCard = ({ title, description, index }: ServiceCardProps) => (
    <ExpandingBlock delay={index * 0.08}>
        <div className="border-2 border-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center h-full bg-white shadow-lg sm:shadow-2xl">
            <div className="bg-cenlae-primary text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg mb-2 sm:mb-4 text-sm sm:text-base w-fit shadow-sm">
                {title}
            </div>
            <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">
                {description}
            </p>
        </div>
    </ExpandingBlock>
);

export const ServicesCenlae = () => {
    return (
        <section className="bg-white py-6 sm:py-8 lg:py-10 border-t border-gray-100" id="services">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex flex-col items-center">
                {/* Services Header */}
                <ExpandingBlock delay={0}>
                    <div className="bg-cenlae-primary text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold py-2 px-6 sm:px-8 rounded-lg shadow-md mb-6 sm:mb-8 lg:mb-12 uppercase tracking-wide">
                        Servicios
                    </div>
                </ExpandingBlock>

                {/* Quirúrgicos Section */}
                <ExpandingBlock delay={0.1}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 sm:mb-6 lg:mb-8 uppercase tracking-wide text-center">
                        Quirúrgicos
                    </h3>
                </ExpandingBlock>

                {/* Grid en móvil: 2 columnas, tablet: 2, desktop: 3 */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full mb-8 sm:mb-12 lg:mb-16">
                    {serviciosQuirurgicos.map((servicio, index) => (
                        <ServiceCard
                            key={servicio.title}
                            title={servicio.title}
                            description={servicio.description}
                            index={index}
                        />
                    ))}
                </div>

                {/* Endoscópicos Section */}
                <ExpandingBlock delay={0.1}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 sm:mb-6 lg:mb-8 uppercase tracking-wide text-center">
                        Endoscópicos
                    </h3>
                </ExpandingBlock>

                {/* Grid en móvil: 2 columnas, tablet: 2, desktop: 3 */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full mb-4 sm:mb-6 lg:mb-8">
                    {serviciosEndoscopicos.slice(0, 9).map((servicio, index) => (
                        <ServiceCard
                            key={servicio.title}
                            title={servicio.title}
                            description={servicio.description}
                            index={index}
                        />
                    ))}
                </div>

                {/* Centered Last Card */}
                <div className="flex justify-center w-full">
                    <div className="w-1/2 sm:w-1/2 lg:w-1/3 p-1 sm:p-2">
                        <ServiceCard
                            title={serviciosEndoscopicos[9].title}
                            description={serviciosEndoscopicos[9].description}
                            index={9}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};