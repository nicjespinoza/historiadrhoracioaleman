
import Image from 'next/image';

export const AboutDoctor = () => {
    return (
        <section id="about" className="py-20 lg:py-28 bg-white relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-700/10 text-green-700">
                                Conóceme
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                Dr. Horacio H. <br />
                                <span className="text-green-700">Alemán Escobar</span>
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl">
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
                        <div className="relative max-w-md mx-auto lg:ml-auto">
                            {/* Decorative Background Frame */}
                            <div className="absolute inset-0 bg-green-700/5 rounded-[2rem] transform translate-x-4 translate-y-4 -rotate-3 transition-transform group-hover:rotate-0 duration-700"></div>
                            <div className="absolute inset-0 border-2 border-green-700/20 rounded-[2rem] transform -translate-x-4 -translate-y-4 rotate-2 transition-transform group-hover:rotate-0 duration-700"></div>

                            {/* Main Image Container */}
                            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 ring-1 ring-gray-100 group">
                                <Image
                                    alt="Dr. Horacio H. Alemán Escobar"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                    src="/images/dr-horacio-h-aleman-escobar-urologo.jpg"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                                {/* Subtle Inner Glow Overlay */}
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem]"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
    </div>
);
