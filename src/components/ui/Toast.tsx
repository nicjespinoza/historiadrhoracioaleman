import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${type === 'success'
                            ? 'bg-green-600/90 border-green-500 text-white'
                            : 'bg-red-600/90 border-red-500 text-white'
                        }`}
                >
                    <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-sm">
                            {type === 'success' ? 'Éxito' : 'Error'}
                        </span>
                        <span className="text-sm opacity-90 font-medium">
                            {message}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
