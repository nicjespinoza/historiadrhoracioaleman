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
    limit,
    orderBy,
    startAfter,
    getCountFromServer,
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
    // Optimized Search Function
    searchPatients: async (term: string, patientType?: string): Promise<Patient[]> => {
        const normalizedTerm = term.trim();
        if (!normalizedTerm) return [];

        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        const capitalizedTerm = capitalize(normalizedTerm);

        // We build queries for both original and capitalized terms if they differ
        const terms = Array.from(new Set([normalizedTerm, capitalizedTerm]));

        const buildQueries = (fieldName: string, limitCount: number) => {
            return terms.map(t => {
                let q = query(collection(db, 'patients'),
                    where(fieldName, '>=', t),
                    where(fieldName, '<=', t + '\uf8ff'),
                    limit(limitCount)
                );
                if (patientType && patientType !== 'all') {
                    q = query(q, where('patientType', '==', patientType));
                }
                return getDocs(q);
            });
        };

        // Execute all queries in parallel
        const results = await Promise.all([
            ...buildQueries('lastName', 20),
            ...buildQueries('firstName', 20),
            ...buildQueries('email', 10),
            ...buildQueries('phone', 10)
        ]);

        // Merge and deduplicate results
        const uniquePatients = new Map<string, Patient>();
        results.forEach(snap => {
            snap.docs.forEach(doc => {
                if (!uniquePatients.has(doc.id)) {
                    uniquePatients.set(doc.id, docToData<Patient>(doc));
                }
            });
        });

        return Array.from(uniquePatients.values());
    },

    getPatients: async (options?: { limitCount?: number, lastDoc?: any, searchTerm?: string, patientType?: string }): Promise<{ patients: Patient[], lastVisible: any }> => {
        // Build base query
        let q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));

        if (options?.patientType && options.patientType !== 'all') {
            q = query(q, where('patientType', '==', options.patientType));
        }

        if (options?.lastDoc) {
            q = query(q, startAfter(options.lastDoc));
        }

        if (options?.limitCount) {
            q = query(q, limit(options.limitCount));
        }

        try {
            const snapshot = await getDocs(q);
            const patients = snapshot.docs.map(doc => docToData<Patient>(doc));
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            return { patients, lastVisible };
        } catch (e: any) {
            console.error("Error fetching patients list:", e);
            // Return empty list on permission error to avoid component crash
            return { patients: [], lastVisible: null };
        }
    },

    getPatientsCount: async (patientType?: string): Promise<number> => {
        let q = query(collection(db, 'patients'));
        if (patientType && patientType !== 'all') {
            q = query(q, where('patientType', '==', patientType));
        }
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
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

    getPatientById: async (id: string): Promise<Patient | null> => {
        const docRef = doc(db, 'patients', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return docToData<Patient>(snapshot);
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
            // Fetch from subcollection
            let subData: InitialHistory[] = [];
            try {
                const subSnapshot = await getDocs(collection(db, 'patients', patientId, 'histories'));
                subData = subSnapshot.docs.map(doc => docToData<InitialHistory>(doc));
            } catch (e) {
                console.warn("Error fetching histories from subcollection:", e);
            }

            // Fetch from legacy root collection
            let rootData: InitialHistory[] = [];
            try {
                const rootSnapshot = await getDocs(query(collection(db, 'initialHistories'), where('patientId', '==', patientId)));
                rootData = rootSnapshot.docs.map(doc => docToData<InitialHistory>(doc));
            } catch (e) {
                console.warn("Error fetching histories from root collection:", e);
            }

            // Combine and sort by date descending
            const all = [...subData, ...rootData];
            return all.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        }
        // If no patientId, get all histories across all patients (less efficient)
        try {
            const patientsSnapshot = await getDocs(collection(db, 'patients'));
            const allHistories: InitialHistory[] = [];
            for (const patientDoc of patientsSnapshot.docs) {
                const histories = await api.getHistories(patientDoc.id);
                allHistories.push(...histories);
            }
            return allHistories;
        } catch (e) {
            console.error("Critical error in getHistories:", e);
            return [];
        }
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
            // Fetch from subcollection
            let subData: SubsequentConsult[] = [];
            try {
                const subSnapshot = await getDocs(collection(db, 'patients', patientId, 'consults'));
                subData = subSnapshot.docs.map(doc => docToData<SubsequentConsult>(doc));
            } catch (e) {
                console.warn("Error fetching consults from subcollection:", e);
            }

            // Fetch from legacy root collection
            let rootData: SubsequentConsult[] = [];
            try {
                const rootSnapshot = await getDocs(query(collection(db, 'subsequentConsults'), where('patientId', '==', patientId)));
                rootData = rootSnapshot.docs.map(doc => docToData<SubsequentConsult>(doc));
            } catch (e) {
                console.warn("Error fetching consults from root collection:", e);
            }

            // Combine and sort by date descending
            const all = [...subData, ...rootData];
            return all.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        }
        try {
            const patientsSnapshot = await getDocs(collection(db, 'patients'));
            const allConsults: SubsequentConsult[] = [];
            for (const patientDoc of patientsSnapshot.docs) {
                const consults = await api.getConsults(patientDoc.id);
                allConsults.push(...consults);
            }
            return allConsults;
        } catch (e) {
            console.error("Critical error in getConsults:", e);
            return [];
        }
    },

    createConsult: async (data: Omit<SubsequentConsult, 'id'>): Promise<SubsequentConsult> => {
        const docRef = await addDoc(collection(db, 'patients', data.patientId, 'consults'), data);
        return { id: docRef.id, ...data } as SubsequentConsult;
    },

    createObservation: async (patientId: string, data: { coordinates: { x: number, y: number, z: number }, note: string, organ: string, location?: string, color?: string, scale?: number, drawnPath?: { x: number, y: number, z: number }[], drawnPaths?: any[], snapshotId?: string, hasMarker?: boolean, markerType?: string }) => {
        const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        const docRef = await addDoc(collection(db, 'patients', patientId, 'observations'), {
            ...cleanData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...data };
    },

    getObservations: async (patientId: string, snapshotId?: string) => {
        try {
            const obsCollection = collection(db, 'patients', patientId, 'observations');
            let snapshot;
            if (snapshotId) {
                const q = query(obsCollection, where('snapshotId', '==', snapshotId));
                snapshot = await getDocs(q);
            } else {
                snapshot = await getDocs(obsCollection);
            }
            return snapshot.docs.map(doc => docToData<any>(doc));
        } catch (e) {
            console.warn("Error fetching observations:", e);
            return [];
        }
    },

    deleteObservation: async (patientId: string, id: string) => {
        await deleteDoc(doc(db, 'patients', patientId, 'observations', id));
        return { success: true };
    },

    updateObservation: async (patientId: string, id: string, data: Partial<{ note: string, color: string, scale: number, markerType: string }>) => {
        const docRef = doc(db, 'patients', patientId, 'observations', id);
        await updateDoc(docRef, data);
        return { id, ...data };
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
        try {
            const snapshot = await getDocs(collection(db, 'patients', patientId, 'snapshots'));
            return snapshot.docs.map(doc => docToData<any>(doc));
        } catch (e) {
            console.warn("Error fetching snapshots:", e);
            return [];
        }
    },

    deleteSnapshot: async (patientId: string, id: string) => {
        await deleteDoc(doc(db, 'patients', patientId, 'snapshots', id));
        return { success: true };
    },

    // ==================== PRESCRIPTIONS (Subcollection) ====================
    getPrescriptions: async (patientId: string) => {
        let patientData: any = null;
        try {
            const patientDoc = await getDoc(doc(db, 'patients', patientId));
            patientData = patientDoc.exists() ? patientDoc.data() : null;
        } catch (e) {
            console.warn("Could not fetch patient document in getPrescriptions:", e);
        }

        const legacyId = patientData?.legacyId || patientData?.HA_ID || patientData?.Idunico;

        // Fetch from patient subcollection (item-linked documents)
        let subcollPrescs: any[] = [];
        try {
            const subcollSnapshot = await getDocs(collection(db, 'patients', patientId, 'prescriptions'));
            subcollPrescs = subcollSnapshot.docs.map(doc => ({ id: doc.id, ...docToData<any>(doc) }));
        } catch (e) {
            console.warn("Could not fetch prescriptions subcollection:", e);
        }

        // Fetch from root collection (migrated prescriptions) by Firestore ID
        let rootByIdPrescs: any[] = [];
        try {
            const rootByIdSnapshot = await getDocs(query(collection(db, 'prescriptions'), where('patientId', '==', patientId)));
            rootByIdPrescs = rootByIdSnapshot.docs.map(doc => ({ id: doc.id, ...docToData<any>(doc) }));
        } catch (e) {
            // This often fails if security rules aren't deployed for root 'prescriptions'
            console.warn("Could not fetch prescriptions from root by patientId:", e);
        }

        // Fetch from root collection by Legacy ID (HAXXXXX)
        let rootByLegacyPrescs: any[] = [];
        if (legacyId) {
            try {
                const rootByLegacySnapshot = await getDocs(query(collection(db, 'prescriptions'), where('legacyPatientId', '==', legacyId)));
                rootByLegacyPrescs = rootByLegacySnapshot.docs.map(doc => ({ id: doc.id, ...docToData<any>(doc) }));
            } catch (e) {
                console.warn("Could not fetch prescriptions from root by legacyId:", e);
            }
        }

        // Combine all results, removing duplicates by document ID
        const combinedMap = new Map();
        [...subcollPrescs, ...rootByIdPrescs, ...rootByLegacyPrescs].forEach(p => {
            combinedMap.set(p.id, p);
        });

        const all = Array.from(combinedMap.values());

        // Sort by date descending
        return all.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || a.fecharegistro || 0).getTime();
            const dateB = new Date(b.date || b.createdAt || b.fecharegistro || 0).getTime();
            return dateB - dateA;
        });
    },

    deletePrescription: async (patientId: string, id: string) => {
        try {
            await deleteDoc(doc(db, 'patients', patientId, 'prescriptions', id));
        } catch (e) {
            console.warn("Could not delete from subcollection:", e);
        }
        try {
            await deleteDoc(doc(db, 'prescriptions', id));
        } catch (e) {
            console.warn("Could not delete from root collection:", e);
        }
        return { success: true };
    },

    createPrescription: async (patientId: string, data: any): Promise<any> => {
        const docRef = await addDoc(collection(db, 'patients', patientId, 'prescriptions'), { ...data, patientId, createdAt: new Date().toISOString() });
        return { id: docRef.id, ...data };
    },

    // ==================== APPOINTMENTS (Root Collection) ====================
    getAppointments: async (): Promise<Appointment[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'appointments'));
            return snapshot.docs.map(doc => docToData<Appointment>(doc));
        } catch (e) {
            console.error("Error fetching appointments:", e);
            return [];
        }
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
    },

    // ==================== IP AUTHORIZATION ====================
    checkIPAccess: async (ip: string): Promise<boolean> => {
        try {
            // We check the 'authorized_ips' collection
            // The document ID can be the IP itself for direct lookup
            const docRef = doc(db, 'authorized_ips', ip);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) return true;

            // Optional: Also search by a field if IDs are names
            const q = query(collection(db, 'authorized_ips'), where('ip', '==', ip));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking IP access:", error);
            return false;
        }
    }
};
