import React from 'react';
import { ArrowLeft, UserPlus, Calendar, ChevronDown } from 'lucide-react';
import { Patient } from '../types';
import { api } from '../../api';
import { calculateAge } from '../lib/helpers';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormData, getDefaultPatientValues } from '../schemas/patientSchemas';
import { cn } from '../lib/utils';

interface RegisterScreenProps {
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

// Custom internal components to match the specific "Green Capsule" design from the image
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-[#1a1a1a] font-bold text-base mb-2 px-1">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const GreenInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, { error?: string, as?: 'input' | 'textarea' } & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>>(({ className, error, as = 'input', ...props }, ref) => {
    const Component = as as any;
    return (
        <div className="w-full">
            <Component
                ref={ref}
                {...props}
                className={cn(
                    "w-full bg-[#448132] text-white placeholder-green-200/50 border-none rounded-2xl py-3 px-5 font-medium focus:ring-2 focus:ring-black outline-none transition-all",
                    as === 'textarea' ? "resize-none min-h-[50px] flex items-center" : "h-12",
                    error ? "ring-2 ring-red-500" : "",
                    className
                )}
            />
            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
        </div>
    );
});

const GreenSelect = React.forwardRef<HTMLSelectElement, { options: string[], error?: string } & React.SelectHTMLAttributes<HTMLSelectElement>>(({ options, error, className, ...props }, ref) => (
    <div className="relative w-full">
        <select
            ref={ref}
            {...props}
            className={cn(
                "w-full bg-[#448132] text-white appearance-none border-none rounded-2xl h-12 py-3 pl-5 pr-10 font-medium focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer",
                error ? "ring-2 ring-red-500" : "",
                className
            )}
        >
            <option value="" disabled className="bg-[#448132] font-bold">Seleccionar...</option>
            {options.map(opt => (
                <option key={opt} value={opt} className="bg-[#448132] text-white py-2">
                    {opt}
                </option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/80">
            <ChevronDown size={20} />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
    </div>
));

const CustomRadio = ({ label, value, checked, onChange }: { label: string, value: string, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center">
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="peer appearance-none w-5 h-5 border-2 border-[#448132] rounded-full checked:border-[#448132] transition-all"
            />
            <div className="absolute w-2.5 h-2.5 bg-[#448132] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
        </div>
        <span className={cn("text-sm font-bold transition-colors", checked ? "text-[#448132]" : "text-gray-600 group-hover:text-black")}>
            {label}
        </span>
    </label>
);

export const RegisterScreen = ({ setPatients }: RegisterScreenProps) => {
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: getDefaultPatientValues(),
        mode: 'onBlur'
    });

    const birthDate = watch('birthDate');
    const calculatedAge = birthDate ? calculateAge(birthDate) : '';

    const onSubmit = async (data: PatientFormData) => {
        const patientData: Patient = {
            id: '',
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            ageDetails: calculateAge(data.birthDate),
            sex: data.sex,
            profession: data.profession,
            email: data.email,
            phone: data.phone,
            address: data.address,
            initialReason: '', // Removed initialReason per user request
            createdAt: new Date().toISOString(),
            registrationSource: 'manual',
            civilStatus: data.civilStatus,
            occupation: data.occupation,
            religion: data.religion,
            origin: data.origin,
            companion: data.companion,
            patientType: data.patientType,
        };

        try {
            const createdPatient = await api.createPatient(patientData);
            setPatients(prev => [...prev, createdPatient]);
            navigate(`/app/history/${createdPatient.id}`);
        } catch (e) {
            console.error(e);
            alert("Error al guardar paciente");
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 flex items-center justify-center font-sans tracking-tight" style={{ backgroundColor: '#f0f7f0' }}>
            <div className="w-full max-w-[1100px] bg-white shadow-sm p-8 md:p-12 rounded-[2rem]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            type="button"
                            onClick={() => navigate('/app/patients')}
                            className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full text-gray-700 transition-all group"
                        >
                            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <h2 className="text-2xl font-black text-[#1a1a1a]">Registro de Paciente</h2>
                        <div className="w-10 h-10 bg-[#448132]/10 rounded-full flex items-center justify-center text-[#448132]">
                            <UserPlus size={20} />
                        </div>
                    </div>

                    {/* ROW 1: Nombre, Apellidos, Teléfono, Email */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <Label required>Nombres:</Label>
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} error={errors.firstName?.message} />
                                )}
                            />
                        </div>
                        <div>
                            <Label required>Apellidos:</Label>
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} error={errors.lastName?.message} />
                                )}
                            />
                        </div>
                        <div>
                            <Label>Teléfono:</Label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} type="tel" />
                                )}
                            />
                        </div>
                        <div>
                            <Label>Correo electrónico:</Label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} type="email" error={errors.email?.message} />
                                )}
                            />
                        </div>
                    </div>

                    {/* ROW 2: Fecha Nac, Edad, Sexo, Estado Civil */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="relative">
                            <Label required>Fecha nacimiento:</Label>
                            <Controller
                                name="birthDate"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <GreenInput {...field} type="date" error={errors.birthDate?.message} className="pr-12" />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" size={18} />
                                    </div>
                                )}
                            />
                        </div>
                        <div>
                            <Label>Edad:</Label>
                            <GreenInput value={calculatedAge} readOnly className="bg-gray-100 text-[#448132] font-bold" />
                        </div>
                        <div className="bg-white p-1">
                            <Label required>Sexo:</Label>
                            <Controller
                                name="sex"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex gap-4 py-3">
                                        <CustomRadio label="Femenino" value="Femenino" checked={field.value === 'Femenino'} onChange={() => field.onChange('Femenino')} />
                                        <CustomRadio label="Masculino" value="Masculino" checked={field.value === 'Masculino'} onChange={() => field.onChange('Masculino')} />
                                    </div>
                                )}
                            />
                        </div>
                        <div>
                            <Label>Estado Civil:</Label>
                            <Controller
                                name="civilStatus"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex gap-4 py-3">
                                        <CustomRadio label="Soltero" value="Soltero" checked={field.value === 'Soltero'} onChange={() => field.onChange('Soltero')} />
                                        <CustomRadio label="Casado" value="Casado" checked={field.value === 'Casado'} onChange={() => field.onChange('Casado')} />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* ROW 3: Ocupación, Religión, Procedencia */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Label>Ocupación:</Label>
                            <Controller
                                name="occupation"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} />
                                )}
                            />
                        </div>
                        <div>
                            <Label>Religión:</Label>
                            <Controller
                                name="religion"
                                control={control}
                                render={({ field }) => (
                                    <GreenSelect
                                        {...field}
                                        options={["Católica", "Evangélica", "Testigo de Jehová", "Mormón", "Ninguna", "Otra"]}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Label>Procedencia:</Label>
                            <Controller
                                name="origin"
                                control={control}
                                render={({ field }) => (
                                    <GreenSelect
                                        {...field}
                                        options={[
                                            "Boaco", "Carazo", "Chinandega", "Chontales", "Estelí",
                                            "Granada", "Jinotega", "León", "Madriz", "Managua",
                                            "Masaya", "Matagalpa", "Nueva Segovia", "RACCN",
                                            "RACCS", "Río San Juan", "Rivas"
                                        ]}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* ROW 4: Direccion */}
                    <div>
                        <Label>Dirección</Label>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <GreenInput {...field} as="textarea" rows={1} className="rounded-full" />
                            )}
                        />
                    </div>

                    {/* ROW 5: Acompañante, Tipo de Paciente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <Label>Acompañante:</Label>
                            <Controller
                                name="companion"
                                control={control}
                                render={({ field }) => (
                                    <GreenInput {...field} />
                                )}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label required>Tipo de paciente:</Label>
                            <Controller
                                name="patientType"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex gap-8 py-3">
                                        <CustomRadio label="Historia Clínica" value="Historia Clinica" checked={field.value === 'Historia Clinica'} onChange={() => field.onChange('Historia Clinica')} />
                                        <CustomRadio label="Recetario" value="Recetario" checked={field.value === 'Recetario'} onChange={() => field.onChange('Recetario')} />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#448132] text-white px-10 py-3.5 rounded-full font-black text-lg hover:bg-black transition-all flex items-center gap-3 shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={22} />
                                    Guardar y Continuar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
