import ClientAppShell from './ClientAppShell';

export function generateStaticParams() {
    return [
        { slug: [] },
    ];
}

export const dynamic = 'force-static';

export default function AppSPACatchAll() {
    return <ClientAppShell />;
}
