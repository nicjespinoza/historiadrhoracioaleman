import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { db, storage } from '../../lib/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Message {
    id: string;
    senderId: string;
    content: string;
    type: 'text' | 'image';
    createdAt: Timestamp | null;
}

interface ChatInterfaceProps {
    patientId: string;
    chatRoomId: string;
    isPremium: boolean;
    currentUserId: string;
    userName?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    patientId,
    chatRoomId,
    isPremium,
    currentUserId,
    userName = "Usuario"
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showPremiumAlert, setShowPremiumAlert] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Listen to messages in realtime using Firestore onSnapshot
    useEffect(() => {
        const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages: Message[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [chatRoomId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUserId,
                content: inputValue.trim(),
                type: 'text',
                createdAt: serverTimestamp()
            });
            setInputValue('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar el mensaje');
        } finally {
            setIsSending(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isPremium) {
            setShowPremiumAlert(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setShowPremiumAlert(false), 4000);
            return;
        }

        setIsSending(true);
        try {
            // Upload image to Firebase Storage
            const storageRef = ref(storage, `chat/${chatRoomId}/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // Send image message to Firestore
            const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUserId,
                content: downloadURL,
                type: 'image',
                createdAt: serverTimestamp()
            });

            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Upload failed', error);
            alert('Error al subir la imagen');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden font-sans relative">

            {/* Header */}
            <div className="px-6 py-4 bg-white/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between backdrop-blur-md z-10">
                <div>
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-lg">Chat Médico</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-neutral-500 font-medium">Conectado (Firestore)</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx(
                                "flex w-full",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={clsx(
                                "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm relative",
                                isMe
                                    ? "bg-gradient-to-br from-teal-600 to-blue-600 text-white rounded-br-none"
                                    : "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                            )}>
                                {msg.type === 'image' ? (
                                    <img
                                        src={msg.content}
                                        alt="Shared"
                                        className="rounded-lg max-h-48 object-cover border border-white/20"
                                    />
                                ) : (
                                    <p className="leading-relaxed">{msg.content}</p>
                                )}
                                <span className={clsx(
                                    "text-[10px] block mt-1 opacity-70",
                                    isMe ? "text-blue-100" : "text-gray-400"
                                )}>
                                    {formatTime(msg.createdAt)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Alert Toast */}
            <AnimatePresence>
                {showPremiumAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 left-4 right-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-red-100 dark:border-red-900/30 p-4 rounded-xl shadow-xl z-20 flex items-start gap-3"
                    >
                        <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Funcionalidad Premium</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Reserva tu cita y realiza el pago para compartir imágenes médicas de alta resolución con tu doctor.
                            </p>
                        </div>
                        <button onClick={() => setShowPremiumAlert(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">

                    {/* Image Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50"
                        title="Adjuntar imagen"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        disabled={isSending}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 disabled:opacity-50"
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isSending}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
