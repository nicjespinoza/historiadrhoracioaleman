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
    setDoc,
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

    // ==================== HISTORIES (Subcollection ONLY) ====================
    getHistories: async (patientId?: string): Promise<InitialHistory[]> => {
        if (!patientId) return [];

        let subData: InitialHistory[] = [];
        try {
            const subSnapshot = await getDocs(collection(db, 'patients', patientId, 'histories'));
            subData = subSnapshot.docs.map(doc => docToData<InitialHistory>(doc));
        } catch (e) {
            console.warn("Error fetching histories from subcollection:", e);
        }

        return subData.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.createdAt || 0).getTime();
            const dateB = new Date(b.date || b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    },

    createHistory: async (data: Omit<InitialHistory, 'id'>): Promise<InitialHistory> => {
        const docRef = await addDoc(collection(db, 'patients', data.patientId, 'histories'), data);
        return { id: docRef.id, ...data } as InitialHistory;
    },

    updateHistory: async (id: string, data: Partial<InitialHistory>): Promise<InitialHistory> => {
        if (!data.patientId) throw new Error('patientId required to update history');
        const docRef = doc(db, 'patients', data.patientId, 'histories', id);
        await updateDoc(docRef, data);
        const updated = await getDoc(docRef);
        return docToData<InitialHistory>(updated);
    },

    deleteHistory: async (patientId: string, id: string) => {
        try {
            await deleteDoc(doc(db, 'patients', patientId, 'histories', id));
        } catch (e) {
            console.warn("Could not delete history:", e);
        }
        return { success: true };
    },

    // ==================== CONSULTS (Subcollection ONLY) ====================
    getConsults: async (patientId?: string): Promise<SubsequentConsult[]> => {
        if (!patientId) return [];

        let subData: SubsequentConsult[] = [];
        try {
            const subSnapshot = await getDocs(collection(db, 'patients', patientId, 'consults'));
            subData = subSnapshot.docs.map(doc => docToData<SubsequentConsult>(doc));
        } catch (e) {
            console.warn("Error fetching consults from subcollection:", e);
        }

        return subData.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.createdAt || 0).getTime();
            const dateB = new Date(b.date || b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    },

    deleteConsult: async (patientId: string, id: string) => {
        try {
            await deleteDoc(doc(db, 'patients', patientId, 'consults', id));
        } catch (e) {
            console.warn("Could not delete consult:", e);
        }
        return { success: true };
    },

    getConsultById: async (patientId: string, id: string): Promise<SubsequentConsult | null> => {
        const docRef = doc(db, 'patients', patientId, 'consults', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return docToData<SubsequentConsult>(snapshot);
    },

    updateConsult: async (patientId: string, id: string, data: Partial<SubsequentConsult>): Promise<SubsequentConsult> => {
        const docRef = doc(db, 'patients', patientId, 'consults', id);
        await updateDoc(docRef, data);
        const updated = await getDoc(docRef);
        return docToData<SubsequentConsult>(updated);
    },

    createConsult: async (data: Omit<SubsequentConsult, 'id'>): Promise<SubsequentConsult> => {
        const docRef = await addDoc(collection(db, 'patients', data.patientId, 'consults'), data);
        return { id: docRef.id, ...data } as SubsequentConsult;
    },

    getHistoryById: async (patientId: string, id: string): Promise<InitialHistory | null> => {
        const docRef = doc(db, 'patients', patientId, 'histories', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return docToData<InitialHistory>(snapshot);
    },

    // ==================== OBSERVATIONS (Subcollection) ====================
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

    // ==================== PRESCRIPTIONS (Subcollection ONLY) ====================
    getPrescriptions: async (patientId: string) => {
        let subcollPrescs: any[] = [];
        try {
            const subcollSnapshot = await getDocs(collection(db, 'patients', patientId, 'prescriptions'));
            subcollPrescs = subcollSnapshot.docs.map(doc => ({ id: doc.id, ...docToData<any>(doc) }));
        } catch (e) {
            console.warn("Could not fetch prescriptions subcollection:", e);
        }

        // Sort by date descending
        return subcollPrescs.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0).getTime();
            const dateB = new Date(b.date || b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    },

    deletePrescription: async (patientId: string, id: string) => {
        try {
            await deleteDoc(doc(db, 'patients', patientId, 'prescriptions', id));
        } catch (e) {
            console.warn("Could not delete prescription:", e);
        }
        return { success: true };
    },

    createPrescription: async (patientId: string, data: any): Promise<any> => {
        const docRef = await addDoc(collection(db, 'patients', patientId, 'prescriptions'), { ...data, patientId, createdAt: new Date().toISOString() });
        return { id: docRef.id, ...data };
    },

    updatePrescription: async (patientId: string, id: string, data: Partial<any>): Promise<any> => {
        const docRef = doc(db, 'patients', patientId, 'prescriptions', id);
        await updateDoc(docRef, data);
        return { id, ...data };
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

    // ==================== PAYMENT (Cloud Function) ====================
    initiatePayment: async (data: { appointmentId: string, patientId: string, amount: number, gateway: string }) => {
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
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, {
            role,
            updatedAt: new Date().toISOString(),
            email: 'admin@webdesign.com',
            name: 'Admin'
        }, { merge: true });
        return { success: true };
    },

    // ==================== IP AUTHORIZATION ====================
    checkIPAccess: async (ip: string): Promise<boolean> => {
        try {
            const docRef = doc(db, 'authorized_ips', ip);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) return true;

            const q = query(collection(db, 'authorized_ips'), where('ip', '==', ip));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking IP access:", error);
            return false;
        }
    },

    // ==================== GOOGLE CALENDAR ====================
    connectGoogleCalendar: async () => {
        const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        provider.addScope('https://www.googleapis.com/auth/calendar.events');
        provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

        provider.setCustomParameters({
            prompt: 'consent'
        });

        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token && auth.currentUser) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(userRef, {
                    googleCalendarToken: token,
                    googleCalendarConnected: true,
                    googleCalendarSyncAt: new Date().toISOString()
                }, { merge: true });
                alert('¡Google Calendar conectado y permisos otorgados con éxito!');
            }
        } catch (error: any) {
            console.error("Error Google Auth:", error);
            alert("Error al conectar con Google: " + error.message);
        }
    },

    disconnectGoogleCalendar: async () => {
        try {
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            if (!auth.currentUser) return;

            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                googleCalendarConnected: false,
                googleCalendarToken: null
            });
            alert('Sesión de Google Calendar cerrada.');
        } catch (error: any) {
            console.error("Error disconnecting Google Calendar:", error);
        }
    },

    syncToGoogleCalendar: async (appointment: any, patientInfo: any) => {
        try {
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            if (!auth.currentUser) return;

            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (!userData?.googleCalendarConnected || !userData?.googleCalendarToken) {
                console.warn("Google Calendar no está conectado");
                return;
            }

            const startTime = `${appointment.date}T${appointment.time}:00`;
            const end = new Date(new Date(startTime).getTime() + 30 * 60000);
            const endTime = end.toISOString().split('.')[0];

            const event = {
                'summary': appointment.title || patientInfo.idunico || patientInfo.id,
                'description': appointment.description || appointment.reason || '',
                'start': { 'dateTime': startTime, 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
                'end': { 'dateTime': endTime, 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
            };

            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userData.googleCalendarToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("GC Error:", err);
            } else {
                const data = await response.json();
                console.log("GC Event created:", data.id);
                const aptRef = doc(db, 'appointments', appointment.id);
                await updateDoc(aptRef, { googleEventId: data.id });
            }
        } catch (error) {
            console.error("Sync Error:", error);
        }
    },

    getGoogleCalendarEvents: async (timeMin: string, timeMax: string) => {
        try {
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            if (!auth.currentUser) return [];

            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (!userData?.googleCalendarConnected || !userData?.googleCalendarToken) return [];

            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${userData.googleCalendarToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Google Calendar API Error:", errorData);
                return [];
            }
            const data = await response.json();
            return (data.items || []).map((item: any) => ({
                id: item.id,
                date: (item.start.dateTime || item.start.date).split('T')[0],
                time: item.start.dateTime ? item.start.dateTime.split('T')[1].substring(0, 5) : '00:00',
                reason: item.summary,
                type: 'Google Calendar',
                isExternal: true
            }));
        } catch (error) {
            console.error("Fetch GC Events Error:", error);
            return [];
        }
    }
};


