        import React from 'react';
        import { motion } from 'framer-motion';
        // Asegúrate de que estas rutas sean correctas en tu proyecto
        import { NavbarCenlae } from './NavbarCenlae';
        import { FooterCenlae } from './FooterCenlae';

        // --- DATA ---
        const especialidades = [
        'Cirugía Endoscópica Gastrointestinal',
        'Endoscopia Diagnóstica y Terapéutica Avanzada',
        'Cirugía Laparoscópica Avanzada',
        'Ultrasonido Endoscópico',
        'Enteroscopia y Cápsula',
        ];

        const experienciaLaboral = [
        {
        titulo: 'Jefe de la Unidad de Endoscopia Gastrointestinal',
        lugar: 'Hospital Vivian Pellas. Nicaragua',
        periodo: '(2024 - Presente)',
        },
        {
        titulo: 'Cirujano Endoscopista y Laparoscopista Gastrointestinal',
        lugar: 'Hospital Vivian Pellas. Nicaragua',
        periodo: '(2018 - Presente)',
        },
        {
        titulo: 'Jefe de Cirugía General y Endoscopia',
        lugar: 'Hospital SUMEDICO. Nicaragua',
        periodo: '(2011 - 2016)',
        },
        {
        titulo: 'Cirujano General Adscrito',
        lugar: 'Hospital SUMEDICO y Hospital Vivian Pellas',
        periodo: '(2006 - 2009)',
        },
        {
        titulo: 'Médico General',
        lugar: 'Hospital Regional Juigalpa. Nicaragua',
        periodo: '(2000)',
        },
        ];

        const formacionAcademica = [
        { titulo: 'Postgrado en Enteroscopia y Cápsula Endoscópica', periodo: '(Mexico 2018)' },
        { titulo: 'Alta Especialidad de Ultrasonido Endoscópico', periodo: '(Mexico 2017 - 2018)' },
        { titulo: 'Capacitación y Perfeccionamiento en Cirugía Laparoscópica', periodo: '(Argentina 2016)' },
        { titulo: 'Perfeccionamiento en Endoscopia Terapéutica Avanzada', periodo: '(Chile 2011)' },
        { titulo: 'Perfeccionamiento en Endoscopia Gastrointestinal', periodo: '(Chile 2010 - 2011)' },
        { titulo: 'Especialidad en Cirugía General', periodo: '(Chile 2003 - 2006)' },
        { titulo: 'Postgrado en Cirugía General', periodo: '(Nicaragua 2001 - 2002)' },
        { titulo: 'Doctor en Medicina General', periodo: '(Nicaragua 1994 - 2000)' },
        ];

        const asociaciones = [
        {
        logo: 'https://static.wixstatic.com/media/3743a7_f51d7218aaf94bb780362b23a7807f5e~mv2.jpg/v1/crop/x_197,y_214,w_1727,h_1203/fill/w_494,h_310,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ASGE_FullLogo_Color-01.jpg',
        nombre: 'American Society for Gastrointestinal Endoscopy',
        },
        {
        logo: 'https://static.wixstatic.com/media/3743a7_81642efa46314d3f9985c4510b61f276~mv2.png/v1/fill/w_262,h_234,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/c73d9d55-0a79-3ea7-5146-1dcf6d78638d.png',
        nombre: 'European Society of Gastrointestinal Endoscopy',
        },
        {
        logo: 'https://static.wixstatic.com/media/3743a7_de7c47f5dbb5478f91f832cb62caa4bc~mv2.jpg/v1/fill/w_572,h_246,al_c,lg_1,q_80,enc_avif,quality_auto/Logo-SAGES-1.jpg',
        nombre: 'SAGES',
        },
        {
        logo: 'https://static.wixstatic.com/media/3743a7_4ab74f6e6814429e9200028497ee29c0~mv2.png/v1/fill/w_350,h_350,al_c,lg_1,q_85,enc_avif,quality_auto/8mUNQeGH_400x400.png',
        nombre: 'Asociación Argentina de Cirugía',
        },
        {
        logo: 'https://static.wixstatic.com/media/3743a7_ce72158a11c24a6abb86c0756a462f64~mv2.png/v1/crop/x_154,y_64,w_502,h_324/fill/w_510,h_300,al_c,lg_1,q_85,enc_avif,quality_auto/Allgemeine_Elektricit%C3%A4ts-Gesellschaft_(logo)_svg.png',
        nombre: 'Asociación Española de Gastroenterología',
        },
        ];

        // --- COMPONENTS ---

        // Timeline component optimizado para alineación perfecta
        const VerticalTimeline = ({ items }: { items: any[] }) => (
        <div className="relative border-l-2 border-white/30 ml-3 md:ml-4 my-2 py-2 space-y-10">
        {items.map((item, index) => (
        <div key={index} className="relative pl-8 md:pl-10 group">
            {/* Dot: Ajustado a -left-[7px] para centrarse perfectamente en el border de 2px */}
            <span className="absolute -left-[7px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-[#003366] shadow-[0_0_0_2px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-110"></span>
            
            <div className="flex flex-col text-white">
                <h4 className="font-bold text-lg leading-tight tracking-wide">{item.titulo}</h4>
                {item.lugar && <span className="text-sm font-medium text-blue-100/90 mt-1">{item.lugar}</span>}
                <span className="text-xs font-semibold mt-1 text-blue-200/80 uppercase tracking-wider">{item.periodo}</span>
            </div>
        </div>
        ))}
        </div>
        );

        export const DoctorProfilePage = () => {
        return (
        <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col antialiased">
        <NavbarCenlae activePage="perfil" />

        <main className="flex-grow">
            
        {/* 1. HERO SECTION: Foto y Texto Centrado */}
        <div className="bg-white pb-16 pt-10 md:pt-16">
        <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        {/* --- IMAGEN (Izquierda) --- */}
        {/* Ajustado a w-1/2 para que sea más grande y balanceado con el texto */}
        <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 flex justify-center md:justify-end"
        >
            {/* max-w-lg permite que la imagen crezca más */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-xl max-w-lg w-full">
                <img
                    src="https://static.wixstatic.com/media/3743a7_90a335f8fc184eac8b1a0df62401dba4~mv2.png/v1/crop/x_0,y_30,w_1086,h_522/fill/w_728,h_522,al_c,q_90,enc_avif,quality_auto/Dr%20Milton%20Mairena.png"
                    alt="Dr. Milton A. Mairena Valle"
                    className="w-full h-auto object-cover"
                />
            </div>
        </motion.div>

        {/* --- TEXTO (Derecha) --- */}
        
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full md:w-1/2 text-center flex flex-col items-center"
            >
                {/* Agregado whitespace-nowrap para forzar una sola línea */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#003366] mb-6 tracking-tight whitespace-nowrap">
                    Dr. Milton A. Mairena Valle
                </h1>
                
                <div className="space-y-2 text-gray-900 text-lg md:text-xl font-medium leading-relaxed">
                    {especialidades.map((esp, i) => (
                        <p key={i} className="block">
                            {esp}
                        </p>
                    ))}
                </div>
            </motion.div>

        </div>
        </div>
        </div>

                {/* Contenedor centralizado y más angosto para corregir el ancho excesivo */}
                <div className="container mx-auto px-4 max-w-5xl space-y-6 py-6">
                    
                   {/* 2. VISIÓN Y MISIÓN: Caja blanca más angosta dentro del fondo azul */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        // --- CAMBIO CLAVE AQUÍ ---
                        // Antes tenía poco padding (p-2 o p-3).
                        // Ahora usamos 'px-8 md:px-24' para darle mucho margen a los lados.
                        // Usamos 'py-6' para mantenerla relativamente corta de alto.
                        className="rounded-3xl overflow-hidden shadow-xl bg-[#003366] py-6 px-8 md:px-30"
                    >
                        {/* Caja Blanca Interna */}
                        {/* Ajusté el padding interno y el redondeado para que se vea bien con el nuevo espacio externo */}
                        <div className="bg-white rounded-2xl py-8 px-6 text-center shadow-inner">
                            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                                {/* Visión */}
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[#003366] uppercase mb-2">
                                        VISIÓN
                                    </h3>
                                    {/* max-w-xl ayuda a que el texto no se estire demasiado */}
                                    <p className="text-gray-900 font-medium leading-relaxed max-w-xl mx-auto text-sm md:text-base">
                                        Brindar a los pacientes la mejor calidad posible de atención medica en el campo de la Cirugía y Endoscopia Gastrointestinal
                                    </p>
                                </div>
                                
                                {/* Misión */}
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[#003366] uppercase mb-2">
                                        MISIÓN
                                    </h3>
                                    <p className="text-gray-900 font-medium leading-relaxed max-w-xl mx-auto text-sm md:text-base">
                                        Ofrecer soluciones mínimamente invasivas a los pacientes con enfermedades prevalente del aparato gastrointestinal de una forma segura, precisa y oportuna.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* 3. NÚMEROS: Caja con borde y botones azules */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-white border-2 border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg"
                    >
                        <h3 className="text-center text-xl md:text-2xl font-bold text-[#003366] mb-6 uppercase">
                            NÚMEROS QUE MUESTRAN MI COMPROMISO
                        </h3>
                        
                        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                            {/* Caja 1 */}
                            <div className="bg-[#003366] text-white py-4 px-6 rounded-lg text-center w-full md:w-64 shadow-md hover:scale-105 transition-transform">
                                <span className="block text-2xl font-bold mb-1">+ 15</span>
                                <span className="text-sm font-medium">Años de experiencia</span>
                            </div>
                            
                            {/* Caja 2 */}
                            <div className="bg-[#003366] text-white py-4 px-6 rounded-lg text-center w-full md:w-64 shadow-md hover:scale-105 transition-transform">
                                <span className="block text-2xl font-bold mb-1">+ 8,000</span>
                                <span className="text-sm font-medium">Procedimientos realizados</span>
                            </div>
                        </div>
                    </motion.section>

                

                    {/* 4. EXPERIENCIA LABORAL */}
                    <motion.section 
                         initial={{ opacity: 0, y: 40 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true, margin: "-100px" }}
                         className="rounded-3xl overflow-hidden shadow-2xl bg-[#003366] text-white flex flex-col"
                    >
                        <div className="p-8 text-center border-b border-white/10 bg-[#002b55]">
                            <h3 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">Experiencia Laboral</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 flex-grow">
                            {/* Left: Image (Full Height Fix) */}
                            <div className="relative min-h-[400px] h-full bg-gray-900">
                                <img 
                                    src="https://static.wixstatic.com/media/3743a7_f10bb11b6de74d199ebb7def67d6aa94~mv2.jpeg/v1/crop/x_509,y_0,w_478,h_724/fill/w_547,h_869,al_c,lg_1,q_85,enc_avif,quality_auto/3743a7_f10bb11b6de74d199ebb7def67d6aa94~mv2.jpeg" 
                                    alt="Experiencia Quirúrgica" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay md:mix-blend-normal md:opacity-100"
                                />
                                {/* Overlay para móvil para que el texto sea legible si decidieras ponerlo encima, aunque aquí está al lado */}
                                <div className="absolute inset-0 bg-[#003366]/20 md:hidden"></div> 
                            </div>
                            {/* Right: Timeline */}
                            <div className="p-8 md:p-12 lg:p-16 flex items-center bg-[#003366]">
                                <VerticalTimeline items={experienciaLaboral} />
                            </div>
                        </div>
                    </motion.section>

                    {/* 5. FORMACION ACADEMICA */}
                    <motion.section 
                         initial={{ opacity: 0, y: 40 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true, margin: "-100px" }}
                         className="rounded-3xl overflow-hidden shadow-2xl bg-[#003366] text-white flex flex-col"
                    >
                         <div className="p-8 text-center border-b border-white/10 bg-[#002b55]">
                            <h3 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">Formación Académica</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 flex-grow">
                             {/* Left: Timeline (Desktop) */}
                             <div className="p-8 md:p-12 lg:p-16 flex items-center bg-[#003366] order-2 md:order-1">
                                <VerticalTimeline items={formacionAcademica} />
                            </div>
                            {/* Right: Image */}
                            <div className="relative min-h-[400px] h-full bg-gray-900 order-1 md:order-2">
                                <img 
                                    src="https://static.wixstatic.com/media/3743a7_a889143c4ea74df69b1172b72aa4f59d~mv2.jpeg/v1/crop/x_281,y_0,w_350,h_768/fill/w_420,h_882,al_c,lg_1,q_85,enc_avif,quality_auto/213f1cc7-a54e-4035-b56f-5cee5b99ab17.jpeg" 
                                    alt="Formación Académica" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay md:mix-blend-normal md:opacity-100"
                                />
                            </div>
                        </div>
                    </motion.section>

                    {/* 6. ASOCIACIONES */}
                    <motion.section 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="py-12"
                    >
                        <h3 className="text-center text-2xl font-bold text-[#003366] mb-12 uppercase tracking-widest">
                            Asociaciones Médicas
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {asociaciones.map((asoc, index) => (
                                <div 
                                    key={index}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-48 flex flex-col items-center justify-center text-center group"
                                >
                                    <div className="h-20 flex items-center justify-center mb-4 w-full">
                                        <img 
                                            src={asoc.logo} 
                                            alt={asoc.nombre} 
                                            className="max-h-full max-w-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 group-hover:text-[#003366] transition-colors line-clamp-2">
                                        {asoc.nombre}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                </div>
            </main>

            <FooterCenlae />
        </div>
    );
};

export default DoctorProfilePage;