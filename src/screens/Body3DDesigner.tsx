import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Center, Html } from '@react-three/drei';
import { ArrowLeft, Save, RotateCcw, Eye, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import * as THREE from 'three';

// --- 1. COMPONENTE DEL MODELO 3D ---
function StomachModel({
    onPointClick,
    currentMarker,
    observations = [],
    onDeleteObservation
}: {
    onPointClick: (point: THREE.Vector3) => void,
    currentMarker: THREE.Vector3 | null,
    observations?: any[],
    onDeleteObservation: (id: string) => void
}) {
    const { scene } = useGLTF('/models/stomach.glb');
    const [selectedObsId, setSelectedObsId] = useState<string | null>(null);

    // TRUCO PRO: Habilitar visión interna
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                // Esto le dice al 3D: "Pinta esta pared por fuera Y por dentro"
                ((child as THREE.Mesh).material as THREE.Material).side = THREE.DoubleSide;
                // Optimizamos para que no se trabe al rotar
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
    }, [scene]);

    return (
        <group dispose={null}>
            <Center position={[0, 0, 0]}>
                <primitive
                    object={scene}
                    scale={1.7}
                    onDoubleClick={(e: any) => {
                        e.stopPropagation();
                        onPointClick(e.point);
                    }}
                />
            </Center>

            {currentMarker && (
                <mesh position={currentMarker}>
                    {/* 1. CORRECCIÓN: Punto mucho más pequeño (0.02 en vez de 0.1) */}
                    <sphereGeometry args={[0.025, 16, 16]} />
                    {/* Material brillante para que se vea incluso en lo oscuro */}
                    <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={2} toneMapped={false} />

                    <Html position={[0, 0.05, 0]} center>
                        <div className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/20">
                            Nuevo
                        </div>
                    </Html>
                </mesh>
            )}

            {/* Puntos Guardados */}
            {observations.map((obs) => {
                // Handle both nested coordinates (new format) and potential flat structure (legacy/marker)
                const x = obs.coordinates?.x ?? obs.x;
                const y = obs.coordinates?.y ?? obs.y;
                const z = obs.coordinates?.z ?? obs.z;

                if (x === undefined || y === undefined || z === undefined) return null;

                return (
                    <mesh key={obs.id} position={[x, y, z]}>
                        <sphereGeometry args={[0.025, 16, 16]} />
                        <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={1} toneMapped={false} />
                        <Html position={[0, 0, 0]} center>
                            <div className="relative group">
                                {selectedObsId === obs.id ? (
                                    <div className="w-48 bg-white p-3 rounded-xl shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 text-xs">Observación</h4>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedObsId(null);
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <p className="text-gray-700 text-xs mb-2 leading-relaxed">
                                            {obs.note}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-mono mb-3 border-t border-gray-100 pt-1">
                                            Lon: {Number(x).toFixed(2)}, Lat: {Number(y).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteObservation(obs.id);
                                            }}
                                            className="w-full text-center text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedObsId(obs.id);
                                        }}
                                        className="bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 flex items-center justify-center w-6 h-6 border border-white"
                                    >
                                        <Eye size={14} />
                                    </button>
                                )}

                                {/* Tooltip con la nota (solo si no está seleccionado para borrar) */}
                                {selectedObsId !== obs.id && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
                                        {obs.note}
                                    </div>
                                )}
                            </div>
                        </Html>
                    </mesh>
                );
            })}
        </group>
    );
}

useGLTF.preload('/models/stomach.glb');

// --- 2. PANTALLA PRINCIPAL ---
export const Body3DDesigner = () => {
    const navigate = useNavigate();
    const { patientId, snapshotId } = useParams();
    const [marker, setMarker] = useState<THREE.Vector3 | null>(null);
    const [note, setNote] = useState('');
    const [observations, setObservations] = useState<any[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

    useEffect(() => {
        if (patientId) {
            api.getObservations(patientId, snapshotId).then(setObservations).catch(console.error);
        }
    }, [patientId, snapshotId]);

    const handleSaveObservation = async () => {
        if (!marker || !patientId) {
            if (!patientId) alert("Error: No se ha identificado al paciente.");
            return;
        }

        try {
            const newObs = await api.createObservation(patientId, {
                coordinates: { x: marker.x, y: marker.y, z: marker.z },
                note: note,
                organ: 'stomach',
                snapshotId: snapshotId
            });
            alert('Observación guardada con éxito');
            setObservations(prev => [newObs, ...prev]);
            setNote('');
            setMarker(null);
        } catch (error) {
            console.error(error);
            alert('Error al guardar la observación');
        }
    };

    const handleDeleteObservation = async (id: string) => {
        setDeleteConfirmation({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            await api.deleteObservation(patientId!, deleteConfirmation.id);
            setObservations(prev => prev.filter(o => o.id !== deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null });
        } catch (error) {
            console.error(error);
            alert('Error al eliminar. Asegúrese de que el servidor backend esté actualizado y corriendo.');
            setDeleteConfirmation({ isOpen: false, id: null });
        }
    };

    return (
        <div className="min-h-screen bg-[#083c79] flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Barra Superior */}
                <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start pointer-events-none">
                    <button onClick={() => navigate(-1)} className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white pointer-events-auto transition-all border border-gray-100">
                        <ArrowLeft size={18} className="text-gray-700" />
                    </button>

                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm text-center pointer-events-auto border border-gray-100">
                        <h2 className="font-bold text-gray-800 text-sm">Visor Anatómico</h2>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button onClick={() => setMarker(null)} className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-gray-600 border border-gray-100" title="Borrar Punto">
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>

                {/* Escena 3D */}
                <div className="w-full h-full cursor-move bg-gradient-to-b from-gray-50 to-gray-100">
                    {/* 2. CORRECCIÓN: 'near: 0.001' permite acercar la cámara a milímetros sin que se corte la imagen */}
                    <Canvas camera={{ position: [0, 0, 4], fov: 50, near: 0.001 }}>

                        {/* Iluminación mejorada para ver interiores */}
                        <ambientLight intensity={0.5} /> {/* Más luz base */}
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} />
                        {/* Luz interna para ver dentro del estómago */}
                        <pointLight position={[0, 0, 0]} intensity={2} distance={3} decay={2} color="#ffb0b0" />

                        <Environment preset="city" />

                        <Suspense fallback={null}>
                            <StomachModel
                                onPointClick={setMarker}
                                currentMarker={marker}
                                observations={observations}
                                onDeleteObservation={handleDeleteObservation}
                            />
                            {/* Sombras suaves en el piso */}
                            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                        </Suspense>

                        <OrbitControls
                            makeDefault
                            enablePan={true}
                            enableZoom={true}
                            /* 3. CORRECCIÓN: minDistance muy bajo permite navegar DENTRO del modelo */
                            minDistance={0.001}
                            maxDistance={10}
                            rotateSpeed={0.5}
                        />
                    </Canvas>
                </div>

                {/* Bottom Bar 'Guardar' */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
                    <button
                        onClick={() => navigate(`/app/profile/${patientId}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <Save size={20} /> Guardar Diseño
                    </button>
                </div>

                {/* Panel Inferior */}
                {marker && (
                    <div className="absolute bottom-6 right-6 w-80 z-20 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-100 relative">
                            {/* Botón Cerrar Caja */}
                            <button
                                onClick={() => setMarker(null)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="flex justify-between items-center mb-3 pr-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Hallazgo Localizado</h3>
                                    <p className="text-[10px] text-gray-500 font-mono">
                                        {marker.x.toFixed(2)}, {marker.y.toFixed(2)}, {marker.z.toFixed(2)}
                                    </p>
                                </div>
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            </div>

                            <div className="mb-3">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    Nota Clínica
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Describa el hallazgo..."
                                    className="w-full h-20 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 text-xs outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={handleSaveObservation}
                                disabled={!note.trim()}
                                className={`w-full font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm ${note.trim()
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}>
                                <Save size={16} /> Guardar Observación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-red-600 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-red-500 animate-in zoom-in-95 duration-200">
                        <h3 className="text-white font-bold text-lg mb-6 text-center leading-snug">
                            ¿Estás seguro de que deseas eliminar permanentemente esta observación?
                        </h3>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setDeleteConfirmation({ isOpen: false, id: null })}
                                className="bg-white/90 text-red-600 px-6 py-2 rounded-xl font-bold transition-all shadow-md hover:bg-white hover:shadow-lg hover:scale-105"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold transition-all shadow-md hover:bg-gray-100 hover:shadow-lg hover:scale-105 border-b-4 border-gray-200 hover:border-gray-300"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Body3DDesigner;
