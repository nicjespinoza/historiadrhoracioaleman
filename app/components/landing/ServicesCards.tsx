
export const ServicesCards = () => {
    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24 relative z-30">
                    <ServiceCard
                        icon="medical_information"
                        title="Diagnóstico Preciso"
                        desc="Utilizamos tecnología de última generación para diagnósticos rápidos y certeros."
                    />
                    <ServiceCard
                        icon="monitor_heart"
                        title="Cirugía Mínimamente Invasiva"
                        desc="Procedimientos avanzados que aseguran una recuperación más rápida y menos dolorosa."
                    />
                    <ServiceCard
                        icon="health_and_safety"
                        title="Salud Preventiva"
                        desc="Programas de chequeo especializados para la detección temprana de enfermedades."
                    />
                </div>
            </div>
        </section>
    );
};

const ServiceCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:border-green-500/50 transition-all group">
        <div className="w-14 h-14 rounded-lg bg-green-700/10 flex items-center justify-center mb-6 group-hover:bg-green-700 group-hover:text-white transition-colors text-green-700">
            <span className="material-icons-outlined text-3xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{desc}</p>
        <a href="#" className="text-green-700 font-semibold flex items-center gap-1 text-sm hover:underline">
            Leer más <span className="material-icons-outlined text-sm">arrow_forward</span>
        </a>
    </div>
);
