<<<<<<< HEAD
'use client';
=======
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
<<<<<<< HEAD
    User,
    UserCredential
=======
    User
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
<<<<<<< HEAD
    signUp: (email: string, pass: string) => Promise<UserCredential>;
=======
    signUp: (email: string, pass: string) => Promise<void>;
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signUp = async (email: string, pass: string) => {
<<<<<<< HEAD
        return await createUserWithEmailAndPassword(auth, email, pass);
=======
        await createUserWithEmailAndPassword(auth, email, pass);
>>>>>>> a832b7bdcb8c197ae327c6b5b8a4707d069e0b99
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        loading,
        signIn,
        signUp,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
