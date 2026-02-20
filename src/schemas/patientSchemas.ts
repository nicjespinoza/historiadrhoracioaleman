import { z } from 'zod';

// ============================================
// Reusable Schema Building Blocks
// ============================================

/** Yes/No toggle (mutually exclusive) */
export const yesNoSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
});

/** Yes/No with N/A option */
export const yesNoNaSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    na: z.boolean().default(false),
});

/** Dynamic checkbox data (key-value pairs) */
export const checkboxDataSchema = z.record(z.string(), z.boolean());

/** Medical condition group with yes/no, conditions list, and other field */
export const conditionGroupSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    conditions: checkboxDataSchema.default({}),
    other: z.string().default(''),
});

// ============================================
// Vital Signs Schema
// ============================================

export const vitalSignsSchema = z.object({
    fc: z.string().default(''),  // Frecuencia Cardíaca
    fr: z.string().default(''),  // Frecuencia Respiratoria
    temp: z.string().default(''), // Temperatura
    pa: z.string().default(''),  // Presión Arterial
    pam: z.string().default(''), // Presión Arterial Media
    sat02: z.string().default(''), // Saturación O2
});

// ============================================
// Anthropometric Data Schema
// ============================================

export const anthropometricDataSchema = z.object({
    weight: z.string().default(''),
    height: z.string().default(''),
    imc: z.string().default(''),
});

// ============================================
// Patient Schema (RegisterScreen)
// ============================================

export const patientSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'Los apellidos son requeridos'),
    birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
<<<<<<< HEAD
    sex: z.enum(['Masculino', 'Femenino'] as const, {
        message: 'Seleccione el sexo',
=======
    sex: z.enum(['Masculino', 'Femenino'], {
        errorMap: () => ({ message: 'Seleccione el sexo' }),
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
    }),
    profession: z.string().default(''),
    email: z.string().email('Email inválido').or(z.literal('')).default(''),
    phone: z.string().default(''),
    address: z.string().default(''),
    initialReason: z.string().default(''),

    // New fields for clinical file
    civilStatus: z.string().default('Soltero'),
    occupation: z.string().default(''),
    religion: z.string().default(''),
    origin: z.string().default(''), // Procedencia
    companion: z.string().default(''), // Acompañante
    patientType: z.enum(['Historia Clinica', 'Recetario']).default('Historia Clinica'),
});

export type PatientFormData = z.infer<typeof patientSchema>;

// ============================================
// Physical Exam Schema (Legacy)
// ============================================

export const systemExamSchema = z.object({
    normal: z.boolean().default(false),
    abnormal: z.boolean().default(false),
    description: z.string().default(''),
});

export const physicalExamSchema = z.object({
    fc: z.string().default(''),
    fr: z.string().default(''),
    temp: z.string().default(''),
    pa: z.string().default(''),
    pam: z.string().default(''),
    sat02: z.string().default(''),
    weight: z.string().default(''),
    height: z.string().default(''),
    imc: z.string().default(''),
    systems: z.record(z.string(), systemExamSchema).default({}),
});

// ============================================
// Gyneco-Obstetric Schema
// ============================================

export const gynecoSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    na: z.boolean().default(false),
    conditions: checkboxDataSchema.default({}),
    other: z.string().default(''),
    g: z.string().default(''),
    p: z.string().default(''),
    a: z.string().default(''),
    c: z.string().default(''),
    surgeries: z.string().default(''),
    gestationalDiabetes: yesNoSchema.default({ yes: false, no: false }),
    preeclampsia: yesNoSchema.default({ yes: false, no: false }),
    eclampsia: yesNoSchema.default({ yes: false, no: false }),
    pregnancySuspicion: yesNoNaSchema.default({ yes: false, no: false, na: false }),
    breastfeeding: yesNoNaSchema.default({ yes: false, no: false, na: false }),
});

// ============================================
// Medications & Other Antecedents
// ============================================

export const regularMedsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
    other: z.string().default(''),
    specific: z.string().default(''),
});

export const naturalMedsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    description: z.string().default(''),
});

export const hospitalizationsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    reason: z.string().default(''),
});

export const surgeriesSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: z.string().default(''),
});

export const endoscopySchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: z.string().default(''),
    results: z.string().default(''),
});

export const complicationsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: z.string().default(''),
});

export const implantsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    which: z.string().default(''),
});

export const devicesSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    which: z.string().default(''),
});

// ============================================
// Allergies
// ============================================

export const allergiesSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
    other: z.string().default(''),
});

export const foodIntolerancesSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
});

// ============================================
// Non-Pathological Antecedents
// ============================================

export const habitsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
    other: z.string().default(''),
});

export const transfusionsSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    reactions: z.boolean().default(false),
    which: z.string().default(''),
});

export const exposuresSchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
    other: z.string().default(''),
});

// ============================================
// Family History
// ============================================

export const familyHistorySchema = z.object({
    yes: z.boolean().default(false),
    no: z.boolean().default(false),
    list: checkboxDataSchema.default({}),
    other: z.string().default(''),
});

// ============================================
// Obesity History (Optional)
// ============================================

<<<<<<< HEAD

=======
export const obesityHistorySchema = z.object({
    weightGainOnset: z.object({
        childhood: z.boolean().default(false),
        youth: z.boolean().default(false),
        pregnancy: z.boolean().default(false),
        menopause: z.boolean().default(false),
        postEvent: z.boolean().default(false),
        when: z.string().default(''),
    }),
    familyObesity: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        who: z.string().default(''),
    }),
    familyPathologies: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        who: z.string().default(''),
    }),
    previousTreatments: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        which: z.string().default(''),
    }),
    previousMeds: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        which: z.string().default(''),
    }),
    maxWeight: z.string().default(''),
    minWeight: z.string().default(''),
    reboundCause: z.string().default(''),
    previousActivity: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        which: z.string().default(''),
    }),
    currentActivity: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        which: z.string().default(''),
    }),
    qualityOfLifeAlteration: z.object({
        yes: z.boolean().default(false),
        no: z.boolean().default(false),
        how: z.string().default(''),
    }),
    metrics: z.object({
        height: z.string().default(''),
        currentWeight: z.string().default(''),
        currentImc: z.string().default(''),
        lostWeight: z.string().default(''),
        lostOverweightPercentage: z.string().default(''),
        lostImcExcessPercentage: z.string().default(''),
        desiredWeight: z.string().default(''),
        desiredImc: z.string().default(''),
    }),
}).optional();
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99

// ============================================
// Initial History Schema (InitialHistoryScreen)
// ============================================

export const initialHistorySchema = z.object({
    id: z.string(),
    patientId: z.string(),
    date: z.string(),
    time: z.string(),

    // Motives
    motives: checkboxDataSchema.default({}),
    otherMotive: z.string().default(''),
    evolutionTime: z.string().default(''),
    historyOfPresentIllness: z.string().default(''),

    // ============================================
    // Antecedentes Patológicos (Flat Booleans)
    // ============================================
    diabetes: z.boolean().default(false),
    hypertension: z.boolean().default(false),
    cardiopathy: z.boolean().default(false),
    allergies: z.boolean().default(false),
    surgeries: z.boolean().default(false),
    otherPathological: z.string().default(''),

    // ============================================
    // Antecedentes No Patológicos (Flat Booleans)
    // ============================================
    smoking: z.boolean().default(false),
    alcohol: z.boolean().default(false),
    drugs: z.boolean().default(false),
    medications: z.boolean().default(false),

    // ============================================
    // Examen Físico y Notas (Strings)
    // ============================================
    currentIllnessHistory: z.string().default(''),
    physicalExamGeneral: z.string().default(''),
    abdomen: z.string().default(''),
    tdr: z.string().default(''), // Tórax y Respiratorio
    genitals: z.string().default(''),
    limbs: z.string().default(''), // Miembros
    neurological: z.string().default(''),
    assessment: z.string().default(''), // Avaluo
    diagnosis: z.string().default(''),
    labStudies: z.string().default(''),
    examOrders: z.string().default(''),
    radiologyStudies: z.string().default(''),

    // ============================================
    // Vital Signs
    // ============================================
    vitalSigns: vitalSignsSchema.default({
        fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '',
    }),
    anthropometrics: anthropometricDataSchema.default({
        weight: '', height: '', imc: '',
    }),

    // ============================================
    // Legacy fields (kept for backward compatibility)
    // ============================================
    preExistingDiseases: yesNoSchema.optional(),
    neurologicalLegacy: conditionGroupSchema.optional(),
    metabolic: conditionGroupSchema.optional(),
    respiratory: conditionGroupSchema.optional(),
    cardiac: conditionGroupSchema.optional(),
    gastro: conditionGroupSchema.optional(),
    hepato: conditionGroupSchema.optional(),
    peripheral: conditionGroupSchema.optional(),
    hematological: conditionGroupSchema.optional(),
    renal: conditionGroupSchema.optional(),
    rheumatological: conditionGroupSchema.optional(),
    infectious: conditionGroupSchema.optional(),
    psychiatric: conditionGroupSchema.optional(),

    // Gyneco (Legacy)
    gyneco: gynecoSchema.optional(),

    // Medications & Other (Legacy)
    regularMeds: regularMedsSchema.optional(),
    naturalMeds: naturalMedsSchema.optional(),
    hospitalizations: hospitalizationsSchema.optional(),
    surgeriesDetail: surgeriesSchema.optional(),
    endoscopy: endoscopySchema.optional(),
    complications: complicationsSchema.optional(),

    // Allergies (Legacy)
    allergiesDetail: allergiesSchema.optional(),
    foodAllergies: allergiesSchema.optional(),
    foodIntolerances: foodIntolerancesSchema.optional(),

    // Implants (Legacy)
    implants: implantsSchema.optional(),
    devices: devicesSchema.optional(),

    // Non-Pathological (Legacy)
    habits: habitsSchema.optional(),
    transfusions: transfusionsSchema.optional(),
    exposures: exposuresSchema.optional(),

    // Family (Legacy)
    familyHistory: familyHistorySchema.optional(),
    familyGastro: familyHistorySchema.optional(),

    // Legacy Physical Exam
    physicalExam: physicalExamSchema.optional(),

    isValidated: z.boolean().default(true),

    // Optional: Obesity History
<<<<<<< HEAD
=======
    obesityHistory: obesityHistorySchema,
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
});

export type InitialHistoryFormData = z.infer<typeof initialHistorySchema>;

// ============================================
// Subsequent Consult Schema
// ============================================

export const subsequentConsultSchema = z.object({
    id: z.string(),
    patientId: z.string(),
    date: z.string(),
    time: z.string(),

    motives: checkboxDataSchema.default({}),
    otherMotive: z.string().default(''),
    evolutionTime: z.string().default(''),
    historyOfPresentIllness: z.string().default(''),

    // ============================================
    // Vital Signs (same as InitialHistory)
    // ============================================
    vitalSigns: vitalSignsSchema.default({
        fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '',
    }),
    anthropometrics: anthropometricDataSchema.default({
        weight: '', height: '', imc: '',
    }),

    // ============================================
    // Examen Físico y Notas (same as InitialHistory)
    // ============================================
    physicalExamGeneral: z.string().default(''),
    abdomen: z.string().default(''),
    tdr: z.string().default(''), // Tórax y Respiratorio
    genitals: z.string().default(''),
    limbs: z.string().default(''), // Miembros
    neurological: z.string().default(''),
    assessment: z.string().default(''), // Avaluo
    diagnosis: z.string().default(''),
    labStudies: z.string().default(''),
    examOrders: z.string().default(''),
    radiologyStudies: z.string().default(''),

    // Legacy fields
    physicalExam: physicalExamSchema.optional(),
    labs: z.object({
        performed: yesNoSchema,
        results: z.string().default(''),
    }).optional(),
    comments: z.string().optional(),
    diagnoses: z.array(z.string()).optional(),

    treatment: z.object({
        food: z.string().default(''),
        meds: z.array(z.string()).default([]),
        exams: z.array(z.string()).default([]),
        norms: z.array(z.string()).default([]),
    }).optional(),
});

export type SubsequentConsultFormData = z.infer<typeof subsequentConsultSchema>;

// ============================================
// Default Values Factory
// ============================================

export const getDefaultPatientValues = (): PatientFormData => ({
    firstName: '',
    lastName: '',
    birthDate: '',
    sex: 'Masculino',
    profession: '',
    email: '',
    phone: '',
    address: '',
    initialReason: '',
    // New fields
    civilStatus: 'Soltero',
    occupation: '',
    religion: '',
    origin: '',
    companion: '',
    patientType: 'Historia Clinica',
});

export const getDefaultInitialHistoryValues = (patientId: string): InitialHistoryFormData => ({
    id: Math.random().toString(36),
    patientId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    motives: {},
    otherMotive: '',
    evolutionTime: '',
    historyOfPresentIllness: '',

    // Antecedentes Patológicos (Flat)
    diabetes: false,
    hypertension: false,
    cardiopathy: false,
    allergies: false,
    surgeries: false,
    otherPathological: '',

    // Antecedentes No Patológicos (Flat)
    smoking: false,
    alcohol: false,
    drugs: false,
    medications: false,

    // Examen Físico y Notas
    currentIllnessHistory: '',
    physicalExamGeneral: '',
    abdomen: '',
    tdr: '',
    genitals: '',
    limbs: '',
    neurological: '',
    assessment: '',
    diagnosis: '',
    labStudies: '',
    examOrders: '',
    radiologyStudies: '',

    // Vital Signs
    vitalSigns: {
        fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '',
    },
    anthropometrics: {
        weight: '', height: '', imc: '',
    },

    isValidated: true,
<<<<<<< HEAD
=======
    obesityHistory: undefined,
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
});

export const getDefaultSubsequentConsultValues = (patientId: string): SubsequentConsultFormData => ({
    id: Math.random().toString(36),
    patientId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    motives: {},
    otherMotive: '',
    evolutionTime: '',
    historyOfPresentIllness: '',

    // Vital Signs
    vitalSigns: {
        fc: '', fr: '', temp: '', pa: '', pam: '', sat02: '',
    },
    anthropometrics: {
        weight: '', height: '', imc: '',
    },

    // Examen Físico y Notas
    physicalExamGeneral: '',
    abdomen: '',
    tdr: '',
    genitals: '',
    limbs: '',
    neurological: '',
    assessment: '',
    diagnosis: '',
    labStudies: '',
    examOrders: '',
    radiologyStudies: '',
});
