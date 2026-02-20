
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  ageDetails: string; // "X años, Y meses, Z días"
  sex: 'Masculino' | 'Femenino';
  profession: string;
  email: string;
  phone: string;
  address: string;
  initialReason: string;
  createdAt: string;
  registrationSource?: 'online' | 'manual';
  isOnline?: boolean;

  // New fields for clinical file
  civilStatus: 'Soltero' | 'Casado' | string;
  occupation: string;
  religion: string;
  origin: string; // Procedencia
  companion: string; // Acompañante
  patientType: 'Historia Clinica' | 'Recetario';
  migrated?: boolean;
}

// Helper to store dynamic checkbox data
export interface CheckboxData {
  [key: string]: boolean;
}

// Vital Signs for Physical Exam
export interface VitalSigns {
  fc: string;  // Frecuencia Cardíaca
  fr: string;  // Frecuencia Respiratoria
  temp: string; // Temperatura
  pa: string;  // Presión Arterial
  pam: string; // Presión Arterial Media
  sat02: string; // Saturación O2
}

// Anthropometric data
export interface AnthropometricData {
  weight: string;
  height: string;
  imc: string;
}

export interface PhysicalExam {
  fc: string;
  fr: string;
  temp: string;
  pa: string;
  pam: string;
  sat02: string;
  weight: string;
  height: string;
  imc: string;
  systems: {
    [key: string]: { normal: boolean; abnormal: boolean; description: string };
  };
}

export interface InitialHistory {
  id: string;
  patientId: string;
  date: string;
  time: string;
  motives: CheckboxData;
  otherMotive: string;
  evolutionTime: string;
  historyOfPresentIllness: string;

  // ============================================
  // Antecedentes Patológicos (Flat Booleans)
  // ============================================
  diabetes: boolean;
  hypertension: boolean;
  cardiopathy: boolean;
  allergies: boolean;
  surgeries: boolean;
  otherPathological: string;

  // ============================================
  // Antecedentes No Patológicos (Flat Booleans)
  // ============================================
  smoking: boolean;
  alcohol: boolean;
  drugs: boolean;
  medications: boolean;

  // ============================================
  // Examen Físico y Notas (Strings)
  // ============================================
  currentIllnessHistory: string;
  physicalExamGeneral: string;
  abdomen: string;
  tdr: string; // Tórax y Respiratorio
  genitals: string;
  limbs: string; // Miembros
  neurological: string;
  assessment: string; // Avaluo
  diagnosis: string;
  labStudies: string;
  examOrders: string;
  radiologyStudies: string;

  // ============================================
  // Vital Signs
  // ============================================
  vitalSigns: VitalSigns;
  anthropometrics: AnthropometricData;

  // ============================================
  // Legacy fields (kept for backward compatibility)
  // ============================================
  preExistingDiseases?: { yes: boolean; no: boolean };
  neurologicalLegacy?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  metabolic?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  respiratory?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  cardiac?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  gastro?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  hepato?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  peripheral?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  hematological?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  renal?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  rheumatological?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  infectious?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };
  psychiatric?: { yes: boolean; no: boolean; conditions: CheckboxData; other: string };

  // Gyneco
  gyneco?: {
    yes: boolean; no: boolean; na: boolean;
    conditions: CheckboxData; other: string;
    g: string; p: string; a: string; c: string;
    surgeries: string;
    gestationalDiabetes: { yes: boolean; no: boolean };
    preeclampsia: { yes: boolean; no: boolean };
    eclampsia: { yes: boolean; no: boolean };
    pregnancySuspicion: { yes: boolean; no: boolean; na: boolean };
    breastfeeding: { yes: boolean; no: boolean; na: boolean };
  };

  // Medications & Habits
  regularMeds?: { yes: boolean; no: boolean; list: CheckboxData; other: string; specific: string };
  naturalMeds?: { yes: boolean; no: boolean; description: string };
  hospitalizations?: { yes: boolean; no: boolean; reason: string };
  surgeriesDetail?: { yes: boolean; no: boolean; list: string };
  endoscopy?: { yes: boolean; no: boolean; list: string; results: string };
  complications?: { yes: boolean; no: boolean; list: string };

  // Allergies
  allergiesDetail?: { yes: boolean; no: boolean; list: CheckboxData; other: string };
  foodAllergies?: { yes: boolean; no: boolean; list: CheckboxData; other: string };
  foodIntolerances?: { yes: boolean; no: boolean; list: CheckboxData };

  // Implants
  implants?: { yes: boolean; no: boolean; which: string };
  devices?: { yes: boolean; no: boolean; which: string };

  // Non-pathological
  habits?: { yes: boolean; no: boolean; list: CheckboxData; other: string };
  transfusions?: { yes: boolean; no: boolean; reactions: boolean; which: string };
  exposures?: { yes: boolean; no: boolean; list: CheckboxData; other: string };

  // Family
  familyHistory?: { yes: boolean; no: boolean; list: CheckboxData; other: string };
  familyGastro?: { yes: boolean; no: boolean; list: CheckboxData; other: string };

  // Legacy Physical Exam
  physicalExam?: PhysicalExam;

  isValidated?: boolean;

  // Migration Fields
  legacyPrescription?: string;
  legacyId?: string;
  legacyRandomId?: string;
}



export interface SubsequentConsult {
  id: string;
  patientId: string;
  date: string;
  time: string;
  motives: CheckboxData;
  otherMotive: string;
  evolutionTime: string;
  historyOfPresentIllness: string;

  // ============================================
  // Vital Signs (same as InitialHistory)
  // ============================================
  vitalSigns: VitalSigns;
  anthropometrics: AnthropometricData;

  // ============================================
  // Examen Físico y Notas (same as InitialHistory)
  // ============================================
  physicalExamGeneral: string;
  abdomen: string;
  tdr: string; // Tórax y Respiratorio
  genitals: string;
  limbs: string; // Miembros
  neurological: string;
  assessment: string; // Avaluo
  diagnosis: string;
  labStudies: string;
  examOrders: string;
  radiologyStudies: string;

  // Legacy fields
  physicalExam?: PhysicalExam;
  labs?: {
    performed: { yes: boolean; no: boolean };
    results: string;
  };
  comments?: string;
  diagnoses?: string[]; // 5 lines

  treatment?: {
    food: string;
    meds: string[];
    exams: string[];
    norms: string[];
  };

  // Migration Fields
  migrated?: boolean;
  legacyId?: string;
  legacyRandomId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'presencial' | 'virtual';
  reason: string;
  confirmed?: boolean;
  uniqueId?: string; // e.g., "CITA-123"
}

export type ViewState = 'login' | 'patients' | 'register' | 'history' | 'profile' | 'consult' | 'report' | 'agenda' | 'patient-login' | 'patient-register' | 'patient-dashboard';

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface ModalContent {
  title: string;
  body: React.ReactNode;
}

export interface AIAnalysisResult {
  summary: string;
  risks: string[];
  recommendations: string[];
}

export interface RiskPatient {
  id: string; // patientId
  risks: string[];
}

export interface DashboardStats {
  obesityPrevalence: {
    normal: number;
    overweight: number;
    obese: number;
  };
  topDiagnoses: {
    name: string;
    count: number;
  }[];
  riskPatients: RiskPatient[];
}
