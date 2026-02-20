
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { ServicesCards } from './components/landing/ServicesCards';
import { AboutDoctor } from './components/landing/AboutDoctor';
import { EducationTimeline } from './components/landing/EducationTimeline';
import { MedicalServices } from './components/landing/MedicalServices';
import { ContactCTA } from './components/landing/ContactCTA';
import { MapSection } from './components/landing/MapSection';
import { Footer } from './components/landing/Footer';

// Define metadata for the page
export const metadata = {
    title: 'Consultorio Urológico - Dr. Horacio H. Alemán E.',
    description: 'Especialista en Urología y Endourología. Atención integral en San Salvador.',
};

export default function LandingPage() {
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
}
