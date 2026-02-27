import React from 'react';
import { Navbar } from './app/components/landing/Navbar';
import { HeroSection } from './app/components/landing/HeroSection';
import { ServicesCards } from './app/components/landing/ServicesCards';
import { AboutDoctor } from './app/components/landing/AboutDoctor';
import { EducationTimeline } from './app/components/landing/EducationTimeline';
import { MedicalServices } from './app/components/landing/MedicalServices';
import { ContactCTA } from './app/components/landing/ContactCTA';
import { MapSection } from './app/components/landing/MapSection';
import { Footer } from './app/components/landing/Footer';

export const LandingPage = () => {
    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
            <Navbar />
            <HeroSection />
            <ServicesCards />
            <AboutDoctor />
            <EducationTimeline />
            <MedicalServices />
            <ContactCTA />
            <MapSection />
            <Footer />
        </main>
    );
};

export default LandingPage;
