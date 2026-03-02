'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slidesData = [
    {
        image: "https://static.wixstatic.com/media/3743a7_e89fcbb615c945d7921a7d145c12c62b~mv2.jpg/v1/fill/w_1440,h_662,al_c,q_85,enc_avif,quality_auto/3743a7_e89fcbb615c945d7921a7d145c12c62b~mv2.jpg",
        title: "Dr. Horacio Alemán",
        subtitle: "Urólogo Cirujano"
    },
    {
        image: "https://static.wixstatic.com/media/3743a7_dae1f6cad4cc4a6a9a164c8b3b3b63a7~mv2.jpg/v1/fill/w_1440,h_662,al_c,q_85,enc_avif,quality_auto/3743a7_dae1f6cad4cc4a6a9a164c8b3b3b63a7~mv2.jpg",
        title: "Atención Médica Especializada",
        subtitle: "Urólogo Cirujano"
    }
];

export const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slidesData.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
    };

    return (
        <div className="relative h-[calc(100vh-5rem)] min-h-[600px] w-full overflow-hidden bg-gray-900 group">
            {/* Background Slides */}
            {slidesData.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className="relative w-full h-full">
                        <Image
                            alt={slide.title}
                            src={slide.image}
                            fill
                            className="object-cover opacity-80"
                            priority={index === 0}
                            quality={90}
                        />
                    </div>
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
                </div>
            ))}

            {/* Content — centered */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <div className="space-y-6 max-w-4xl transition-all duration-700 transform">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-tight min-h-[1.2em] animate-fade-in-up uppercase">
                        {slidesData[currentSlide].title}
                    </h1>

                    <div className="inline-flex items-center space-x-2 bg-green-700/20 backdrop-blur-md border border-green-400/30 rounded-full px-8 py-3 animate-fade-in-up delay-100 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-white text-sm md:text-base font-bold tracking-[0.3em] uppercase">
                            {slidesData[currentSlide].subtitle}
                        </span>
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
                {slidesData.map((_, index) => (
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
