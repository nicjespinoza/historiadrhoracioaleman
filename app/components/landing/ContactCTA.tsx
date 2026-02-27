
import Link from 'next/link';

export const ContactCTA = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row h-full">
                        <div className="relative w-full lg:w-3/5 h-[400px] lg:h-auto">
                            <img
                                alt="Consulta Médica"
                                className="absolute inset-0 w-full h-full object-cover"
                                src="/images/consultorio-urologico-01.jpg"
                            />
                        </div>
                        <div className="w-full lg:w-2/5 relative flex items-center bg-gray-900/10 lg:bg-transparent -mt-20 lg:mt-0 p-4 lg:p-0">
                            <div className="bg-green-700 p-8 lg:p-12 lg:-ml-20 rounded-2xl shadow-xl w-full relative z-10 text-white lg:my-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Hazme Cualquier Consulta</h2>
                                <p className="text-gray-100 text-lg mb-8 leading-relaxed opacity-90">
                                    Mi objetivo es brindarte una atención médica urológica integral con alta calidad, logrando resolver tu problema urológico.
                                </p>
                                <Link href="/app/register" className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors">
                                    Agendar cita
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
