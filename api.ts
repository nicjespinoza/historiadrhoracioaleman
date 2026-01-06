import { Patient, InitialHistory, SubsequentConsult, Appointment } from './src/types';
import { db } from './src/lib/firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';

// Helper to convert Firestore doc to typed object with id
// IMPORTANT: Always use doc.id from Firestore, not any 'id' field stored in the document
const docToData = <T>(doc: any): T => {
    const data = doc.data();
    // Remove any stored 'id' field from the data, use Firestore's doc.id instead
    const { id: storedId, ...rest } = data;
    return {
        id: doc.id,  // Always use the Firestore document ID
        ...rest
    } as T;
};

export const api = {
    // ==================== PATIENTS ====================
    getPatients: async (): Promise<Patient[]> => {
        const snapshot = await getDocs(collection(db, 'patients'));
        return snapshot.docs.map(doc => docToData<Patient>(doc));
    },

    createPatient: async (data: Omit<Patient, 'id'> | Patient): Promise<Patient> => {
        // Explicitly remove id field if present (to prevent saving empty string IDs)
        const { id, ...patientData } = data as Patient;

        const docRef = await addDoc(collection(db, 'patients'), {
            ...patientData,
            createdAt: new Date().toISOString()
        });

        console.log('Created patient with Firestore ID:', docRef.id);
        return { id: docRef.id, ...patientData } as Patient;
    },

    updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
        const docRef = doc(db, 'patients', id);
        await updateDoc(docRef, data);
        const updated = await getDoc(docRef);
        return docToData<Patient>(updated);
    },

    deletePatient: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'patients', id));
    },

    getPatientStatus: async (id: string): Promise<{ canChat: boolean }> => {
        const docRef = doc(db, 'patients', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return { canChat: false };
        const data = snapshot.data();
        return { canChat: data?.isOnline ?? false };
    },

    // ==================== HISTORIES (Subcollection) ====================
    getHistories: async (patientId?: string): Promise<InitialHistory[]> => {
        if (patientId) {
            const snapshot = await getDocs(collection(db, 'patients', patientId, 'histories'));
            return snapshot.docs.map(doc => docToData<InitialHistory>(doc));
        }
        // If no patientId, get all histories across all patients (less efficient)
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const allHistories: InitialHistory[] = [];
        for (const patientDoc of patientsSnapshot.docs) {
            const historiesSnapshot = await getDocs(collection(db, 'patients', patientDoc.id, 'histories'));
            allHistories.push(...historiesSnapshot.docs.map(doc => docToData<InitialHistory>(doc)));
        }
        return allHistories;
    },

    createHistory: async (data: Omit<InitialHistory, 'id'>): Promise<InitialHistory> => {
        const docRef = await addDoc(collection(db, 'patients', data.patientId, 'histories'), data);
        return { id: docRef.id, ...data } as InitialHistory;
    },

    updateHistory: async (id: string, data: Partial<InitialHistory>): Promise<InitialHistory> => {
        // Need patientId to locate the subcollection
        if (!data.patientId) throw new Error('patientId required to update history');
        const docRef = doc(db, 'patients', data.patientId, 'histories', id);
        await updateDoc(docRef, data);
        const updated = await getDoc(docRef);
        return docToData<InitialHistory>(updated);
    },

    // ==================== CONSULTS (Subcollection) ====================
    getConsults: async (patientId?: string): Promise<SubsequentConsult[]> => {
        if (patientId) {
            const snapshot = await getDocs(collection(db, 'patients', patientId, 'consults'));
            return snapshot.docs.map(doc => docToData<SubsequentConsult>(doc));
        }
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const allConsults: SubsequentConsult[] = [];
        for (const patientDoc of patientsSnapshot.docs) {
            const consultsSnapshot = await getDocs(collection(db, 'patients', patientDoc.id, 'consults'));
            allConsults.push(...consultsSnapshot.docs.map(doc => docToData<SubsequentConsult>(doc)));
        }
        return allConsults;
    },

    createConsult: async (data: Omit<SubsequentConsult, 'id'>): Promise<SubsequentConsult> => {
        const docRef = await addDoc(collection(db, 'patients', data.patientId, 'consults'), data);
        return { id: docRef.id, ...data } as SubsequentConsult;
    },

    // ==================== OBSERVATIONS (Subcollection) ====================
    createObservation: async (patientId: string, data: { coordinates: { x: number, y: number, z: number }, note: string, organ: string, snapshotId?: string }) => {
        const docRef = await addDoc(collection(db, 'patients', patientId, 'observations'), {
            ...data,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...data };
    },

    getObservations: async (patientId: string, snapshotId?: string) => {
        const obsCollection = collection(db, 'patients', patientId, 'observations');
        let snapshot;
        if (snapshotId) {
            const q = query(obsCollection, where('snapshotId', '==', snapshotId));
            snapshot = await getDocs(q);
        } else {
            snapshot = await getDocs(obsCollection);
        }
        return snapshot.docs.map(doc => docToData<any>(doc));
    },

    deleteObservation: async (patientId: string, id: string) => {
        await deleteDoc(doc(db, 'patients', patientId, 'observations', id));
        return { success: true };
    },

    // ==================== SNAPSHOTS (Subcollection) ====================
    createSnapshot: async (patientId: string, name?: string) => {
        const docRef = await addDoc(collection(db, 'patients', patientId, 'snapshots'), {
            name: name || `Snapshot ${new Date().toISOString()}`,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, name };
    },

    getSnapshots: async (patientId: string) => {
        const snapshot = await getDocs(collection(db, 'patients', patientId, 'snapshots'));
        return snapshot.docs.map(doc => docToData<any>(doc));
    },

    deleteSnapshot: async (patientId: string, id: string) => {
        await deleteDoc(doc(db, 'patients', patientId, 'snapshots', id));
        return { success: true };
    },

    // ==================== APPOINTMENTS (Root Collection) ====================
    getAppointments: async (): Promise<Appointment[]> => {
        const snapshot = await getDocs(collection(db, 'appointments'));
        return snapshot.docs.map(doc => docToData<Appointment>(doc));
    },

    createAppointment: async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const uniqueId = `CITA-${Date.now()}`;
        const docRef = await addDoc(collection(db, 'appointments'), {
            ...data,
            uniqueId,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, uniqueId, ...data } as Appointment;
    },

    updateAppointment: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
        const docRef = doc(db, 'appointments', id);
        await updateDoc(docRef, data);
        const updated = await getDoc(docRef);
        return docToData<Appointment>(updated);
    },

    deleteAppointment: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'appointments', id));
    },

    // ==================== PATIENT AUTH ====================
    // NOTE: All patient authentication is now handled via Firebase Auth.
    // Use the useAuth() hook from src/context/AuthContext.tsx:
    //   - signUp(email, password) for registration
    //   - signIn(email, password) for login  
    //   - logout() for logout


    // ==================== PAYMENT (Cloud Function) ====================
    initiatePayment: async (data: { appointmentId: string, patientId: string, amount: number, gateway: string }) => {
        // Import functions dynamically to avoid circular dependency
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const initiatePaymentFn = httpsCallable(functions, 'initiatePayment');

        const result = await initiatePaymentFn(data);
        return result.data;
    },

    // ==================== USERS ====================
    getUser: async (userId: string) => {
        const docRef = doc(db, 'users', userId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return docToData<any>(snapshot);
    },

    setRole: async (userId: string, role: string) => {
        const docRef = doc(db, 'users', userId);
        // Use setDoc with merge to create if not exists
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, {
            role,
            updatedAt: new Date().toISOString(),
            email: 'admin@webdesign.com', // hardcoded for safety based on screenshot
            name: 'Admin'
        }, { merge: true });
        return { success: true };
    }
};
