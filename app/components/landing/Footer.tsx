
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-[#111827] text-white pt-20 pb-10 border-t border-gray-800 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-green-700 text-4xl">medical_services</span>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-tight tracking-tight">CONSULTORIO UROLÓGICO</span>
                                <span className="text-xs text-green-700 font-medium tracking-wide uppercase">Dr. Horacio H. Alemán E.</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Comprometidos con su salud y bienestar urológico. Ofrecemos diagnósticos precisos y tratamientos avanzados con un enfoque humano.
                        </p>
                        <SocialLinks />
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Enlaces Rápidos
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-green-700 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">chevron_right</span>Inicio</Link></li>
                            <li><Link href="#about" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">chevron_right</span>Sobre Mí</Link></li>
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">chevron_right</span>Servicios Médicos</a></li>
                            <li><Link href="/app/register" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">chevron_right</span>Agendar Cita</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Especialidades
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-green-700 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">medical_services</span>Litiasis Urinaria</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">monitor_heart</span>Salud Prostática</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">vaccines</span>VPH Masculino</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">biotech</span>Oncología Urológica</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-green-700 transition-colors flex items-center gap-2"><span className="material-icons-outlined text-base">healing</span>Cirugía Mínima Invasión</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Información de Contacto
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-green-700 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-green-700">
                                    <span className="material-icons-outlined text-sm">location_on</span>
                                </div>
                                <span className="text-gray-400 pt-1">Clínica Palermo, dos central 1c al lago, Consultorio Urológico</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-green-700">
                                    <span className="material-icons-outlined text-sm">call</span>
                                </div>
                                <a className="text-gray-400 hover:text-white transition-colors pt-0.5" href="tel:+50322220000">(+505) 8636-9169</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-green-700">
                                    <span className="material-icons-outlined text-sm">mail</span>
                                </div>
                                <a className="text-gray-400 hover:text-white transition-colors pt-0.5" href="mailto:horaciouro@gmail.com">horaciouro@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-green-700">
                                    <span className="material-icons-outlined text-sm">schedule</span>
                                </div>
                                <span className="text-gray-400 pt-0.5">Lun - Vie: 9:00 AM - 6:00 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Dr. Horacio H. Alemán E. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacidad</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Términos</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLinks = () => (
    <div className="flex space-x-4 pt-2">
        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
            </svg>
        </a>
        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-1.061 2.052c-2.593 0-2.905.01-3.924.057-1.018.047-1.57.218-1.936.361a2.915 2.915 0 00-1.08.703 2.915 2.915 0 00-.703 1.08c-.143.366-.314.918-.361 1.936-.047 1.019-.058 1.331-.058 3.924s.01 2.905.057 3.924c.047 1.018.218 1.57.361 1.936.257.665.618 1.17 1.08 1.632.463.462.967.823 1.632 1.08.366.143.918.314 1.936.361 1.019.047 1.331.058 3.924.058s2.905-.01 3.924-.057c1.018-.047 1.57-.218 1.936-.361a2.936 2.936 0 001.08-.703 2.936 2.936 0 00.703-1.08c.143-.366.314-.918.361-1.936.047-1.019.058-1.331.058-3.924s-.01-2.905-.057-3.924c-.047-1.018-.218-1.57-.361-1.936a2.936 2.936 0 00-.703-1.08 2.936 2.936 0 00-1.08-.703c-.366-.143-.918-.314-1.936-.361-1.019-.047-1.331-.058-3.924-.058zm0 3.737a5.275 5.275 0 015.275 5.275 5.275 5.275 0 01-5.275 5.275 5.275 5.275 0 015.275-5.275zm0 1.928a3.348 3.348 0 100 6.696 3.348 3.348 0 000-6.696zm6.814-4.238a1.284 1.284 0 110 2.568 1.284 1.284 0 010-2.568z" fillRule="evenodd"></path>
            </svg>
        </a>
        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all duration-300">
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
        </a>
    </div>
);
