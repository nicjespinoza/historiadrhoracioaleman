
export const MedicalServices = () => {
    return (
        <section className="py-20 lg:py-24 bg-green-700 dark:bg-green-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase mb-3">Nuestras Especialidades</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Servicios Médicos</h2>
                    <div className="w-20 h-1.5 bg-white mx-auto rounded-full opacity-50"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <ServiceItem
                        title="Enfermedad Litiásica del Tracto Urinario"
                        desc="Manejo médico y quirúrgico de piedras renales, ureterales y vesicales"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCHtA-ZoVt_VBsO0JAVBvY4HzZ81g4MIA7zgIDjjGNYV5Fxiv_peHOOc4zfDx016E3vPpJpcoC3CgJxicQ-DsmlUoeQKwLwb7PNz7c5ah7Ww45rvxYv45j8wvMHhrwUUmNAgKTfGeUoOn2utzne0Vr3I8JqNLzZY4tHgV7tDHJFSrN9cmtc1cxs5hOlEmVa6Fj2EDefmzE2vBwGxqHiU4gJ3-FIhrcUch-lF3TPY_-3EyKx9fAnAisp3sBsn8WtcBAm8ywVP5CUmw_q"
                    />
                    <ServiceItem
                        title="Enfermedades de la próstata"
                        desc="Manejo médico y quirúrgico de enfermedades de la prostata"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCVYplkylSBJGXz6p2v8xffNKY0u8GKueMb21y_brFUSyD_EP1C20kddipTC8JXyea2j-HuJHqtC_G4VnDFYYROD9mecIwJt5orFKQc_7KVuk92Lt2u9eVWjUi9m6QMyK6PLdPqmTznSLS1Pvx4X-Pj5CyCJzoPSECUtBgR2Zmo0TryaRblzdH8c1e4UqDMS6A9ImM20mmrkwxkFi-RqcnPyJIGjajVmDg6Br98baIN4OwiK3uM8sT19dZaDdrykRDC7m5-VClkdqZk"
                    />
                    <ServiceItem
                        title="Virus Papiloma Humano"
                        desc="Manejo Integral del paciente masculino con Virus Papiloma Humano."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCPdvBwi8j_9kcEzKrMRl5Yq1xAlZ1yvCUnfkW4alYm0tKZBP2mSAzDdMtx8W3t217ZdxquPjmt8A3Qw8iEYFAaoPA5FN2q1e77RZce0pqdzcGPH_1eZg11nYO0utT8tLubqNH8j-i8dwyAlSbjwcLi3eweLMaUn9VUxVNEDq0vdO7n3E9FRXCN-LhaN0qEhP-LJr9GXFm3vEYJPdLYK5Wo4CGw24RRwYAZ7XTnsTSURZbmVp7CBbGdVjHJZ0XIbWKsHkAQMP76tHRi"
                    />
                    <ServiceItem
                        title="Enfermedad Oncológica"
                        desc="Manejo Integral del paciente masculino con Cáncer de Riñón, Próstata, Vejiga, Pene, testículo."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuAsfoxZCKnRiVOiQ3eu3uUJwPm4i-fgSQ7PuL3uy33U-s38imou6MTPnddJTo-T3plGepNAIPdOloCcelrzWV0zECSxrEmUPZ2Tzy0qUVFf6xBo1bzB7nfn3-0ubRm-Ec6boQJdhyrnWQcEVxqXBL2OPi0WnJfeN7aBh0skUw1Cs8YWitwDLmyG5-iQACwJOoCFcjRpw1csFbXYjNRqjPXFutGclXGW17OQYKapql2EI-iV-mUMdUsQ2JnZ1D4XV1NxK4uQfKBBJVaV"
                    />
                </div>
            </div>
        </section>
    );
};

const ServiceItem = ({ title, desc, image }: { title: string, desc: string, image: string }) => (
    <div className="flex flex-col sm:flex-row bg-[#111111] rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
        <div className="w-full sm:w-1/2 h-64 sm:h-auto relative overflow-hidden bg-white">
            <img
                alt={title}
                className="w-full h-full object-cover p-0 group-hover:scale-105 transition-transform duration-500"
                src={image}
            />
        </div>
        <div className="w-full sm:w-1/2 p-6 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);
