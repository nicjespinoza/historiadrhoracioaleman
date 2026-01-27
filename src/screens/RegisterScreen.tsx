import React from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Patient } from '../types';
import { api } from '../../api';
import { calculateAge } from '../lib/helpers';
import { FloatingLabelInput } from '../components/premium-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../components/premium-ui/FloatingLabelSelect';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormData, getDefaultPatientValues } from '../schemas/patientSchemas';

interface RegisterScreenProps {
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

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

    // Watch birthDate to calculate age reactively
    const birthDate = watch('birthDate');
    const calculatedAge = birthDate ? calculateAge(birthDate) : '';

    const onSubmit = async (data: PatientFormData) => {
        const patientData: Patient = {
            id: '', // Backend will assign
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            ageDetails: calculateAge(data.birthDate),
            sex: data.sex,
            profession: data.profession,
            email: data.email,
            phone: data.phone,
            address: data.address,
            initialReason: data.initialReason,
            createdAt: new Date().toISOString(),
            registrationSource: 'manual',
            // New fields for clinical file
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
        <div className="min-h-screen py-6 px-4 flex items-center justify-center font-sans relative" style={{ backgroundColor: '#083c79' }}>
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[25%] bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-white/10 relative z-10">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                        <button
                            type="button"
                            onClick={() => navigate('/app/patients')}
                            className="bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-gray-600 transition-colors border-2 border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Ficha Clínica - Nuevo Paciente</h2>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Complete la información del expediente</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Row 1: Name & Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Nombre"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.firstName?.message}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Apellidos"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.lastName?.message}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                        </div>

                        {/* Row 2: Date, Age, Sex */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Controller
                                name="birthDate"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Fecha Nacimiento"
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.birthDate?.message}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <FloatingLabelInput
                                label="Edad"
                                value={calculatedAge}
                                readOnly
                                wrapperClassName="border-2 border-gray-900 bg-gray-100/50"
                                className="text-gray-500 cursor-not-allowed"
                                containerClassName="mb-0"
                            />
                            <Controller
                                name="sex"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelSelect
                                        label="Sexo"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        options={["Masculino", "Femenino"]}
                                        error={errors.sex?.message}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                        </div>

                        {/* Row 3: Civil Status, Religion, Occupation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Controller
                                name="civilStatus"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelSelect
                                        label="Estado Civil"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        options={["Soltero", "Casado", "Divorciado", "Viudo", "Unión Libre"]}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="religion"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Religión"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="occupation"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Ocupación"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                        </div>

                        {/* Row 4: Origin (Procedencia) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="origin"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Procedencia"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="companion"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Acompañante"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                        </div>

                        {/* Row 5: Email, Phone, Profession */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Email"
                                        type="email"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        error={errors.email?.message}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Teléfono"
                                        type="tel"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                            <Controller
                                name="profession"
                                control={control}
                                render={({ field }) => (
                                    <FloatingLabelInput
                                        label="Profesión"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        wrapperClassName="border-2 border-gray-900 bg-white"
                                        containerClassName="mb-0"
                                    />
                                )}
                            />
                        </div>

                        {/* Row 6: Address */}
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <FloatingLabelInput
                                    label="Dirección"
                                    as="textarea"
                                    rows={2}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    wrapperClassName="border-2 border-gray-900 bg-white"
                                    containerClassName="mb-0"
                                />
                            )}
                        />

                        {/* Row 7: Patient Type (Radio Buttons) */}
                        <div className="p-4 border-2 border-gray-900 rounded-xl bg-white">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Paciente</label>
                            <Controller
                                name="patientType"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                value="Historia Clinica"
                                                checked={field.value === 'Historia Clinica'}
                                                onChange={() => field.onChange('Historia Clinica')}
                                                className="w-5 h-5 text-[#083c79] border-2 border-gray-400 focus:ring-[#083c79] focus:ring-2"
                                            />
                                            <span className={`text-sm font-medium transition-colors ${field.value === 'Historia Clinica' ? 'text-[#083c79]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                Historia Clínica
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                value="Recetario"
                                                checked={field.value === 'Recetario'}
                                                onChange={() => field.onChange('Recetario')}
                                                className="w-5 h-5 text-[#083c79] border-2 border-gray-400 focus:ring-[#083c79] focus:ring-2"
                                            />
                                            <span className={`text-sm font-medium transition-colors ${field.value === 'Recetario' ? 'text-[#083c79]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                Recetario
                                            </span>
                                        </label>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Row 8: Initial Reason */}
                        <Controller
                            name="initialReason"
                            control={control}
                            render={({ field }) => (
                                <FloatingLabelInput
                                    label="Motivo de consulta (Inicial)"
                                    as="textarea"
                                    rows={3}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    wrapperClassName="border-2 border-gray-900 bg-white"
                                    containerClassName="mb-0"
                                />
                            )}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#083c79] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#062a54] mt-4 shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] border-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlus size={20} />
                            {isSubmitting ? 'Guardando...' : 'Guardar y Continuar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
