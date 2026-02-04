
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
    {
        image: "https://static.wixstatic.com/media/3743a7_e89fcbb615c945d7921a7d145c12c62b~mv2.jpg/v1/fill/w_1440,h_662,al_c,q_85,enc_avif,quality_auto/3743a7_e89fcbb615c945d7921a7d145c12c62b~mv2.jpg",
        title: "Urólogo – Endourólogo Avanzado",
        subtitle: "Especialista Certificado"
    },
    {
        image: "https://static.wixstatic.com/media/3743a7_dae1f6cad4cc4a6a9a164c8b3b3b63a7~mv2.jpg/v1/fill/w_1440,h_662,al_c,q_85,enc_avif,quality_auto/3743a7_dae1f6cad4cc4a6a9a164c8b3b3b63a7~mv2.jpg",
        title: "15 Años de Experiencia",
        subtitle: "Trayectoria Comprobada"
    },
    {
        image: "https://static.wixstatic.com/media/3743a7_70b819a283e54b3da749e63452cf8f25~mv2.jpg/v1/fill/w_1440,h_662,al_c,q_85,enc_avif,quality_auto/3743a7_70b819a283e54b3da749e63452cf8f25~mv2.jpg",
        title: "Extranjería en Urología y Endourología",
        subtitle: "Formación Internacional"
    }
];

export const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative h-[calc(100vh-5rem)] min-h-[600px] w-full overflow-hidden bg-gray-900 group">
            {/* Background Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        alt={slide.title}
                        className="w-full h-full object-cover opacity-60"
                        src={slide.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <div className="space-y-8 max-w-4xl transition-all duration-700 transform">
                    <div className="inline-flex items-center space-x-2 bg-green-700/20 backdrop-blur-sm border border-green-700/30 rounded-full px-5 py-2 mb-4 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-green-300 text-sm font-medium tracking-widest uppercase">
                            {slides[currentSlide].subtitle}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-2xl leading-tight min-h-[1.2em] animate-fade-in-up delay-100">
                        {slides[currentSlide].title}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto drop-shadow-lg animate-fade-in-up delay-200">
                        Brindando atención urológica integral y de vanguardia para mejorar su calidad de vida.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10 animate-fade-in-up delay-300">
                        <Link href="/app" className="px-8 py-4 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg shadow-xl shadow-green-900/40 transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2 ring-1 ring-green-600">
                            Agendar Cita
                            <span className="material-icons-outlined">calendar_month</span>
                        </Link>
                        <Link href="#about" className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                            Conocer más
                            <span className="material-icons-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 p-4 rounded-full bg-black/20 backdrop-blur-md text-white/70 hover:text-white hover:bg-green-700/80 transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                aria-label="Previous slide"
            >
                <span className="material-icons-outlined text-3xl">chevron_left</span>
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 p-4 rounded-full bg-black/20 backdrop-blur-md text-white/70 hover:text-white hover:bg-green-700/80 transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                aria-label="Next slide"
            >
                <span className="material-icons-outlined text-3xl">chevron_right</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full shadow-lg ${index === currentSlide
                                ? 'w-10 h-3 bg-green-500'
                                : 'w-3 h-3 bg-white/40 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
