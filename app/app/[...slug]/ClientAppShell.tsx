'use client';

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('../../components/AppShell'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    )
});

export default function ClientAppShell() {
    return <AppShell />;
}
