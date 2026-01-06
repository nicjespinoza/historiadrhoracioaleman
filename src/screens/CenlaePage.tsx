import React from 'react';
import { NavbarCenlae } from './cenlae/NavbarCenlae';
import { HeroCenlae } from './cenlae/HeroCenlae';
import { ProfileCenlae } from './cenlae/ProfileCenlae';
import { ServicesCenlae } from './cenlae/ServicesCenlae';
import { FooterCenlae } from './cenlae/FooterCenlae';

const CenlaePage = () => {
    return (
        <div className="bg-white text-gray-700 min-h-screen flex flex-col font-sans">
            <NavbarCenlae />

            <main className="flex-grow w-full">
                <section id="hero">
                    <HeroCenlae />
                </section>

                <ProfileCenlae />

                <ServicesCenlae />
            </main>

            <FooterCenlae />
        </div>
    );
};

export default CenlaePage;
