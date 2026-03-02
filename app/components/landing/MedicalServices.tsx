'use client';

import { useState, useEffect } from 'react';

interface Service {
    title: string;
    desc: string;
    video: string;
    modalDescription: string;
    highlights: string[];
    icon: string;
}

const services: Service[] = [
    {
        title: "Enfermedad Litiásica",
        desc: "Cálculos renales y tecnología láser.",
        video: "/videos/Enfermedad Litiasica.mp4",
        icon: "kidney",
        modalDescription:
            "El Dr. Horacio Alemán es especialista en el diagnóstico y tratamiento de cálculos renales y urinarios mediante las técnicas más avanzadas de mínima invasión. Utilizando tecnología láser de última generación (Holmium y Thulium), fragmenta y elimina los cálculos sin necesidad de cirugía abierta, lo que permite una recuperación mucho más rápida y con menos dolor.",
        highlights: [
            "Litotricia láser Holmium y Thulium",
            "Ureteroscopía flexible de alta definición",
            "Nefrolitotomía percutánea (NLP) mínimamente invasiva",
            "Diagnóstico avanzado con tomografía y ultrasonido",
            "Tratamiento personalizado según tipo de cálculo",
            "Recuperación rápida con mínima hospitalización",
        ],
    },
    {
        title: "Patología de Próstata",
        desc: "Crecimiento prostático y prevención.",
        video: "/videos/Patologia de Prostata.mp4",
        icon: "medical_services",
        modalDescription:
            "Con más de 15 años de experiencia, el Dr. Alemán ofrece un abordaje integral para el crecimiento prostático benigno (HPB) y otras patologías prostáticas. Emplea técnicas endourológicas avanzadas como la resección transuretral (RTU) y enucleación láser, evitando cirugías abiertas y garantizando una mejoría significativa en la calidad de vida del paciente.",
        highlights: [
            "Resección transuretral de próstata (RTU-P)",
            "Enucleación prostática con láser",
            "Evaluación con antígeno prostático (PSA)",
            "Ultrasonido transrectal de alta resolución",
            "Biopsias guiadas por imagen",
            "Seguimiento personalizado post-tratamiento",
        ],
    },
    {
        title: "VPH Masculino",
        desc: "Detección y tratamiento integral.",
        video: "/videos/VPH Masculino.mp4",
        icon: "biotech",
        modalDescription:
            "El Dr. Alemán cuenta con amplia experiencia en la detección temprana y tratamiento del Virus del Papiloma Humano (VPH) en varones. Mediante penoscopía de alta resolución y técnicas de fulguración, identifica y elimina lesiones subclínicas y condilomas con precisión, previniendo complicaciones y reduciendo el riesgo de transmisión a la pareja.",
        highlights: [
            "Penoscopía de alta resolución",
            "Detección de lesiones subclínicas",
            "Fulguración y crioterapia de condilomas",
            "Tipificación viral por PCR",
            "Asesoría integral de pareja",
            "Seguimiento y prevención de recurrencias",
        ],
    },
    {
        title: "Urología Oncológica",
        desc: "Cáncer de riñón, próstata y vejiga.",
        video: "/videos/Urologia Oncologica.mp4",
        icon: "health_and_safety",
        modalDescription:
            "El Dr. Horacio Alemán brinda atención especializada en el diagnóstico y tratamiento quirúrgico de cánceres urológicos: riñón, próstata, vejiga y testículo. Su enfoque combina cirugía oncológica de precisión con técnicas mínimamente invasivas, priorizando la preservación funcional del paciente y trabajando de la mano con equipos multidisciplinarios.",
        highlights: [
            "Prostatectomía radical mínimamente invasiva",
            "Nefrectomía parcial conservadora de nefronas",
            "Cistectomía y reconstrucción urinaria",
            "Orquiectomía y cirugía testicular",
            "Diagnóstico temprano con biomarcadores",
            "Coordinación con oncología y radioterapia",
        ],
    },
];

export const MedicalServices = () => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedService) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedService]);

    return (
        <section className="py-20 lg:py-32 bg-[#00a63e] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-green-200/80 text-sm font-semibold tracking-[0.3em] uppercase mb-4">Especialidades</span>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">Servicios Médicos</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            service={service}
                            onClick={() => setSelectedService(service)}
                            learnMoreText="Saber más"
                        />
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </section>
    );
};

/* ─────────────── Service Card ─────────────── */
const ServiceCard = ({ service, onClick, learnMoreText }: { service: Service; onClick: () => void; learnMoreText: string }) => (
    <div
        onClick={onClick}
        className="group relative flex flex-col rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-green-900/40 hover:shadow-3xl aspect-[3/4]"
    >
        {/* Green accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Full card video background */}
        <video
            src={service.video}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

        {/* Glassmorphism overlay on hover */}
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/20 backdrop-blur-0 group-hover:backdrop-blur-[1px] transition-all duration-500 z-10" />

        {/* Content at bottom */}
        <div className="relative z-20 mt-auto p-6 flex flex-col space-y-3">
            <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 drop-shadow-lg">
                {service.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed drop-shadow-md">
                {service.desc}
            </p>
            <div className="pt-1">
                <span className="inline-flex items-center text-green-400 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300 drop-shadow-md">
                    {learnMoreText} <span className="material-icons-outlined text-base ml-1">arrow_forward</span>
                </span>
            </div>
        </div>
    </div>
);

/* ─────────────── Service Modal ─────────────── */
const ServiceModal = ({ service, onClose }: { service: Service; onClose: () => void; }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 400); // Wait for exit animation
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

            {/* Modal Content */}
            <div
                className={`relative z-10 w-full max-w-[1200px] max-h-[95vh] bg-[#030303] rounded-[2rem] lg:rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-12 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 lg:top-8 lg:right-8 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 group shadow-2xl"
                    aria-label="Volver"
                >
                    <span className="material-icons-outlined text-2xl group-hover:rotate-90 transition-transform duration-500">close</span>
                </button>

                {/* Main Two-column layout */}
                <div className="flex flex-col lg:flex-row h-full max-h-[95vh] overflow-y-auto lg:overflow-hidden">

                    {/* Left — Video Container */}
                    <div className="relative w-full lg:w-[45%] xl:w-1/2 flex-shrink-0 flex items-center justify-center p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#080808]">
                        {/* Dramatic glow behind video */}
                        <div className="absolute inset-0 bg-green-500/5 blur-[100px] pointer-events-none" />

                        <div className="relative w-full aspect-video lg:aspect-square rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black group/video">
                            {/* Inner vignette for premium look */}
                            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none opacity-50" />
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none opacity-50" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[1.5rem] lg:rounded-[2.5rem] pointer-events-none z-20" />

                            <video
                                src={service.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover/video:scale-105 transition-transform duration-[2s] ease-out"
                            />
                        </div>
                    </div>

                    {/* Right — Content */}
                    <div className="relative flex-1 p-6 md:p-8 lg:p-12 xl:p-16 overflow-y-auto custom-scrollbar flex flex-col bg-gradient-to-br from-[#0c0c0c] to-[#050505]">
                        <div className="max-w-2xl mx-auto w-full my-auto">

                            {/* Icon + Specialty Badge */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a63e]/20 to-[#00a63e]/5 border border-[#00a63e]/30 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,166,62,0.1)]">
                                    <span className="material-icons-outlined text-[#00a63e] text-3xl">{service.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-[#00a63e] text-xs font-black tracking-[0.25em] uppercase">
                                        Especialidad Médica
                                    </h4>
                                </div>
                            </div>

                            {/* Main Title */}
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
                                {service.title}
                            </h3>

                            {/* Divider Line */}
                            <div className="w-24 h-1 bg-gradient-to-r from-[#00a63e] to-emerald-400 rounded-full mb-8 shadow-[0_0_20px_rgba(0,166,62,0.5)]" />

                            {/* Description */}
                            <p className="text-gray-300/90 text-base md:text-lg leading-relaxed font-light mb-10">
                                {service.modalDescription}
                            </p>

                            {/* Detailed Treatments (2 Columns) */}
                            <div className="mb-12">
                                <h4 className="text-white text-sm font-bold tracking-[0.15em] uppercase flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                    <span className="material-icons-outlined text-[#00a63e]">verified</span>
                                    Tratamientos y Procedimientos
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    {service.highlights.map((item, i) => (
                                        <div
                                            key={i}
                                            className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00a63e]/30 hover:bg-[#00a63e]/[0.05] transition-all duration-300"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#00a63e]/10 border border-[#00a63e]/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-icons-outlined text-[#00a63e] text-[16px]">done</span>
                                            </div>
                                            <span className="text-gray-300 group-hover:text-white text-sm leading-relaxed transition-colors duration-300 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions CTA */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://wa.me/50495814040"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#00a63e] text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,166,62,0.4)] hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00a63e] to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="material-icons-outlined text-xl">calendar_month</span>
                                        Agendar Consulta
                                        <span className="material-icons-outlined text-base transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                                    </span>
                                </a>

                                <button
                                    onClick={handleClose}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 w-full sm:w-auto"
                                >
                                    Volver
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
