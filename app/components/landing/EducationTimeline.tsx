
export const EducationTimeline = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden border-t border-gray-200 dark:border-gray-800">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-700/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-700/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-green-700/10 text-green-700 text-xs font-bold tracking-wider uppercase mb-3">Trayectoria Académica</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Educación y Experiencia</h2>
                    <div className="w-20 h-1.5 bg-green-700 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-6 mb-20">
                    <EduItem icon="school" title="Doctorado en Medicina" desc="Graduado de Título de Doctor en Medicina y Cirugía. Autónoma de Nicaragua UNAN-Managua." />
                    <EduItem icon="local_hospital" title="Especialidad en Urología" desc="Graduado de la Especialidad de Urología. Título Cirujano Urólogo Hospital Escuela Lenin Fonseca." />
                    <EduItem icon="public" title="Experiencia Internacional" desc="Extranjería en Urología y Endourología. Complejo Hospitalario Dr. Arnulfo Arias Madrid (CSS). Ciudad de Panamá." />
                </div>

                <div className="bg-green-700 rounded-3xl p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-green-900"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
                        <Stat number="4000" label="Pacientes Atendidos" />
                        <Stat number="1500" label="Cirugías" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const EduItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex items-start gap-6 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{desc}</p>
        </div>
    </div>
);

const Stat = ({ number, label }: { number: string, label: string }) => (
    <div className="space-y-2">
        <div className="text-5xl md:text-6xl font-bold tracking-tight mb-2 flex justify-center items-baseline tabular-nums">
            {/* Need client side hydration for elaborate counters, keeping it simple for now */}
            <span>{number}</span>
            <span className="text-3xl text-green-300 ml-1">+</span>
        </div>
        <div className="h-1 w-16 bg-green-300/50 mx-auto rounded-full mb-4"></div>
        <p className="text-sm md:text-base font-medium tracking-widest uppercase text-green-50">{label}</p>
    </div>
);
