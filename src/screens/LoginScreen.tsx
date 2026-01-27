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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 font-sans relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 transform rotate-1 scale-105"></div>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <div className="text-center mb-10">
                        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3">
                            <ClipboardList className="text-white w-10 h-10 -rotate-3" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">MediRecord Pro</h1>
                        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider">Acceso Profesional</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center border border-red-100 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
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
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] text-lg"
                        >
                            Ingresar al Sistema
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <button
                            onClick={onPatientAccess}
                            className="w-full group flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors duration-300"
                        >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <UserPlus size={20} />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors">Acceso para Pacientes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
