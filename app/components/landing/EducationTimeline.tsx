
export const EducationTimeline = () => {
    const educationList = [
        { icon: "school", title: "Doctorado en Medicina", desc: "Graduado de Título de Doctor en Medicina y Cirugía. Autónoma de Nicaragua UNAN-Managua." },
        { icon: "local_hospital", title: "Especialidad en Urología", desc: "Graduado de la Especialidad de Urología. Título Cirujano Urólogo Hospital Escuela Lenin Fonseca." },
        { icon: "public", title: "Experiencia Internacional", desc: "Extranjería en Urología y Endourología. Complejo Hospitalario Dr. Arnulfo Arias Madrid (CSS). Ciudad de Panamá." },
    ];

    return (
        <section className="py-20 bg-[#0a0a0a] transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-700/10 text-green-500">
                        Trayectoria Académica
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Educación y Experiencia</h2>
                    <div className="w-16 h-1 bg-green-700 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {educationList.map((item, index) => (
                        <div key={index} className="bg-[#111111] rounded-2xl p-8 shadow-2xl border border-white/5 hover:border-green-500/30 transition-all flex flex-col md:flex-row gap-6 group">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-xl bg-green-700/20 flex items-center justify-center text-green-500 group-hover:bg-green-700 group-hover:text-white transition-all duration-300">
                                    <span className="material-icons-outlined text-3xl">{item.icon}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
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
