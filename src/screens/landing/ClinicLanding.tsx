import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    ShieldCheck,
    Activity,
    ArrowRight,
    Building2,
    Stethoscope,
    FileText
} from 'lucide-react';
import { GlassCard } from '../../components/premium-ui/GlassCard';
import { BentoGridItem } from '../../components/premium-ui/BentoGridItem';

export const ClinicLanding = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">
            {/* Navbar Placeholder */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-800 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-gray-900 text-lg">MediRecord Corp</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                    <a href="#" className="hover:text-teal-800 transition-colors">Soluciones</a>
                    <a href="#" className="hover:text-teal-800 transition-colors">Precios</a>
                    <a href="#" className="hover:text-teal-800 transition-colors">Empresa</a>
                </div>
                <Link to="/auth">
                    <button className="px-5 py-2 bg-white border border-gray-200 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                        Iniciar Sesión
                    </button>
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold mb-8 tracking-wide uppercase">
                        <Building2 size={12} /> Solución Enterprise
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        El Sistema Operativo <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-blue-800">
                            de tu Clínica.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Control total sobre operaciones, finanzas y atención al paciente.
                        Una plataforma unificada para escalar tu institución de salud.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button className="px-8 py-4 bg-teal-900 text-white rounded-xl font-bold text-lg hover:bg-teal-800 transition-all shadow-xl shadow-teal-900/20 flex items-center gap-2">
                            Agendar Demostración <ArrowRight size={20} />
                        </button>
                        <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">
                            Ver Casos de Éxito
                        </button>
                    </div>

                    {/* MacBook Mockup */}
                    <div className="relative mx-auto max-w-5xl">
                        {/* Screen Frame */}
                        <div className="bg-gray-900 rounded-t-[2rem] p-4 pb-0 shadow-2xl border-[1px] border-gray-800 mx-auto w-full aspect-[16/10] max-h-[600px] relative">
                            {/* Camera Dot */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>

                            {/* Screen Content */}
                            <div className="bg-white rounded-t-xl w-full h-full overflow-hidden relative flex">
                                {/* Sidebar */}
                                <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col p-4 gap-2">
                                    <div className="h-8 w-8 bg-teal-900 rounded-lg mb-6"></div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-10 w-full rounded-lg flex items-center px-3 gap-3 ${i === 1 ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}>
                                            <div className="w-5 h-5 rounded bg-current opacity-20"></div>
                                            <div className="h-2 w-20 bg-current opacity-20 rounded"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dashboard Area */}
                                <div className="flex-1 p-6 md:p-8 bg-gray-50/50 overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Panel General</h3>
                                            <p className="text-gray-500 text-sm">Resumen de actividad - Hospital Central</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm">Exportar Reporte</div>
                                            <div className="px-4 py-2 bg-teal-900 text-white rounded-lg text-sm font-medium shadow-sm">Nueva Admisión</div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        {[
                                            { label: "Pacientes Activos", val: "1,240", change: "+12%", color: "blue" },
                                            { label: "Ingresos Mensuales", val: "$450k", change: "+8%", color: "emerald" },
                                            { label: "Ocupación", val: "85%", change: "-2%", color: "orange" }
                                        ].map((m, i) => (
                                            <GlassCard key={i} className="p-5 bg-white/60">
                                                <p className="text-sm text-gray-500 font-medium mb-2">{m.label}</p>
                                                <div className="flex items-end justify-between">
                                                    <span className="text-3xl font-bold text-gray-900">{m.val}</span>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${m.color}-50 text-${m.color}-600`}>
                                                        {m.change}
                                                    </span>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>

                                    {/* Chart Area Mockup */}
                                    <div className="grid grid-cols-3 gap-6 h-64">
                                        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                            <div className="flex justify-between mb-6">
                                                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="flex items-end gap-4 h-40">
                                                {[40, 65, 45, 80, 55, 70, 60, 90].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-blue-50 rounded-t-lg relative group overflow-hidden">
                                                        <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500" style={{ height: `${h}%` }}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                            <div className="h-4 w-24 bg-gray-100 rounded mb-6"></div>
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                                        <div className="flex-1">
                                                            <div className="h-3 w-20 bg-gray-100 rounded mb-1"></div>
                                                            <div className="h-2 w-12 bg-gray-50 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* MacBook Base */}
                        <div className="bg-gray-800 h-4 md:h-6 rounded-b-xl mx-auto max-w-[102%] shadow-xl relative z-20">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gray-700 rounded-b-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-100/30 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-12 border-y border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
                        Confían en nosotros
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos */}
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Activity size={24} /> MedLife</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><ShieldCheck size={24} /> HealthGuard</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Building2 size={24} /> CityHospital</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Users size={24} /> CareGroup</div>
                    </div>
                </div>
            </section>

            {/* Features Scroll Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Potencia cada departamento</h2>
                    <p className="text-gray-600 max-w-2xl">Herramientas especializadas para administración, personal médico y recepción.</p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto pb-12 px-4 md:px-0 gap-6 max-w-7xl mx-auto snap-x hide-scrollbar">
                    <div className="min-w-[350px] md:min-w-[400px] snap-center">
                        <BentoGridItem
                            title="Historia Clínica Unificada"
                            description="Acceso centralizado a expedientes. Interoperabilidad total entre especialidades y sedes."
                            header={<div className="h-40 bg-blue-50 w-full flex items-center justify-center rounded-xl"><FileText className="text-blue-600 w-16 h-16 opacity-80" /></div>}
                            icon={<FileText className="text-blue-600" size={20} />}
                            className="h-full bg-white border-gray-200"
                        />
                    </div>
                    <div className="min-w-[350px] md:min-w-[400px] snap-center">
                        <BentoGridItem
                            title="Gestión de Roles Avanzada"
                            description="Permisos granulares para directores, médicos, enfermería y administrativos. Auditoría de accesos."
                            header={<div className="h-40 bg-teal-50 w-full flex items-center justify-center rounded-xl"><ShieldCheck className="text-teal-600 w-16 h-16 opacity-80" /></div>}
                            icon={<ShieldCheck className="text-teal-600" size={20} />}
                            className="h-full bg-white border-gray-200"
                        />
                    </div>
                    <div className="min-w-[350px] md:min-w-[400px] snap-center">
                        <BentoGridItem
                            title="Analítica Financiera"
                            description="Reportes en tiempo real de facturación, cuentas por cobrar y rentabilidad por departamento."
                            header={<div className="h-40 bg-indigo-50 w-full flex items-center justify-center rounded-xl"><TrendingUp className="text-indigo-600 w-16 h-16 opacity-80" /></div>}
                            icon={<TrendingUp className="text-indigo-600" size={20} />}
                            className="h-full bg-white border-gray-200"
                        />
                    </div>
                    <div className="min-w-[350px] md:min-w-[400px] snap-center">
                        <BentoGridItem
                            title="Portal de Pacientes"
                            description="Autogestión de citas, descarga de resultados y pagos en línea para reducir carga administrativa."
                            header={<div className="h-40 bg-orange-50 w-full flex items-center justify-center rounded-xl"><Users className="text-orange-600 w-16 h-16 opacity-80" /></div>}
                            icon={<Users className="text-orange-600" size={20} />}
                            className="h-full bg-white border-gray-200"
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">¿Listo para modernizar su institución?</h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Solicite una consultoría gratuita con nuestros expertos en transformación digital de salud.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-500 transition-all">
                            Agendar Demostración
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                            Contactar Ventas
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
