import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { ArrowLeft, Eye, EyeOff, Save, X, AlertTriangle, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import * as THREE from 'three';

// --- 1. COMPONENTE DE ERROR PARA 3D ---
class SceneErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <Html center>
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-center max-w-xs shadow-2xl">
                        <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
                        <h3 className="font-bold text-red-900 mb-2">Error en Visor 3D</h3>
                        <p className="text-red-700 text-[10px] leading-tight mb-4">{this.state.error?.message || 'Error desconocido'}</p>
                        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold">REINTENTAR</button>
                    </div>
                </Html>
            );
        }
        return this.props.children;
    }
}

// --- 2. MODELO ANATÓMICO ---
function HumanBodyModel({ onPointClick, currentMarker, observations, onDeleteObservation, layerVisibility }: any) {
    const { scene } = useGLTF('/models/human-body.glb');
    const [selectedObsId, setSelectedObsId] = useState<string | null>(null);

    useEffect(() => {
        if (scene) {
            console.log("✅ Modelo cargado. Meshes:", scene.children.length);
        }
    }, [scene]);

    useEffect(() => {
        if (!scene) return;

        scene.traverse((child: any) => {
            // CRITICAL FIX: Reset all groups to visible in case a prior fast-refresh mutated the cached glTF
            if (child.isGroup) {
                child.visible = true;
                return;
            }

            if (child.isMesh) {
                const nodeName = (child.name || "").toLowerCase();

                // Determine material name
                let matName = "";
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m: any) => { m.side = THREE.DoubleSide; });
                        matName = (child.material[0]?.name || "").toLowerCase();
                    } else {
                        child.material.side = THREE.DoubleSide;
                        matName = (child.material.name || "").toLowerCase();
                    }
                }

                // 1. Textos e Interfaz embebida en 3D (Z-Anatomy 3D texts are suffixed with .t or .st)
                if (matName.includes('text') || nodeName.endsWith('.t') || nodeName.endsWith('.st') || nodeName.includes('how to')) {
                    // Eliminamos estas etiquetas basuras permanentemente de la vista
                    child.visible = false;
                    return;
                }

                // 2. Mapeo Quirúrgico basado en Nombres de Material Z-Anatomy
                let isSkin = matName.includes('skin');
                let isBone = matName.includes('bone') || matName.includes('teeth') || matName.includes('dentine') || matName.includes('suture') || matName.includes('cartilage');
                let isMuscle = matName.includes('muscle') || matName.includes('flexion') || matName.includes('extension') || matName.includes('tendon') || matName.includes('orbicularis') || matName.includes('depressor') || matName.includes('levator') || matName.includes('phonation') || matName.includes('ingestion') || matName.includes('abductor') || matName.includes('biarticular') || matName.includes('masticator') || matName.includes('adductor') || matName.includes('superficial') || matName.includes('extensor') || matName.includes('trapezius') || matName.includes('diaphragm') || matName.includes('rotator');
                let isArticulation = matName.includes('ligament') || matName.includes('capsule') || matName.includes('bursa');
                let isFascia = matName.includes('fascia') || matName.includes('fat');
                let isArterial = matName.includes('artery') || matName.includes('arterioles') || matName.includes('heart');
                let isVenous = matName.includes('vein') || matName.includes('venules') || matName.includes('sinus');
                let isLymph = matName.includes('lymph') || matName.includes('spleen');
                let isNervous = matName.includes('nerve') || matName.includes('nucleus') || matName.includes('brain') || matName.includes('lcr') || matName.includes('lobe') || matName.includes('matter') || matName.includes('cerebellum') || matName.includes('interlobar') || matName.includes('insula');
                let isVisceral = matName.includes('organ') || matName.includes('gland') || matName.includes('peritoneum') || matName.includes('intestine') || matName.includes('gallbladder') || matName.includes('ductus') || matName.includes('lung') || matName.includes('bronchi') || matName.includes('mucosa') || matName.includes('cornea') || matName.includes('eye') || matName.includes('iris');
                let isInsertion = ['origin', 'end'].some(term => matName.startsWith(term)) || nodeName.endsWith('.o') || nodeName.endsWith('.i') || nodeName.includes('.o4') || nodeName.includes('.i4');

                // 3. Fallback a nodeName si es necesario
                if (!matName) {
                    isSkin = isSkin || nodeName.includes('skin');
                    isBone = isBone || nodeName.includes('bone') || nodeName.includes('skelet') || nodeName.includes('skull');
                    isMuscle = isMuscle || nodeName.includes('muscle');
                    isFascia = isFascia || nodeName.includes('fascia');
                    isArterial = isArterial || nodeName.includes('arter');
                    isVenous = isVenous || nodeName.includes('vein');
                    isNervous = isNervous || nodeName.includes('nerv');
                    isVisceral = isVisceral || nodeName.includes('organ') || nodeName.includes('visc');
                    isLymph = isLymph || nodeName.includes('lymph');
                    isArticulation = isArticulation || nodeName.includes('joint');
                    isInsertion = isInsertion || nodeName.includes('insertion');
                }

                // 4. Asignación Final de Visibilidad
                let visible = true;
                if (isInsertion) visible = layerVisibility['Inserciones musculares'];
                else if (isSkin) visible = layerVisibility['Regiones del cuerpo humano'];
                else if (isMuscle) visible = layerVisibility['Sistema muscular'];
                else if (isBone) visible = layerVisibility['Sistema esquelético'];
                else if (isArticulation) visible = layerVisibility['Articulaciones'];
                else if (isFascia) visible = layerVisibility['Fascias musculares'];
                else if (isArterial) visible = layerVisibility['Sistema arterial'];
                else if (isVenous) visible = layerVisibility['Sistema venoso'];
                else if (isLymph) visible = layerVisibility['Órganos linfoides'];
                else if (isNervous) visible = layerVisibility['Sistema nervioso'];
                else if (isVisceral) visible = layerVisibility['Sistemas viscerales'];

                child.visible = visible;
            }
        });
    }, [scene, layerVisibility]);

    return (
        <group>
            <primitive object={scene} scale={1} position={[0, -1, 0]} onDoubleClick={(e: any) => {
                e.stopPropagation();
                onPointClick(e.point, e.object.name || 'Parte anatómica');
            }} />

            {currentMarker && (
                <mesh position={currentMarker}>
                    <sphereGeometry args={[0.03]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                </mesh>
            )}

            {observations?.map((obs: any) => (
                <mesh key={obs.id} position={[obs.x || obs.coordinates?.x, obs.y || obs.coordinates?.y, obs.z || obs.coordinates?.z]}>
                    <sphereGeometry args={[0.02]} />
                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
                    <Html center>
                        <button onClick={() => setSelectedObsId(obs.id)} className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white scale-75 hover:scale-100 transition-transform">
                            <Eye size={12} />
                        </button>
                        {selectedObsId === obs.id && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-[#2A2A2A] text-white p-4 rounded-xl shadow-2xl border border-[#404040] text-xs z-50">
                                <p className="mb-3 text-[#E0E0E0]">{obs.note}</p>
                                <div className="flex justify-between border-t border-[#404040] pt-2">
                                    <button onClick={() => onDeleteObservation(obs.id)} className="text-red-400 font-bold hover:text-red-300 transition-colors">ELIMINAR</button>
                                    <button onClick={() => setSelectedObsId(null)} className="text-gray-400 hover:text-white transition-colors">Cerrar</button>
                                </div>
                            </div>
                        )}
                    </Html>
                </mesh>
            ))}
        </group>
    );
}

// --- 3. COMPONENTE PRINCIPAL ---
export const Body3DDesigner = () => {
    const navigate = useNavigate();
    const { patientId, snapshotId } = useParams();
    const [marker, setMarker] = useState<THREE.Vector3 | null>(null);
    const [partName, setPartName] = useState('');
    const [note, setNote] = useState('');
    const [observations, setObservations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Z-Anatomy Style Layers
    const [layerVisibility, setLayerVisibility] = useState({
        'Sistema esquelético': true,
        'Inserciones musculares': false,
        'Articulaciones': false,
        'Sistema muscular': false,
        'Fascias musculares': false,
        'Sistema arterial': false,
        'Sistema venoso': false,
        'Órganos linfoides': false,
        'Sistema nervioso': false,
        'Sistemas viscerales': false,
        'Regiones del cuerpo humano': true,
        'Referencias y movimientos': false
    });

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Sistema esquelético': true,
        'Sistema muscular': false
    });

    useEffect(() => {
        if (patientId) api.getObservations(patientId, snapshotId).then(setObservations).catch(console.error);
    }, [patientId, snapshotId]);

    const handleSave = async () => {
        if (!marker || !patientId) return;
        try {
            const newObs = await api.createObservation(patientId, {
                coordinates: { x: marker.x, y: marker.y, z: marker.z },
                note, organ: 'human-body', snapshotId
            });
            setObservations(prev => [...prev, newObs]);
            setMarker(null); setNote('');
        } catch (e) { console.error(e); }
    };

    const toggleLayer = (layer: keyof typeof layerVisibility) => {
        setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const toggleGroup = (layer: string) => {
        setExpandedGroups(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    return (
        <div style={{ backgroundColor: '#222222', color: '#E0E0E0' }} className="h-screen flex overflow-hidden font-sans">

            {/* 3D Scene - Main Viewport */}
            <div className="flex-1 relative">
                {/* Header Actions */}
                <div className="absolute top-4 left-4 z-30 flex gap-4">
                    <button onClick={() => navigate(-1)} style={{ backgroundColor: 'rgba(51, 51, 51, 0.8)', borderColor: '#404040' }} className="flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-lg text-sm transition-colors shadow-lg border hover:bg-neutral-700">
                        <ArrowLeft size={16} /> Volver al paciente
                    </button>
                </div>

                <Suspense fallback={
                    <div style={{ backgroundColor: '#222222' }} className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div style={{ borderColor: '#5E5CE6', borderTopColor: 'transparent' }} className="w-12 h-12 border-4 rounded-full animate-spin mb-4"></div>
                        <p style={{ color: '#AAAAAA' }} className="text-sm font-medium animate-pulse tracking-wide">Cargando Modelo Anatómico...</p>
                    </div>
                }>
                    <Canvas style={{ backgroundColor: '#222222' }} camera={{ position: [0, 1.5, 6], fov: 35, near: 0.1, far: 1000 }} className="cursor-crosshair w-full h-full">
                        <SceneErrorBoundary>
                            <ambientLight intensity={0.5} />
                            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                            <pointLight position={[-10, -10, 5]} intensity={0.5} color="#a0c0ff" />
                            <pointLight position={[0, -5, -5]} intensity={0.5} color="#ffffff" />
                            <HumanBodyModel
                                onPointClick={(pt: any, name: any) => { setMarker(pt); setPartName(name); }}
                                currentMarker={marker}
                                observations={observations}
                                onDeleteObservation={(id: string) => {
                                    api.deleteObservation(patientId!, id).then(() => setObservations(prev => prev.filter(o => o.id !== id)));
                                }}
                                layerVisibility={layerVisibility}
                            />
                            <OrbitControls target={[0, 0.5, 0]} maxDistance={15} minDistance={1} enableDamping dampingFactor={0.05} />
                        </SceneErrorBoundary>
                    </Canvas>
                </Suspense>

                {/* Annotation Overlay */}
                {marker && (
                    <div style={{ backgroundColor: 'rgba(43, 43, 43, 0.95)', borderColor: '#4D4D4D' }} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 backdrop-blur-xl rounded-2xl shadow-2xl p-6 z-30 border animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white text-base flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {partName || 'Punto anatómico'}
                            </h3>
                            <button onClick={() => setMarker(null)} style={{ backgroundColor: 'rgba(64, 64, 64, 0.5)' }} className="p-1 rounded-full hover:bg-neutral-600 transition-colors"><X size={18} style={{ color: '#A0A0A0' }} /></button>
                        </div>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Añada notas médicas sobre esta región..."
                            style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', borderColor: '#3A3A3A' }}
                            className="w-full h-28 p-3 rounded-xl text-sm border outline-none focus:ring-1 transition-all resize-none"
                        />
                        <button
                            onClick={handleSave}
                            disabled={!note.trim()}
                            style={{ backgroundColor: note.trim() ? '#5E5CE6' : '#333333', color: note.trim() ? '#FFFFFF' : '#666666' }}
                            className="mt-4 w-full py-3 rounded-xl font-medium text-sm transition-all shadow-lg flex justify-center items-center gap-2"
                        >
                            <Save size={16} /> Guardar Anotación
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar Data - Z-Anatomy Style */}
            <div style={{ backgroundColor: '#1E1E1E', borderColor: '#2A2A2A' }} className="w-80 border-l flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                {/* Search Header */}
                <div style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }} className="p-4 border-b">
                    <div className="relative">
                        <Search size={16} style={{ color: '#777777' }} className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar estructuras..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ backgroundColor: '#141414', borderColor: '#2A2A2A' }}
                            className="w-full text-white text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none border focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Layer List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {Object.entries(layerVisibility).map(([layerName, isVisible]) => {
                        const isExpanded = expandedGroups[layerName];
                        const hasChildren = ['Sistema esquelético', 'Sistema muscular', 'Sistemas viscerales'].includes(layerName); // Simulated hierarchy

                        return (
                            <div key={layerName} className="mb-0.5">
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group hover:bg-neutral-800 ${isVisible ? 'text-white' : 'text-neutral-500'}`}
                                >
                                    {/* Chevron for expand/collapse (if has children) */}
                                    <button
                                        className={`p-0.5 rounded opacity-50 hover:opacity-100 ${!hasChildren && 'invisible'}`}
                                        onClick={(e) => { e.stopPropagation(); toggleGroup(layerName); }}
                                    >
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>

                                    {/* Eye Icon for Visibility Toggle */}
                                    <button
                                        style={{ color: isVisible ? '#5E5CE6' : '#555555', backgroundColor: isVisible ? 'rgba(94, 92, 230, 0.1)' : 'transparent' }}
                                        className="p-1 rounded-md transition-colors hover:text-white"
                                        onClick={(e) => { e.stopPropagation(); toggleLayer(layerName as keyof typeof layerVisibility); }}
                                    >
                                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>

                                    {/* Layer Name */}
                                    <span
                                        className="text-sm font-medium select-none flex-1 truncate"
                                        onClick={() => toggleLayer(layerName as keyof typeof layerVisibility)}
                                    >
                                        {layerName}
                                    </span>
                                </div>

                                {/* Simulated Children Nodes */}
                                {hasChildren && isExpanded && (
                                    <div style={{ borderColor: '#333333' }} className="ml-8 border-l pl-2 py-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-800 text-xs text-neutral-400 cursor-pointer">
                                            <span className="w-4"></span>
                                            <span className="truncate">Estructura Superior</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-800 text-xs text-neutral-400 cursor-pointer">
                                            <span className="w-4"></span>
                                            <span className="truncate">Estructura Inferior</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer status */}
                <div style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }} className="p-3 border-t flex items-center justify-between text-xs text-neutral-400">
                    <span>Z-Anatomy Pro Engine</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> En línea</span>
                </div>
            </div>

            {/* Custom Scrollbar Styles for the UI */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #3A3A3A;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #555555;
                }
            `}</style>
        </div>
    );
};

export default Body3DDesigner;