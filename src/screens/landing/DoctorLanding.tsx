import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MessageCircle, Calendar, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { BentoGridItem } from '../../components/premium-ui/BentoGridItem';
import { GlassCard } from '../../components/premium-ui/GlassCard';
import { ActionPill } from '../../components/premium-ui/ActionPill';

export const DoctorLanding = () => {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50 opacity-70" />

                {/* Decorative Blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-emerald-200/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-bold mb-6 animate-fade-in-up">
                            <Star size={14} className="fill-teal-700" /> Nuevo: Asistente IA incluido
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                            Tu Consultorio, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                en tu Bolsillo.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Gestión inteligente para médicos independientes. Recupera tu tiempo y ofrece una experiencia premium a tus pacientes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/auth">
                                <button className="px-8 py-4 bg-[#FF7F50] text-white rounded-2xl font-bold text-lg hover:bg-[#FF6347] transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]">
                                    Empezar Prueba Gratis
                                </button>
                            </Link>
                            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                                Ver Demo
                            </button>
                        </div>
                    </div>

                    {/* Devices Visual */}
                    <div className="relative mt-16 flex flex-col md:flex-row items-end justify-center gap-8 md:gap-0 md:-space-x-16">

                        {/* Desktop Mockup (Left) */}
                        <div className="relative z-10 w-full max-w-3xl transform md:translate-x-0">
                            <div className="relative bg-gray-900 rounded-t-2xl p-2 pb-0 shadow-2xl border-4 border-gray-900">
                                {/* Screen */}
                                <div className="bg-gray-50 rounded-t-xl overflow-hidden h-[300px] md:h-[450px] w-full relative flex">
                                    {/* Sidebar Mockup */}
                                    <div className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 shrink-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30"></div>
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                                        <div className="w-6 h-6 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center"><Calendar size={14} /></div>
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                                    </div>
                                    {/* Main Content Mockup */}
                                    <div className="flex-1 p-6 md:p-8 overflow-hidden">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-8 w-48 bg-gray-800 rounded-lg"></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    IP Autorizada
                                                </div>
                                                <div className="w-10 h-10 bg-teal-100 rounded-full"></div>
                                            </div>
                                        </div>
                                        {/* Dashboard Grid Mockup */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="h-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg mb-2"></div>
                                                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                                <div className="w-8 h-8 bg-purple-50 rounded-lg mb-2"></div>
                                                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                                <div className="w-8 h-8 bg-orange-50 rounded-lg mb-2"></div>
                                                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-48 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                            <div className="flex gap-4 mb-4">
                                                <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                                                <div className="h-8 w-24 bg-gray-50 rounded-lg border border-gray-100"></div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
                                                <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Stand */}
                            <div className="mx-auto w-1/3 h-4 bg-gray-800"></div>
                            <div className="mx-auto w-1/2 h-2 bg-gray-800 rounded-t-lg shadow-2xl"></div>
                        </div>

                        {/* Phone Mockup (Right) */}
                        <div className="relative z-20 w-[280px] md:w-[320px] shrink-0 transform md:translate-y-12 md:-rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="relative bg-gray-900 rounded-[45px] p-3 shadow-2xl border-[6px] border-gray-900">
                                <div className="bg-white rounded-[35px] overflow-hidden h-[580px] relative">
                                    {/* Mockup Content: Agenda */}
                                    <div className="bg-gray-50 h-full p-5 pt-10">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">Hola, Dr.</h3>
                                                <p className="text-[10px] text-gray-500">Acceso Seguro Móvil</p>
                                            </div>
                                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">DP</div>
                                        </div>

                                        {/* Floating Glass Card inside Mockup */}
                                        <GlassCard className="mb-4 border-teal-100 shadow-teal-100/50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">09:00 AM</p>
                                                    <p className="text-xs text-gray-600">Consulta General</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Confirmada</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        <div className="space-y-3">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                                    <div className="text-xs font-bold text-gray-400">10:30</div>
                                                    <div className="h-6 w-1 bg-gray-100 rounded-full" />
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-xs">Paciente #{i + 1}</p>
                                                        <p className="text-[10px] text-gray-400">Seguimiento</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dynamic Island */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-black rounded-b-2xl" />
                                </div>
                            </div>

                            {/* Security Badge Floating */}
                            <div className="absolute -right-4 top-20 bg-white p-2 rounded-lg shadow-lg border border-gray-100 animate-bounce-slow">
                                <div className="bg-green-100 p-1.5 rounded-md text-green-600">
                                    <CheckCircle2 size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section (Bento Grid) */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que necesitas</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Diseñado específicamente para la práctica privada moderna. Sin complicaciones, sin papel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <BentoGridItem
                            title="Cero Papel"
                            description="Digitaliza expedientes, recetas y notas. Accede desde cualquier lugar de forma segura."
                            header={<div className="h-32 bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl w-full flex items-center justify-center"><Leaf className="text-emerald-600 w-12 h-12" /></div>}
                            icon={<Leaf className="text-emerald-500" size={20} />}
                            className="md:col-span-1"
                        />
                        <BentoGridItem
                            title="Chat Seguro"
                            description="Comunícate con tus pacientes sin compartir tu número personal. Estilo iMessage, profesional."
                            header={<div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl w-full flex items-center justify-center"><MessageCircle className="text-blue-600 w-12 h-12" /></div>}
                            icon={<MessageCircle className="text-blue-500" size={20} />}
                            className="md:col-span-1"
                        />
                        <BentoGridItem
                            title="Agenda Inteligente"
                            description="Recordatorios automáticos por WhatsApp para reducir el ausentismo hasta en un 40%."
                            header={<div className="h-32 bg-gradient-to-br from-purple-100 to-pink-50 rounded-xl w-full flex items-center justify-center"><Calendar className="text-purple-600 w-12 h-12" /></div>}
                            icon={<Calendar className="text-purple-500" size={20} />}
                            className="md:col-span-1"
                        />
                    </div>
                </div>
            </section>

            {/* Floating CTA */}
            <div className="fixed bottom-8 right-8 z-50">
                <Link to="/auth">
                    <button className="bg-[#FF7F50] hover:bg-[#FF6347] text-white p-4 rounded-full shadow-2xl shadow-orange-500/30 transition-all hover:scale-110 group">
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>
        </div>
    );
};
