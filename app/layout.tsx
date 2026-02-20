
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Providers } from './components/Providers';


export const metadata: Metadata = {
    title: 'Consultorio Urológico - Dr. Horacio H. Alemán E.',
    description: 'Especialista en Urología y Endourología. Atención integral en San Salvador.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sans antialiased" suppressHydrationWarning={true}>
                <div id="root">
                    <Providers>
                        {children}
                    </Providers>
                </div>
            </body>
        </html>
    );
}
