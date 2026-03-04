
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Providers } from '../components/Providers';


export const metadata: Metadata = {
    title: 'Urología de Nicaragua - Dr. Horacio H. Alemán E.',
    description: 'Especialista en Urología y Endourología. Atención integral en Managua, Nicaragua.',
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning={true}>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sans antialiased" suppressHydrationWarning={true}>
                <div id="root">
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <Providers>
                            {children}
                        </Providers>
                    </NextIntlClientProvider>
                </div>
            </body>
        </html>
    );
}
