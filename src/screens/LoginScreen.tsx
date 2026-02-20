import React, { useState, useEffect } from 'react';
import { ClipboardList, UserPlus, Mail, Lock } from 'lucide-react';
import { GlassCard } from '../components/premium-ui/GlassCard';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
    onLogin: (email: string) => void;
    onPatientAccess: () => void;
    initialRole?: 'clinic' | 'doctor';
}

export const LoginScreen = ({ onPatientAccess }: LoginScreenProps) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signIn(email, pass);
            // Login successful - AuthPage auth state listener or App wrapper will handle redirection
            // But here we rely on the parent logic or just letting the auth state change trigger updates
        } catch (err: any) {
            console.error(err);
            setError('Error al iniciar sesión: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#008237] p-4 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur opacity-20 transform rotate-1 scale-105"></div>
                <div className="bg-white/95 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#008237]"></div>

                    <div className="mb-12 flex justify-center">
                        <img
                            src="/images/logo-dr-horacio-aleman.png"
                            alt="Dr. Horacio Alemán"
                            className="h-20 md:h-24 w-auto object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium text-center border border-red-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <FloatingLabelInput
                                label="Correo Electrónico"
                                type="email"
                                required
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                icon={<Mail size={20} />}
                                error={error ? " " : undefined}
                                containerClassName="!mb-0"
                            />

                            <FloatingLabelInput
                                label="Contraseña"
                                type="password"
                                required
                                value={pass}
                                onChange={e => { setPass(e.target.value); setError(''); }}
                                icon={<Lock size={20} />}
                                error={error ? " " : undefined}
                                containerClassName="!mb-0"
                                showPasswordToggle
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-4.5 rounded-2xl font-bold shadow-xl shadow-green-900/10 hover:shadow-green-900/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                            >
                                <span>Ingresar al Sistema</span>
                                <span className="material-icons-outlined text-xl">login</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100/50 text-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-gray-400 hover:text-green-700 font-semibold transition-all duration-300 flex items-center justify-center gap-2 mx-auto px-6 py-2 rounded-xl hover:bg-green-50/50"
                        >
                            <span className="material-icons-outlined text-lg">arrow_back</span>
                            Regresar al inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
