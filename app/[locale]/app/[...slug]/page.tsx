import ClientAppShell from './ClientAppShell';

export function generateStaticParams() {
    return [
        { slug: ['doctor', 'login'] },
        { slug: ['doctor', 'dashboard'] },
        { slug: ['patient', 'login'] },
        { slug: ['patient', 'dashboard'] },
        { slug: ['assistant', 'dashboard'] },
        { slug: ['patients'] }
    ];
}

export const dynamicParams = false;

export default function AppSPACatchAll() {
    return <ClientAppShell />;
}
