import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Moon, Sun, Github, Zap, Atom, Database, Server, Code, Terminal,
    Layers, Cpu, Globe, Box, Settings, Smartphone, ChartBar,
    Shield, Activity, Share2, Wind, Anchor, FileCode, Check,
    Loader2, Shapes, Twitter, Linkedin, Instagram, Mountain, Languages
} from 'lucide-react';

// Translations
const translations = {
    en: {
        // Navbar
        projects: 'Projects',
        about: 'About',
        blog: 'Blog',
        accessSoft: 'Access Soft',
        contactMe: 'Contact Me',
        // Hero
        webDeveloper: 'Web Developer',
        heroDescription: 'Building performant, accessible, and beautiful web experiences. Focusing on the next generation of frontend architecture.',
        viewProjects: 'View Projects',
        // Features section
        redefiningExperience: 'Redefining digital experience',
        redefiningDescription: 'Leveraging modern architecture to deliver seamless, performant web applications.',
        responsiveDesign: 'Responsive Design',
        responsiveDescription: 'Building adaptive layouts that provide a seamless and accessible experience across all devices, from large desktops to modern smartphones.',
        backendDevelopment: 'Backend Development',
        backendDescription: 'Expertise in building robust and scalable server-side applications that ensure seamless data processing and superior performance.',
        richFeatures: 'Rich features',
        richFeaturesDescription: 'Leveraging modern web technologies for dynamic and interactive experiences.',
        optimizedBuild: 'Optimized build',
        optimizedDescription: 'Blazing fast performance and efficient code delivery through advanced build optimizations.',
        // Architecture section
        sharedFoundation: 'A shared foundation to build upon',
        flexibleArchitecture: 'Flexible architecture',
        flexibleDescription: 'Scalable and adaptable web solutions that can easily integrate new features and technologies, providing a robust foundation for growth.',
        robustApiDesign: 'Robust API design',
        robustApiDescription: 'Designed to be built on top of. Ensuring type safety and predictability across the entire stack.',
        advancedSSR: 'Advanced Server-Side Rendering',
        ssrDescription: 'Expertise in implementing server-side rendering for improved performance, SEO, and initial page load times, creating seamless user experiences.',
        cicd: 'Continuous Integration & Deployment',
        cicdDescription: 'Automated pipelines that continuously test and deploy changes, ensuring code stability and rapid delivery to production environments.',
        // Frameworks section
        poweringFrameworks: 'Powering your favorite',
        frameworksAndTools: 'frameworks and tools',
        poweringNextGen: 'Powering next-gen apps with',
        // Footer
        allRightsReserved: 'All rights reserved.',
    },
    es: {
        // Navbar
        projects: 'Proyectos',
        about: 'Acerca de',
        blog: 'Blog',
        accessSoft: 'Acceso Soft',
        contactMe: 'Contáctame',
        // Hero
        webDeveloper: 'Desarrollador Web',
        heroDescription: 'Construyendo experiencias web de alto rendimiento, accesibles y hermosas. Enfocado en la próxima generación de arquitectura Frontend y Backend.',
        viewProjects: 'Ver Proyectos',
        // Features section
        redefiningExperience: 'Redefiniendo la experiencia digital',
        redefiningDescription: 'Aprovechando la arquitectura moderna para entregar aplicaciones web fluidas y de alto rendimiento.',
        responsiveDesign: 'Diseño Responsivo',
        responsiveDescription: 'Construyendo diseños adaptables que brindan una experiencia fluida y accesible en todos los dispositivos, desde computadoras de escritorio hasta smartphones modernos.',
        backendDevelopment: 'Desarrollo Backend',
        backendDescription: 'Experiencia en la construcción de aplicaciones robustas y escalables del lado del servidor que garantizan un procesamiento de datos fluido y un rendimiento superior.',
        richFeatures: 'Funcionalidades Avanzadas',
        richFeaturesDescription: 'Aprovechando tecnologías web modernas para experiencias dinámicas e interactivas.',
        optimizedBuild: 'Compilación Optimizada',
        optimizedDescription: 'Rendimiento ultrarrápido y entrega eficiente de código a través de optimizaciones avanzadas de compilación.',
        // Architecture section
        sharedFoundation: 'Una base sólida para construir',
        flexibleArchitecture: 'Arquitectura Flexible',
        flexibleDescription: 'Soluciones web escalables y adaptables que pueden integrar fácilmente nuevas funcionalidades y tecnologías, proporcionando una base robusta para el crecimiento.',
        robustApiDesign: 'Diseño de API Robusto',
        robustApiDescription: 'Diseñado para ser construido sobre él. Garantizando seguridad de tipos y previsibilidad en toda la pila tecnológica.',
        advancedSSR: 'Renderizado del Lado del Servidor Avanzado',
        ssrDescription: 'Experiencia en implementar renderizado del lado del servidor para mejorar el rendimiento, SEO y tiempos de carga inicial, creando experiencias de usuario fluidas.',
        cicd: 'Integración y Despliegue Continuos',
        cicdDescription: 'Pipelines automatizados que prueban y despliegan cambios continuamente, asegurando la estabilidad del código y la entrega rápida a entornos de producción.',
        // Frameworks section
        poweringFrameworks: 'Potenciando tus',
        frameworksAndTools: 'frameworks y herramientas favoritas',
        poweringNextGen: 'Potenciando apps de nueva generación con',
        // Footer
        allRightsReserved: 'Todos los derechos reservados.',
    }
};

type Language = 'en' | 'es';

// Custom CSS Keyframes for Vite-style animations
const customStyles = `
    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    @keyframes glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(250,204,21,0.6)); }
        50% { filter: drop-shadow(0 0 35px rgba(250,204,21,0.9)); }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    .animate-gradient-text {
        animation: gradient-shift 4s ease-in-out infinite;
    }
    .animate-glow-pulse {
        animation: glow-pulse 2.5s ease-in-out infinite;
    }
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-float-delay-1 { animation: float 4s ease-in-out 0.5s infinite; }
    .animate-float-delay-2 { animation: float 4s ease-in-out 1s infinite; }
    .animate-float-delay-3 { animation: float 4s ease-in-out 1.5s infinite; }
    `;

// Particle Background Component
const ParticleBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const colors = isDark
            ? ['rgba(255,255,255,0.6)', 'rgba(34,211,238,0.6)', 'rgba(192,132,252,0.6)']
            : ['rgba(100,100,100,0.4)', 'rgba(6,182,212,0.5)', 'rgba(168,85,247,0.5)'];

        // Initialize particles
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < 50; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;

            particles.forEach((p, i) => {
                // Subtle mouse parallax
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    p.x -= dx * 0.002;
                    p.y -= dy * 0.002;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw lines between nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isDark ? `rgba(255,255,255,${0.1 * (1 - d / 120)})` : `rgba(100,100,100,${0.08 * (1 - d / 120)})`;
                        ctx.stroke();
                    }
                }
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        const handleMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouse);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(animationId);
        };
    }, [isDark]);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />;
};

export const LandingPage = () => {
    // Dark Mode Logic
    const [isDark, setIsDark] = useState(true);
    // Language state - default to Spanish
    const [language, setLanguage] = useState<Language>('es');
    const t = translations[language];

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);
    const toggleLanguage = () => setLanguage(language === 'es' ? 'en' : 'es');

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans min-h-screen flex flex-col relative transition-colors duration-300">
            {/* Inject Custom Styles */}
            <style>{customStyles}</style>

            {/* Particle Canvas Background */}
            <ParticleBackground isDark={isDark} />

            {/* Background Effects */}
            <div className="fixed inset-0 bg-mesh-dark opacity-80 pointer-events-none z-0"></div>
            <div className="fixed inset-0 bg-hero-glow pointer-events-none z-0"></div>

            {/* Decorative Lines */}
            <div className="line-container hidden md:block">
                <div className="glow-line left-0 origin-right"></div>
                <div className="glow-line left-0 origin-right"></div>
                <div className="glow-line left-0 origin-right"></div>
                <div className="glow-line left-0 origin-right"></div>
                <div className="glow-line left-0 origin-right"></div>
                <div className="particle left-[15%] top-[32%] animate-pulse"></div>
                <div className="absolute left-[15%] top-[34%] text-[10px] text-accent-blue opacity-70 font-mono hidden lg:block">.jsx</div>
                <div className="particle left-[22%] top-[41%] animate-pulse delay-75"></div>
                <div className="absolute left-[22%] top-[43%] text-[10px] text-accent-blue opacity-70 font-mono hidden lg:block">.ts</div>
                <div className="particle left-[18%] top-[69%] animate-pulse delay-150"></div>
                <div className="absolute left-[18%] top-[71%] text-[10px] text-accent-blue opacity-70 font-mono hidden lg:block">.css</div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <a className="text-xl font-bold tracking-tight flex items-center gap-2 group" href="#">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                        <span className="font-mono text-sm">&lt;/&gt;</span>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">JE.dev</span>
                </a>
                <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                    <a className="hover:text-primary transition-colors" href="#projects">{t.projects}</a>
                    <a className="hover:text-primary transition-colors" href="#about">{t.about}</a>
                    <a className="hover:text-primary transition-colors" href="#blog">{t.blog}</a>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors flex items-center gap-1"
                        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                    >
                        <Languages size={20} />
                        <span className="text-xs font-medium">{language.toUpperCase()}</span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        {isDark ? <Sun className="text-yellow-400" size={20} /> : <Moon size={20} />}
                    </button>
                    <a className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]" href="/app/doctor/login">
                        {t.accessSoft}
                    </a>
                    <a className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 transition-all backdrop-blur-sm border-white/10" href="#contact">
                        {t.contactMe}
                    </a>
                </div>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 py-20">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto space-y-8 relative mb-16">
                    {/* Floating Icons */}
                    <div className="absolute -left-12 top-0 p-3 rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-xl hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
                        <Atom className="text-blue-400" size={24} />
                    </div>
                    <div className="absolute -right-12 bottom-20 p-3 rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-xl hidden lg:block animate-bounce" style={{ animationDuration: '4s' }}>
                        <FileCode className="text-yellow-400" size={24} />
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
                        <span className="block text-slate-900 dark:text-white mb-2">Joseph Espinoza</span>
                        <span className="animate-gradient-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent block pb-2">{t.webDeveloper}</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t.heroDescription}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all duration-200 bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-[0_0_20px_rgba(167,139,250,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]" href="#projects">
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                            <span className="relative">{t.viewProjects}</span>
                        </a>
                        <a className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-lg dark:hover:shadow-slate-900/50" href="https://github.com" target="_blank" rel="noreferrer">
                            <Github className="mr-2" size={20} />
                            GitHub
                        </a>
                    </div>

                    <div className="mt-20 relative flex justify-center">
                        <div className="glow-card w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center relative z-20 group cursor-pointer transition-transform transform hover:scale-105">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500 drop-shadow-sm">
                                <Zap size={48} className="text-yellow-400 animate-glow-pulse" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px', maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)' }}>
                        </div>
                    </div>
                </div>

                {/* Features Grid 1 */}
                <div className="w-full max-w-7xl px-4 mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.redefiningExperience}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {t.redefiningDescription}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Recursive Components Card */}
                        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-end min-h-[400px] relative overflow-hidden group transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[inset_0_0_30px_rgba(34,211,238,0.08),0_0_20px_rgba(34,211,238,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10"></div>
                            <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center opacity-80 transition-transform duration-500 group-hover:scale-105">
                                <div className="relative w-full h-64 flex items-center justify-center">
                                    <div className="absolute top-6 right-0 w-56 h-36 bg-slate-900/90 border border-indigo-500/30 rounded-lg shadow-2xl flex flex-col p-2 backdrop-blur-sm transform rotate-6 group-hover:rotate-3 transition-all duration-500 origin-bottom-right">
                                        <div className="flex gap-1 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                        </div>
                                        <div className="flex gap-2 h-full">
                                            <div className="w-1/4 h-full bg-slate-800/50 rounded"></div>
                                            <div className="w-3/4 h-full bg-slate-800/50 rounded flex flex-col gap-2 p-1">
                                                <div className="w-full h-1/2 bg-slate-700/30 rounded"></div>
                                                <div className="flex gap-1 h-1/2">
                                                    <div className="w-1/2 bg-slate-700/30 rounded"></div>
                                                    <div className="w-1/2 bg-slate-700/30 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Middle Card */}
                                    <div className="absolute top-12 right-36 w-28 h-40 bg-slate-900/90 border border-purple-500/30 rounded-lg shadow-2xl flex flex-col p-2 backdrop-blur-md transform -rotate-3 group-hover:rotate-0 transition-all duration-500 z-10">
                                        <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto mb-2"></div>
                                        <div className="flex-1 bg-slate-800/50 rounded mb-1"></div>
                                        <div className="h-8 bg-slate-800/50 rounded w-full"></div>
                                    </div>
                                    {/* Front Card */}
                                    <div className="absolute top-24 right-52 w-16 h-32 bg-slate-900 border border-cyan-400/50 rounded-[0.5rem] shadow-[0_0_20px_rgba(34,211,238,0.3)] flex flex-col p-1.5 z-20 transform -rotate-12 group-hover:-rotate-6 transition-all duration-500">
                                        <div className="w-1/2 h-0.5 bg-slate-600 rounded-full mx-auto mb-1.5"></div>
                                        <div className="space-y-1.5 h-full">
                                            <div className="w-full h-12 bg-cyan-900/20 rounded border border-cyan-500/20"></div>
                                            <div className="w-full h-8 bg-cyan-900/20 rounded border border-cyan-500/20"></div>
                                        </div>
                                        <div className="mt-auto w-4 h-0.5 bg-slate-600 rounded-full mx-auto"></div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
                                </div>
                            </div>
                            <div className="relative z-20">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.responsiveDesign}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {t.responsiveDescription}
                                </p>
                            </div>
                        </div>

                        {/* Backend Development Card */}
                        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-end min-h-[400px] relative overflow-hidden group transition-all duration-500 hover:border-purple-500/40 hover:shadow-[inset_0_0_30px_rgba(192,132,252,0.08),0_0_20px_rgba(192,132,252,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10"></div>
                            <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center opacity-90 transition-transform duration-500 group-hover:scale-105">
                                <div className="absolute top-10 -right-10 w-[120%] h-64 bg-slate-900 border border-slate-700/50 rounded-xl p-4 shadow-2xl flex gap-4 rotate-[-5deg] opacity-80 scale-90">
                                    <div className="w-1/3 h-full bg-slate-800/50 rounded-lg p-3 space-y-2">
                                        <div className="h-2 bg-sky-500/40 rounded w-3/4"></div>
                                        <div className="h-2 bg-purple-500/40 rounded w-1/2"></div>
                                        <div className="h-2 bg-sky-500/40 rounded w-full"></div>
                                        <div className="h-2 bg-purple-500/40 rounded w-2/3"></div>
                                    </div>
                                    <div className="flex-1 h-full bg-slate-800/50 rounded-lg p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-500/20 to-transparent"></div>
                                        <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-sky-400 shadow-[0_0_10px_#38bdf8]"></div>
                                    </div>
                                </div>
                                <div className="absolute top-20 right-10 w-3/4 h-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 flex flex-col gap-3 z-10">
                                    <div className="flex gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="h-2 bg-accent-blue rounded w-1/2 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                                    <div className="h-2 bg-accent-purple rounded w-3/4 shadow-[0_0_10px_rgba(192,132,252,0.5)]"></div>
                                    <div className="h-2 bg-accent-blue rounded w-2/3 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                                    <div className="h-2 bg-accent-purple rounded w-1/3 shadow-[0_0_10px_rgba(192,132,252,0.5)]"></div>
                                </div>
                            </div>
                            <div className="relative z-20">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.backendDevelopment}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {t.backendDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid 2 */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-end min-h-[350px] relative overflow-hidden group col-span-1 md:col-span-2 transition-all duration-500 hover:border-yellow-500/40 hover:shadow-[inset_0_0_30px_rgba(250,204,21,0.06),0_0_15px_rgba(250,204,21,0.12)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111]/80 to-[#111] z-10 pointer-events-none"></div>
                            <div className="absolute inset-0 z-0 opacity-50 flex items-center justify-center">
                                <div className="grid grid-cols-4 gap-4 p-8 transform scale-110">
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-slate-500 text-2xl" />
                                    </div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>

                                    {/* CSS Box */}
                                    <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(56,189,248,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-600/10"></div>
                                        <span className="text-2xl font-bold text-blue-500 relative z-10">CSS</span>
                                        <span className="absolute top-1 left-1 text-[8px] font-bold text-slate-400">3</span>
                                    </div>

                                    {/* JS Box */}
                                    <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(250,204,21,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-yellow-500/10"></div>
                                        <span className="text-2xl font-bold text-yellow-400 relative z-10">JS</span>
                                    </div>

                                    {/* TS Box */}
                                    <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(56,189,248,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-400/10"></div>
                                        <span className="text-xl font-bold text-blue-400 relative z-10">TS</span>
                                    </div>

                                    {/* WA Box */}
                                    <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-purple-500/10"></div>
                                        <span className="text-xl font-bold text-purple-400 relative z-10">WA</span>
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-background-dark rounded-b-full z-20"></div>
                                    </div>

                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10 flex items-center justify-center">
                                        <Shapes className="text-orange-500/50 text-2xl" />
                                    </div>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 opacity-10"></div>
                                </div>
                            </div>
                            <div className="relative z-20 text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.richFeatures}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {t.richFeaturesDescription}
                                </p>
                            </div>
                        </div>

                        {/* Optimized build Card */}
                        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-end min-h-[350px] relative overflow-hidden group col-span-1 transition-all duration-500 hover:border-yellow-500/40 hover:shadow-[inset_0_0_30px_rgba(250,204,21,0.08),0_0_20px_rgba(250,204,21,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111]/80 to-[#111] z-10 pointer-events-none"></div>
                            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
                                <svg className="w-full h-full absolute top-0 left-0 scale-150 opacity-40" fill="none" height="100%" viewBox="0 0 400 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M-100 150 C 0 140, 400 140, 500 150" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"></path>
                                    <path d="M-100 180 C 0 170, 400 170, 500 180" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"></path>
                                    <path d="M-100 210 C 0 200, 400 200, 500 210" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"></path>
                                    <path d="M-100 240 C 0 230, 400 230, 500 240" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"></path>
                                </svg>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-0 flex items-center justify-center">
                                <Zap className="text-[6rem] text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.6)] animate-pulse w-32 h-32" style={{ animationDuration: '2s' }} />
                            </div>
                            <div className="relative z-20 text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.optimizedBuild}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {t.optimizedDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Architecture Section */}
                <div className="w-full max-w-7xl mt-24 mb-16 relative">
                    <div className="flex flex-col items-center justify-center mb-16 relative">
                        <div className="absolute top-0 transform -translate-y-16 opacity-30">
                            <div className="w-[2px] h-16 bg-gradient-to-b from-transparent via-purple-500 to-white mx-auto"></div>
                            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 shadow-[0_0_10px_white]"></div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white text-center">{t.sharedFoundation}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Flexible Architecture */}
                        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-slate-200 dark:border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none"></div>
                            <div className="h-64 w-full flex items-center justify-center relative mb-8">
                                <div className="relative w-40 h-40 transform rotate-45 bg-[#1a1a1a] border border-white/5 shadow-2xl z-10 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent"></div>
                                    <div className="transform -rotate-45">
                                        <Layers className="text-5xl text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)] w-16 h-16" />
                                    </div>
                                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/30 blur-xl rounded-full"></div>
                                </div>
                                <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1e293b] rounded border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] z-20 flex items-center justify-center animate-pulse">
                                    <div className="grid grid-cols-2 gap-0.5">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1e293b] rotate-45 border border-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.3)] z-20 flex items-center justify-center animate-pulse delay-300">
                                    <div className="w-2 h-2 bg-purple-400 rotate-45"></div>
                                </div>
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                                    <path className="opacity-60 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" d="M 120 128 L 180 150 L 230 128" fill="none" stroke="#22d3ee" strokeWidth="2"></path>
                                    <path className="opacity-60 drop-shadow-[0_0_5px_rgba(192,132,252,0.8)]" d="M 330 128 L 380 100 L 450 128" fill="none" stroke="#c084fc" strokeWidth="2"></path>
                                </svg>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.flexibleArchitecture}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {t.flexibleDescription}
                                </p>
                            </div>
                        </div>

                        {/* Robust API Design */}
                        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-slate-200 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-bl from-cyan-900/5 to-transparent pointer-events-none"></div>
                            <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/5 font-mono text-xs overflow-x-auto relative mb-8">
                                <div className="flex gap-1.5 mb-4 absolute top-4 left-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="pt-6 code-snippet text-slate-300">
                                    <p><span className="token comment">// Define typed interface</span></p>
                                    <p><span className="token keyword">interface</span> <span className="token function">APIResponse</span><span className="token keyword">&lt;T&gt;</span> {'{'}</p>
                                    <p className="pl-4">data: <span className="token keyword">T</span>;</p>
                                    <p className="pl-4">status: <span className="token keyword">number</span>;</p>
                                    <p className="pl-4">message?: <span className="token keyword">string</span>;</p>
                                    <p>{'}'}</p>
                                    <br />
                                    <p><span className="token keyword">async function</span> <span className="token function">fetchData</span>() {'{'}</p>
                                    <p className="pl-4"><span className="token keyword">const</span> res = <span className="token keyword">await</span> api.<span className="token function">get</span>(<span className="token string">'/users'</span>);</p>
                                    <p className="pl-4"><span className="token keyword">return</span> res.data;</p>
                                    <p>{'}'}</p>
                                </div>
                            </div>
                            <div className="relative z-10 text-center md:text-left mt-auto">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">{t.robustApiDesign}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed text-center">
                                    {t.robustApiDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Third Row */}
                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        {/* Server Side Rendering */}
                        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-slate-200 dark:border-white/10 flex flex-col relative overflow-hidden group col-span-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                            <div className="flex-grow flex items-center justify-center py-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#fde047] to-[#eab308] shadow-[0_0_30px_rgba(250,204,21,0.3)] flex items-center justify-center relative z-10 shrink-0">
                                        <span className="text-2xl font-bold text-yellow-900 font-mono">.JS</span>
                                    </div>
                                    <svg className="shrink-0 overflow-visible opacity-50" height="80" viewBox="0 0 40 80" width="40">
                                        <path d="M 0 40 C 20 40, 10 15, 40 15" fill="none" stroke="#64748b" strokeWidth="1.5"></path>
                                        <path d="M 0 40 C 20 40, 10 65, 40 65" fill="none" stroke="#64748b" strokeWidth="1.5"></path>
                                    </svg>
                                    <div className="flex flex-col gap-6 shrink-0">
                                        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            <div className="w-2 h-2 rounded-[2px] bg-[#fde047]"></div>
                                            <span className="text-[10px] font-mono text-slate-300">Client transform</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            <div className="w-2 h-2 rounded-[2px] bg-[#fde047]"></div>
                                            <span className="text-[10px] font-mono text-slate-300">Server transform</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.advancedSSR}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {t.ssrDescription}
                                </p>
                            </div>
                        </div>

                        {/* CI/CD */}
                        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-slate-200 dark:border-white/10 flex flex-col relative overflow-hidden group col-span-1 md:col-span-2">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-green-900/10 pointer-events-none"></div>
                            <div className="h-48 w-full relative mb-4 overflow-hidden flex flex-col justify-end">
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: 'rgba(34, 197, 94, 0)', stopOpacity: 0 }}></stop>
                                            <stop offset="100%" style={{ stopColor: 'rgba(34, 197, 94, 0.3)', stopOpacity: 1 }}></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M 50% -20 C 50% 30, 15% 30, 15% 85" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"></path>
                                    <path d="M 50% -20 C 50% 30, 32% 30, 32% 85" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"></path>
                                    <path d="M 50% -20 L 50% 85" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"></path>
                                    <path d="M 50% -20 C 50% 30, 68% 30, 68% 85" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"></path>
                                    <path d="M 50% -20 C 50% 30, 85% 30, 85% 85" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"></path>
                                </svg>
                                <div className="relative z-10 flex justify-around w-full px-4 md:px-12 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-[#051a0d] border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center text-green-500">
                                            <Check size={12} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.cicd}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
                                    {t.cicdDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Frameworks Grid */}
                    <div className="w-full mt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.poweringFrameworks}<br />{t.frameworksAndTools}</h2>
                        </div>
                        <div className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none z-0">
                                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '80px 80px', opacity: 0.2, maskImage: 'linear-gradient(to bottom, transparent, black, transparent)' }}></div>
                            </div>

                            {/* Grid Row 1 */}
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6 py-10">
                                {[
                                    { icon: Zap, color: 'text-yellow-400', shadow: 'rgba(250,204,21,0.6)', bg: 'from-yellow-500/10' },
                                    { icon: Atom, color: 'text-cyan-400', shadow: 'rgba(34,211,238,0.6)', bg: 'from-cyan-500/10' },
                                    { icon: Code, color: 'text-red-500', shadow: 'rgba(239,68,68,0.6)', bg: 'from-red-500/10' }, // Angular placeholder
                                    { icon: Shapes, color: 'text-green-500', shadow: 'rgba(34,197,94,0.6)', bg: 'from-green-500/10' }, // Vue placeholder
                                    { icon: Box, color: 'text-blue-400', shadow: 'rgba(96,165,250,0.6)', bg: 'from-blue-500/10' }, // Webpack/Cube
                                    { icon: FileCode, color: 'text-orange-500', shadow: 'rgba(249,115,22,0.6)', bg: 'from-orange-500/10' }, // HTML5 placeholder
                                    { icon: Activity, color: 'text-purple-500', shadow: 'rgba(168,85,247,0.6)', bg: 'from-purple-500/10' }, // Slack placeholder
                                    { icon: Terminal, color: 'text-white', shadow: 'rgba(255,255,255,0.6)', bg: 'from-gray-500/10' },
                                ].map((item, index) => (
                                    <div key={index} className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg relative group overflow-hidden transition-all duration-300 hover:scale-110 hover:border-white/20 ${index % 4 === 0 ? 'animate-float' : index % 4 === 1 ? 'animate-float-delay-1' : index % 4 === 2 ? 'animate-float-delay-2' : 'animate-float-delay-3'}`} style={{ animationDelay: `${index * 0.15}s` }}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        <item.icon className={`text-2xl md:text-3xl ${item.color} transition-all duration-300 group-hover:scale-110`} style={{ filter: `drop-shadow(0 0 15px ${item.shadow})` }} />
                                    </div>
                                ))}
                            </div>

                            {/* Grid Row 2 */}
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6 pb-10">
                                {[
                                    { icon: Settings, color: 'text-white', shadow: 'rgba(255,255,255,0.4)', bg: 'from-white/10' }, // Rust placeholder
                                    { icon: Mountain, color: 'text-emerald-400', shadow: 'rgba(52,211,153,0.6)', bg: 'from-emerald-500/10' },
                                    { icon: Wind, color: 'text-blue-300', shadow: 'rgba(147,197,253,0.6)', bg: 'from-blue-400/10' },
                                    { icon: Box, color: 'text-orange-300', shadow: 'rgba(253,186,116,0.6)', bg: 'from-orange-400/10' }, // Parcel/Box
                                    { icon: ChartBar, color: 'text-red-500', shadow: 'rgba(239,68,68,0.6)', bg: 'from-red-600/10' },
                                    { icon: Shield, color: 'text-green-600', shadow: 'rgba(22,163,74,0.6)', bg: 'from-green-600/10' }, // Vue/Mask
                                    { icon: FileCode, color: 'text-pink-500', shadow: 'rgba(236,72,153,0.6)', bg: 'from-pink-500/10' }, // Sass
                                    { icon: Share2, color: 'text-indigo-400', shadow: 'rgba(129,140,248,0.6)', bg: 'from-indigo-500/10' }, // Diagram
                                ].map((item, index) => (
                                    <div key={index} className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg relative group overflow-hidden transition-all duration-300 hover:scale-110 hover:border-white/20 ${index % 4 === 0 ? 'animate-float-delay-2' : index % 4 === 1 ? 'animate-float-delay-3' : index % 4 === 2 ? 'animate-float' : 'animate-float-delay-1'}`} style={{ animationDelay: `${index * 0.2}s` }}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        <item.icon className={`text-2xl md:text-3xl ${item.color} transition-all duration-300 group-hover:scale-110`} style={{ filter: `drop-shadow(0 0 15px ${item.shadow})` }} />
                                    </div>
                                ))}
                            </div>

                            {/* Grid Row 3 */}
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6 pb-10">
                                {[
                                    { icon: Server, color: 'text-red-500', shadow: 'rgba(239,68,68,0.6)', bg: 'from-red-500/10' }, // Laravel
                                    { icon: Activity, color: 'text-blue-600', shadow: 'rgba(37,99,235,0.6)', bg: 'from-blue-600/10' }, // Jira
                                    { icon: Globe, color: 'text-orange-600', shadow: 'rgba(234,88,12,0.6)', bg: 'from-orange-600/10' }, // Edge
                                    { icon: Activity, color: 'text-orange-500', shadow: 'rgba(249,115,22,0.6)', bg: 'from-orange-500/10' }, // Fire
                                ].map((item, index) => (
                                    <div key={index} className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg relative group overflow-hidden transition-all duration-300 hover:scale-110 hover:border-white/20 ${index % 2 === 0 ? 'animate-float-delay-1' : 'animate-float-delay-3'}`} style={{ animationDelay: `${index * 0.25}s` }}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        <item.icon className={`text-2xl md:text-3xl ${item.color} transition-all duration-300 group-hover:scale-110`} style={{ filter: `drop-shadow(0 0 15px ${item.shadow})` }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Logos */}
                <div className="mt-8 w-full max-w-5xl px-4">
                    <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-8">{t.poweringNextGen}</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex flex-col items-center gap-2 group">
                            <Atom className="text-3xl text-gray-400 group-hover:text-[#61DAFB] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">React</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group">
                            <Shapes className="text-3xl text-gray-400 group-hover:text-[#4FC08D] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">Vue</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group">
                            <FileCode className="text-3xl text-gray-400 group-hover:text-[#F7DF1E] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">Javascript</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group">
                            <Server className="text-3xl text-gray-400 group-hover:text-[#339933] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">Node.js</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group">
                            <Share2 className="text-3xl text-gray-400 group-hover:text-[#F05032] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">Git</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group">
                            <Anchor className="text-3xl text-gray-400 group-hover:text-[#2496ED] transition-colors" />
                            <span className="text-xs hidden group-hover:block absolute mt-10">Docker</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-slate-500 dark:text-slate-400 text-sm">
                        © 2023 Joseph Espinoza. {t.allRightsReserved}
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
                            <Twitter size={20} />
                        </a>
                        <a className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
                            <Linkedin size={20} />
                        </a>
                        <a className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
