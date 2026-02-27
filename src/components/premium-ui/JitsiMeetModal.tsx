import React, { useEffect, useRef, useState } from 'react';
import { X, Video, Wifi, WifiOff, RefreshCw, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JitsiMeetModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    displayName: string;
    appointmentId: string;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

// JaaS API Key - Jitsi as a Service
const JAAS_APP_ID = 'vpaas-magic-cookie-c616c803dbb3495688b0cec6bc5b3bc8';

export const JitsiMeetModal = ({
    isOpen,
    onClose,
    roomName,
    displayName,
    appointmentId
}: JitsiMeetModalProps) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Create a clean room name
    const cleanRoomName = `consulta${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`;

    // Full room name for JaaS: JAAS_APP_ID/roomName
    const fullRoomName = `${JAAS_APP_ID}/${cleanRoomName}`;

    const initializeJitsi = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Load JaaS script
            if (!window.JitsiMeetExternalAPI) {
                await new Promise<void>((resolve, reject) => {
                    const existingScript = document.querySelector('script[src*="external_api.js"]');
                    if (existingScript) {
                        existingScript.remove();
                    }

                    const script = document.createElement('script');
                    script.src = 'https://8x8.vc/external_api.js';
                    script.async = true;
                    script.onload = () => {
                        console.log('JaaS script loaded successfully');
                        resolve();
                    };
                    script.onerror = () => reject(new Error('No se pudo cargar el script de video'));
                    document.head.appendChild(script);
                });
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            if (!jitsiContainerRef.current) {
                throw new Error('Container not ready');
            }

            // Cleanup any existing instance
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }

            console.log('Creating JaaS room:', fullRoomName);

            // Create the Jitsi instance with JaaS
            jitsiApiRef.current = new window.JitsiMeetExternalAPI('8x8.vc', {
                roomName: fullRoomName,
                parentNode: jitsiContainerRef.current,
                width: '100%',
                height: '100%',
                configOverwrite: {
                    // Disable pre-join and lobby completely
                    prejoinPageEnabled: false,
                    prejoinConfig: {
                        enabled: false
                    },
                    // Lobby disabled
                    enableLobby: false,
                    hideLobbyButton: true,
                    // Audio/Video settings
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    // Other settings
                    disableDeepLinking: true,
                    enableWelcomePage: false,
                    enableClosePage: false,
                    disableInviteFunctions: true,
                    hideConferenceSubject: false,
                    subject: 'Consulta Médica Virtual',
                    // Disable moderation requirements
                    enableInsecureRoomNameWarning: false,
                    requireDisplayName: false,
                    // P2P for faster connection
                    p2p: {
                        enabled: true
                    },
                    // Recording disabled
                    fileRecordingsEnabled: false,
                    liveStreamingEnabled: false,
                    // Breakout rooms disabled
                    breakoutRooms: {
                        hideAddRoomButton: true,
                        hideAutoAssignButton: true,
                        hideJoinRoomButton: true
                    }
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop',
                        'fullscreen', 'hangup', 'chat', 'settings',
                        'videoquality', 'tileview', 'toggle-camera'
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    BRAND_WATERMARK_LINK: '',
                    DEFAULT_BACKGROUND: '#1a1a2e',
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                    MOBILE_APP_PROMO: false,
                    HIDE_INVITE_MORE_HEADER: true,
                    DISABLE_FOCUS_INDICATOR: true,
                    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                    ENABLE_FEEDBACK_ANIMATION: false,
                    TOOLBAR_ALWAYS_VISIBLE: false,
                    INITIAL_TOOLBAR_TIMEOUT: 15000,
                    TOOLBAR_TIMEOUT: 4000,
                },
                userInfo: {
                    displayName: displayName || 'Participante',
                }
            });

            console.log('JaaS API created, adding listeners...');

            // Event listeners
            jitsiApiRef.current.addListener('videoConferenceJoined', (data: any) => {
                console.log('User joined video conference:', data);
                setIsLoading(false);
            });

            jitsiApiRef.current.addListener('videoConferenceLeft', () => {
                console.log('User left video conference');
                onClose();
            });

            jitsiApiRef.current.addListener('readyToClose', () => {
                console.log('Ready to close');
                onClose();
            });

            // Fallback timeout
            setTimeout(() => {
                setIsLoading(false);
            }, 5000);

        } catch (err: any) {
            console.error('JaaS initialization error:', err);
            setError(err.message || 'Error al iniciar la video consulta');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            setIsLoading(true);
            setError(null);
            return;
        }

        initializeJitsi();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        };
    }, [isOpen, appointmentId, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col"
                >
                    {/* Header */}
                    {!isFullscreen && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white/10 rounded-lg">
                                    <Video className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Video Consulta</h2>
                                    <p className="text-[10px] text-purple-200">{displayName} • ID: {cleanRoomName.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Pantalla completa"
                                >
                                    <Maximize size={18} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Fullscreen controls */}
                    {isFullscreen && (
                        <div className="absolute top-2 right-2 z-30 flex gap-2">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 bg-black/50 text-white hover:bg-black/70 rounded-lg transition-colors"
                            >
                                <Minimize size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-red-500/80 text-white hover:bg-red-500 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 relative bg-gray-900">
                        {/* Loading Overlay */}
                        {isLoading && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-900 z-20">
                                <div className="relative mb-4">
                                    <div className="w-14 h-14 border-4 border-white/20 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Wifi className="w-7 h-7 text-white animate-bounce" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">Conectando...</h3>
                                <p className="text-purple-200 text-xs">Iniciando video consulta</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-red-900 to-red-800 z-20">
                                <WifiOff className="w-10 h-10 text-white mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Error de Conexión</h3>
                                <p className="text-red-200 text-sm mb-4">{error}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Reintentar
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 bg-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/30 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Jitsi container */}
                        <div
                            ref={jitsiContainerRef}
                            className="w-full h-full"
                            style={{
                                visibility: isLoading || error ? 'hidden' : 'visible',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
