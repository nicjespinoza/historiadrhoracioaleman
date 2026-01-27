/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'lh3.googleusercontent.com',
            'flagcdn.com'
        ],
    },
    // Ensure we can handle the SPA route appropriately
    async rewrites() {
        return [
            {
                source: '/app/:path*',
                destination: '/app/index', // This might need adjustment based on how we structure the catch-all
            },
        ];
    },
};

export default nextConfig;
