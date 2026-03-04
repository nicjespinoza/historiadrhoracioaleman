
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    // Solo requerir export para producción, permitiendo desarrollo local en las rutas dinámicas sin errores
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    images: {
        unoptimized: true,
        qualities: [75, 90],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/v0/b/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
            },
            {
                protocol: 'https',
                hostname: 'static.wixstatic.com',
            }
        ],
    },
};

export default nextConfig;
