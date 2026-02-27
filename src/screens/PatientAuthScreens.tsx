import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- LOGIN SCREEN ---
export const PatientLoginScreen = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn(email, password);
            const patients = await api.getPatients();
            const patient = patients.find(p => p.email === email);
            if (patient) {
                localStorage.setItem('currentPatient', JSON.stringify(patient));
                navigate('/app/patient/dashboard');
            } else {
                setError('Paciente no encontrado en el sistema');
            }
        } catch (err: any) {
            console.error(err);
            setError('Credenciales inválidas');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#083c79] p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative">

                {/* Cabecera Personalizada Login */}
                <div className="mb-8 relative">
                    {/* Botón Regresar - ESTILO SOLICITADO */}
                    <button
                        onClick={() => navigate('/')}
                        className="absolute right-0 top-0 p-2 -mr-2 text-[#083c79] hover:bg-[#083c79] hover:text-white rounded-full transition-colors duration-200"
                        title="Regresar al inicio"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex justify-center mb-6 pt-2">
                        <img
                            src="/images/logo-dr-horacio-aleman.png"
                            alt="Logo Dr. Horacio Alemán"
                            className="h-12 md:h-14 object-contain"
                        />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight text-center">
                        Portal Paciente
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-center">Acceda a su historial y citas</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className={inputClass}
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                className={inputClass}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>Ingresar <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        ¿No tiene cuenta?{' '}
                        <button onClick={() => navigate('/app/patient/register')} className="text-blue-600 font-bold hover:underline">
                            Regístrese aquí
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- REGISTER SCREEN ---
export const PatientRegisterScreen = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth(); // Asegúrate de que tu hook useAuth exponga 'currentUser' o 'deleteUser' si es posible, si no, usaremos la lógica estándar.

    // Estados del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // Estado para errores específicos de campos
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        phone: ''
    });

    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- VALIDACIONES ON BLUR (SOLO FORMATO - SIN BASE DE DATOS) ---
    // Quitamos la llamada a la API aquí para evitar el error "Missing permissions"

    const handleEmailBlur = () => {
        // Solo limpiamos errores visuales, la validación real de duplicado la hace Firebase Auth al enviar
        setFieldErrors(prev => ({ ...prev, email: '' }));
    };

    const handlePhoneBlur = () => {
        if (!formData.phone) return;
        setFieldErrors(prev => ({ ...prev, phone: '' }));

        // Validación Regex (Esto SÍ se puede hacer en tiempo real)
        const phoneRegex = /^\d{8,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            setFieldErrors(prev => ({ ...prev, phone: 'Mínimo 8 dígitos numéricos (ej: 50588888888)' }));
        }
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');
        setFieldErrors({ email: '', phone: '' });

        // 1. Validaciones previas locales
        if (formData.password !== formData.confirmPassword) {
            setGeneralError('Las contraseñas no coinciden');
            return;
        }
        if (formData.password.length < 6) {
            setGeneralError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Re-validar Regex de teléfono
        const phoneRegex = /^\d{8,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            setFieldErrors(prev => ({ ...prev, phone: 'Teléfono inválido. Solo números.' }));
            return;
        }

        setIsLoading(true);

        try {
            // 2. Intentamos crear el usuario en Auth
            // Si el correo existe, esta línea fallará automáticamente (auth/email-already-in-use)
            const userCredential = await signUp(formData.email, formData.password);
            const user = userCredential.user;

            // --- AHORA YA ESTAMOS LOGUEADOS ---
            // Tenemos permiso para leer la base de datos y verificar el teléfono

            try {
                // Verificación de Teléfono Duplicado
                // Nota: Idealmente usarías una query: api.getPatientsByPhone(phone)
                // Si usas getPatients() y filtras (como en tu código original), ahora funcionará porque tienes sesión.
                const allPatients = await api.getPatients();
                const phoneExists = allPatients.some(p => p.phone === formData.phone);

                if (phoneExists) {
                    // ROLLBACK: El teléfono ya existe, pero acabamos de crear el usuario en Auth.
                    // Debemos borrar el usuario de Auth para no dejar "registros fantasma".
                    await user.delete();
                    setFieldErrors(prev => ({ ...prev, phone: 'Este número de teléfono ya está registrado en el sistema.' }));
                    setIsLoading(false);
                    return; // Detenemos el proceso
                }

                // 3. Crear registro en Firestore (Si el teléfono está libre)
                const patientData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    registrationSource: 'online' as const,
                    isOnline: true,
                    birthDate: '',
                    ageDetails: '',
                    sex: 'Masculino' as const,
                    profession: '',
                    address: '',
                    initialReason: '',
                    createdAt: new Date().toISOString()
                };

                const createdPatient = await api.createPatient(patientData);
                localStorage.setItem('currentPatient', JSON.stringify(createdPatient));
                navigate('/app/patient/dashboard');

            } catch (dbError) {
                // Si falla la lectura o escritura en BD, intentamos borrar el usuario creado para limpiar
                console.error("Error en base de datos post-auth:", dbError);
                await user.delete().catch(e => console.log("No se pudo hacer rollback:", e));
                setGeneralError('Error de conexión al guardar sus datos. Intente nuevamente.');
            }

        } catch (err: any) {
            console.error('Registration error:', err);
            // Manejo de errores de Firebase Auth
            if (err.code === 'auth/email-already-in-use') {
                // Asignamos el error directamente al campo para que aparezca debajo del input
                setFieldErrors(prev => ({ ...prev, email: 'Este correo electrónico ya está registrado.' }));
            } else if (err.code === 'auth/weak-password') {
                setGeneralError('La contraseña es muy débil.');
            } else if (err.code === 'auth/requires-recent-login') {
                setGeneralError('Por seguridad, intente registrarse nuevamente.');
            } else {
                setGeneralError('Error al registrarse: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all";
    const errorInputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#083c79] p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100 relative">

                {/* Cabecera */}
                <div className="mb-8 relative">
                    <button
                        onClick={() => navigate('/app/patient/login')}
                        className="absolute right-0 top-0 p-2 -mr-2 text-[#083c79] hover:bg-[#083c79] hover:text-white rounded-full transition-colors duration-200"
                        title="Regresar al inicio de sesión"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex justify-center mb-6 pt-2">
                        <img
                            src="/images/logo-dr-horacio-aleman.png"
                            alt="Logo Dr. Horacio Alemán"
                            className="h-12 md:h-14 object-contain"
                        />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight text-center">
                        Registra tus datos
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    required
                                    className={inputClass}
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    required
                                    className={inputClass}
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    required
                                    className={fieldErrors.email ? errorInputClass : inputClass}
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    onBlur={handleEmailBlur}
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* TELEFONO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <div className="relative">
                                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    type="tel"
                                    required
                                    className={fieldErrors.phone ? errorInputClass : inputClass}
                                    placeholder="Ej: 50588888888"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    onBlur={handlePhoneBlur}
                                />
                            </div>
                            {fieldErrors.phone ? (
                                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.phone}</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1 ml-1">Solo números (Ej: 50588888888)</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`${inputClass} pr-12`}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`${inputClass} pr-12`}
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {generalError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 font-medium">
                            {generalError}
                        </div>
                    )}

                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-auto px-12 py-3 mx-auto bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Registrarse <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        ¿Ya tiene cuenta?{' '}
                        <button onClick={() => navigate('/app/patient/login')} className="text-blue-600 font-bold hover:underline">
                            Inicie Sesión aquí
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};