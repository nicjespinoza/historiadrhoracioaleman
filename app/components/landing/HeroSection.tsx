
import Link from 'next/link';

export const HeroSection = () => {
    return (
        <div className="relative h-[calc(100vh-5rem)] min-h-[600px] w-full overflow-hidden bg-gray-900">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Doctor in a modern clinic office"
                    className="w-full h-full object-cover opacity-60"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJdBbVbWL6FOASucolMRwJqidotceA7ZE3giW4utlUta06gEGo7gFMgH0HvzdAYBnR1cQ1ISrvLktgvpHGH8Zz9JbpD2Sbd5_7c0tC2zUkvhwxbAfRq0_zFAa7FQ1syy_rKXKTBAx3ckGn2x5h3O-rHqMNIHI5m3FGkN3fJURR_D37y3LBWCPCIkTzWyjLFQrYD0jiIc2IHDaKBtA9SI3KZcWPgCEJI-Lih8NzZG39GJVtjQxl-qPH7BTetKU3buH4FTfH2wiqBulO"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent dark:via-gray-900/80"></div>
            </div>

            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <div className="animate-fade-in-up space-y-6 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 bg-green-700/20 backdrop-blur-sm border border-green-700/30 rounded-full px-4 py-1.5 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                        <span className="text-green-300 text-sm font-medium text-white tracking-wide">Urología Especializada</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">
                        <span className="text-green-500 block mb-2">15 años</span>
                        de experiencia
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto drop-shadow-md">
                        Brindando atención urológica integral y de vanguardia para mejorar su calidad de vida.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link href="/app/register" className="px-8 py-4 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg shadow-xl shadow-green-700/30 transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                            Agendar Cita
                            <span className="material-icons-outlined">calendar_month</span>
                        </Link>
                        <Link href="#about" className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                            Conocer más
                            <span className="material-icons-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Carousel Controls Placeholders */}
            <button className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-green-700 transition-all group z-20 hidden md:block border border-white/20">
                <span className="material-icons-outlined text-3xl group-hover:-translate-x-1 transition-transform">chevron_left</span>
            </button>
            <button className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-green-700 transition-all group z-20 hidden md:block border border-white/20">
                <span className="material-icons-outlined text-3xl group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                <button className="w-3 h-3 rounded-full bg-green-500 transition-all transform scale-125"></button>
                <button className="w-3 h-3 rounded-full bg-white/40 hover:bg-white transition-all"></button>
                <button className="w-3 h-3 rounded-full bg-white/40 hover:bg-white transition-all"></button>
            </div>
        </div>
    );
};
