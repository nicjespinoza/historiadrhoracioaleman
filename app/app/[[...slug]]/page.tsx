import ClientAppShell from './ClientAppShell';

export function generateStaticParams() {
    return [
        { slug: ['doctor', 'login'] },
        { slug: ['doctor', 'dashboard'] },
        { slug: ['patient', 'login'] },
        { slug: ['patient', 'dashboard'] },
        { slug: ['patient', 'register'] },
        { slug: ['patient', 'history'] },
        { slug: ['assistant', 'dashboard'] },
        { slug: ['patients'] },
        { slug: ['register'] },
        { slug: ['consult'] },
        { slug: ['history'] },
        { slug: ['agenda'] },
        { slug: ['reports'] },
        { slug: ['auth'] },
        { slug: ['payment', 'callback'] },
    ];
}

export const dynamic = 'force-static';
// export const dynamicParams = false;

export default function AppSPACatchAll() {
    return <ClientAppShell />;
}
