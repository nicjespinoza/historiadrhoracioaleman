
export const AboutDoctor = () => {
    return (
        <section id="about" className="py-20 lg:py-28 bg-white dark:bg-gray-800 relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-700/10 text-green-700">
                                Conóceme
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                Dr. Horacio H. <br />
                                <span className="text-green-700">Alemán Escobar</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                                Con más de 15 años de experiencia, me dedico a ofrecer soluciones urológicas integrales. Mi enfoque combina la precisión técnica de la cirugía mínimamente invasiva con un trato humano y personalizado para cada paciente.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Feature icon="medical_services" title="Cirujano Urólogo" desc="Especialista Certificado" />
                            <Feature icon="science" title="Endourología" desc="Tecnología Avanzada" />
                            <Feature icon="school" title="Formación Continua" desc="Actualización Médica" />
                            <Feature icon="verified" title="Atención Integral" desc="Enfoque al Paciente" />
                        </div>

                        <div className="pt-2">
                            <a href="#" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-green-700 rounded-lg shadow-lg hover:bg-green-600 transition-all transform hover:-translate-y-1 group">
                                Acerca de mi
                                <span className="material-icons-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-700/20 to-transparent rounded-2xl transform translate-x-4 translate-y-4"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    alt="Dr. Horacio H. Alemán Escobar"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZHjS2vV7xOAZClGJARDw4L0o85OsyAO1bL569GrlhxNQ-fCtNDl3tMZrA30tl2DC2Ni462PUZN5-IIWm3wcdZH7-qFsmxjDDE1THnScp4ErBe4ZJzCb8fbjHCPxGi7Sv40tb7dDPldbaUno9MknmXYdkjwXDF4iK1EKzIND8RdJxHFTdYOIN8fFlKwU--1czOesHIDmufjhswHe4pRju5-G5MLG1H9fnszbm8Mu7SAJvKg4dTGJte8u6_LtY_mUrd3GI3125UAsZP"
                                />
                            </div>

                            <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-l-4 border-green-700 max-w-xs animate-fade-in-up">
                                <div className="flex items-center space-x-3">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="inline-block h-8 w-8 rounded-full bg-gray-300 ring-2 ring-white dark:ring-gray-800" />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-gray-900 dark:text-white font-bold">Pacientes Satisfechos</p>
                                        <div className="flex text-yellow-400 text-xs">
                                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-icons-outlined text-[14px]">star</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Feature = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0">
            <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-700/10 text-green-700">
                <span className="material-icons-outlined">{icon}</span>
            </span>
        </div>
        <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
    </div>
);
