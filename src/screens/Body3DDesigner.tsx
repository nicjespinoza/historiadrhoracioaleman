import React, { useState, Suspense, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center, Bounds, useBounds, Environment, ContactShadows, Line } from '@react-three/drei';
import { ArrowLeft, Save, X, AlertTriangle, Trash2, MessageSquarePlus, MapPin, Clock, Edit, ChevronDown, PenTool, Target, Droplet, Hexagon, Minimize2, Maximize2, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import * as THREE from 'three';
import { Patient } from '../types';

// --- MODELS CONFIG ---
const MALE_MODELS = [
    { id: 'ureta1', label: 'Uretra', path: '/models/ureta3.glb', color: '#10B981' },
    { id: 'pene', label: 'Pene', path: '/models/pene1.glb', color: '#3B82F6' },
    { id: 'prostata', label: 'Próstata', path: '/models/prostata.glb', color: '#8B5CF6' },
];
const FEMALE_MODELS = [
    { id: 'mujer', label: 'Aparato', path: '/models/ureta3.glb', color: '#EC4899' },
];

// --- ERROR BOUNDARY ---
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
                    <div className="bg-red-950/80 backdrop-blur-xl p-6 rounded-2xl border border-red-500/30 text-center max-w-xs shadow-2xl">
                        <AlertTriangle className="text-red-400 mx-auto mb-4" size={32} />
                        <h3 className="font-bold text-red-200 mb-2">Error en Visor 3D</h3>
                        <p className="text-red-300 text-[10px] leading-tight mb-4">{this.state.error?.message || 'Error desconocido'}</p>
                        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-red-500 transition-colors">REINTENTAR</button>
                    </div>
                </Html>
            );
        }
        return this.props.children;
    }
}

// --- AUTO-FIT: Fits model to view on load ---
function AutoFit({ children }: { children: React.ReactNode }) {
    const bounds = useBounds();
    useEffect(() => {
        // Animate camera to fit all content ONCE per mount (prevents resetting on state changes)
        bounds.refresh().clip().fit();
    }, []); // Only run once on mount!
    return <>{children}</>;
}

// --- 3D MODEL VIEWER ---
function AnatomyModel({ modelPath, modelId, onPointClick, onPathDrawn, currentMarker, currentColor, currentScale, currentPaths, observations, onDeleteObservation, isDrawingMode, setIsDrawingMode, drawTool, selectedObsId, setSelectedObsId }: any) {
    const gltf = useGLTF(modelPath) as any;
    const scene = gltf.scene;
    const [isDrawingLocal, setIsDrawingLocal] = useState(false);
    const [localPath, setLocalPath] = useState<THREE.Vector3[]>([]);
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    useEffect(() => {
        if (clonedScene) {
            const isFemaleModel = modelId === 'mujer';
            clonedScene.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    const applyRealisticMaterial = (mat: any) => {
                        mat.side = THREE.DoubleSide;
                        const matName = (mat.name || '').toLowerCase();
                        const nodeName = (child.name || '').toLowerCase();
                        const combined = matName + ' ' + nodeName;

                        // --- Realistic Anatomical Colors ---

                        // Specific realistic overrides for Pene model
                        if (modelId === 'pene') {
                            const isPeneInternal = combined.includes('testic') || combined.includes('testis') || combined.includes('cavernosum') || combined.includes('spongiosum') || combined.includes('corpus') || combined.includes('glans') || combined.includes('scrotum') || combined.includes('epididymis') || combined.includes('vas') || combined.includes('deferens') || combined.includes('seminal') || combined.includes('vein') || combined.includes('arter') || combined.includes('prost') || combined.includes('bladder') || combined.includes('vesic') || combined.includes('urethra') || combined.includes('duct') || combined.includes('nerve') || combined.includes('tunica') || combined.includes('albuginea');

                            // Pro-level anatomical properties for a "wet" look
                            mat.roughness = 0.1;
                            mat.metalness = 0.2;
                            if (mat.clearcoat !== undefined) {
                                mat.clearcoat = 1.0;
                                mat.clearcoatRoughness = 0.05;
                            }

                            if (combined.includes('testic') || combined.includes('testis')) {
                                mat.color = new THREE.Color('#FFCACA'); // Rosado vívido para testículos
                                mat.emissive = new THREE.Color('#FF8888');
                                mat.emissiveIntensity = 0.6;
                            } else if (combined.includes('cavernosum') || combined.includes('spongiosum') || combined.includes('corpus')) {
                                mat.color = new THREE.Color('#E60000'); // Rojo sangre arterial
                                mat.emissive = new THREE.Color('#880000');
                                mat.emissiveIntensity = 0.4;
                            } else if (combined.includes('glans')) {
                                mat.color = new THREE.Color('#FF5555');
                                mat.emissive = new THREE.Color('#AA2222');
                                mat.emissiveIntensity = 0.5;
                            } else if (combined.includes('scrotum')) {
                                mat.color = new THREE.Color('#DAA088');
                                mat.emissive = new THREE.Color('#4D2A1C');
                                mat.emissiveIntensity = 0.15;
                            } else if (combined.includes('epididymis') || combined.includes('vas') || combined.includes('deferens') || combined.includes('seminal') || combined.includes('duct')) {
                                mat.color = new THREE.Color('#FFFFE0'); // Marfil brillante
                                mat.emissive = new THREE.Color('#FFFFCC');
                                mat.emissiveIntensity = 0.8;
                            } else if (combined.includes('vein') || combined.includes('venous')) {
                                mat.color = new THREE.Color('#0033FF'); // Azul eléctrico neón
                                mat.emissive = new THREE.Color('#001166');
                                mat.emissiveIntensity = 1.5; // BRILLA para que se note
                            } else if (combined.includes('arter') || combined.includes('vessel')) {
                                mat.color = new THREE.Color('#FF0000');
                                mat.emissive = new THREE.Color('#660000');
                                mat.emissiveIntensity = 1.2;
                            } else if (isPeneInternal) {
                                mat.color = new THREE.Color('#CC6655');
                                mat.emissive = new THREE.Color('#663322');
                                mat.emissiveIntensity = 0.3;
                            } else {
                                // MODO CÁPSULA ULTRA TRANSPARENTE: No bloquea clics hacia adentro
                                mat.transparent = true;
                                mat.opacity = 0.1;
                                mat.depthWrite = false;
                                mat.side = THREE.FrontSide;
                                mat.color = new THREE.Color('#FFE8DA');
                                mat.emissive = new THREE.Color('#3A1C0A');
                                mat.emissiveIntensity = 0.2;
                                // HACER QUE SEA "TRANSPARENTE" A LOS CLICS para poder tocar las arterias/venas de adentro
                                child.raycast = () => null;
                            }
                        }

                        // Si es transparente en pene, no seguimos sobreescribiendo
                        if (mat.transparent && modelId === 'pene') {
                            // ya se le dió estilo
                        }
                        // Skin / external tissue
                        else if (combined.includes('skin') || combined.includes('epiderm') || combined.includes('dermis')) {
                            mat.color = new THREE.Color('#D4A574');
                            mat.roughness = 0.65;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#3D1C0A');
                            mat.emissiveIntensity = 0.08;
                        }
                        // Muscle / soft tissue
                        else if (combined.includes('muscle') || combined.includes('musc') || combined.includes('flexion') || combined.includes('tendon')) {
                            mat.color = new THREE.Color('#8B2E2E');
                            mat.roughness = 0.75;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#4A0E0E');
                            mat.emissiveIntensity = 0.1;
                        }
                        // Bone / cartilage
                        else if (combined.includes('bone') || combined.includes('cartilage') || combined.includes('teeth') || combined.includes('skelet')) {
                            mat.color = new THREE.Color('#E8DCC8');
                            mat.roughness = 0.5;
                            mat.metalness = 0.05;
                            mat.emissive = new THREE.Color('#D4C4A0');
                            mat.emissiveIntensity = 0.05;
                        }
                        // Arteries / blood vessels
                        else if (combined.includes('arter') || combined.includes('blood') || combined.includes('heart') || combined.includes('aorta')) {
                            mat.color = new THREE.Color('#CC3333');
                            mat.roughness = 0.4;
                            mat.metalness = 0.1;
                            mat.emissive = new THREE.Color('#880000');
                            mat.emissiveIntensity = 0.15;
                        }
                        // Veins
                        else if (combined.includes('vein') || combined.includes('venous') || combined.includes('sinus')) {
                            mat.color = new THREE.Color('#3A4A8C');
                            mat.roughness = 0.45;
                            mat.metalness = 0.1;
                            mat.emissive = new THREE.Color('#1A2050');
                            mat.emissiveIntensity = 0.1;
                        }
                        // Nerves
                        else if (combined.includes('nerve') || combined.includes('brain') || combined.includes('neural')) {
                            mat.color = new THREE.Color('#F5E6B8');
                            mat.roughness = 0.55;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#E8D48A');
                            mat.emissiveIntensity = 0.08;
                        }
                        // Organs / viscera
                        else if (combined.includes('organ') || combined.includes('liver') || combined.includes('kidney') || combined.includes('lung') || combined.includes('intestin') || combined.includes('gland')) {
                            mat.color = new THREE.Color('#A85040');
                            mat.roughness = 0.7;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#602820');
                            mat.emissiveIntensity = 0.1;
                        }
                        // Mucosa / membrane
                        else if (combined.includes('mucosa') || combined.includes('membran') || combined.includes('periton')) {
                            mat.color = new THREE.Color('#E8A0A0');
                            mat.roughness = 0.35;
                            mat.metalness = 0.05;
                            mat.emissive = new THREE.Color('#C06060');
                            mat.emissiveIntensity = 0.12;
                        }
                        // Lymph
                        else if (combined.includes('lymph') || combined.includes('spleen')) {
                            mat.color = new THREE.Color('#8CB060');
                            mat.roughness = 0.6;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#506030');
                            mat.emissiveIntensity = 0.08;
                        }
                        // Fascia / fat / connective tissue
                        else if (combined.includes('fascia') || combined.includes('fat') || combined.includes('adipose')) {
                            mat.color = new THREE.Color('#F0D080');
                            mat.roughness = 0.6;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#C0A060');
                            mat.emissiveIntensity = 0.06;
                        }
                        // Urogenital specific (prostata, uretra, etc)
                        else if (combined.includes('prost') || combined.includes('uret') || combined.includes('bladder') || combined.includes('vesic')) {
                            mat.color = new THREE.Color('#C08080');
                            mat.roughness = 0.55;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#804040');
                            mat.emissiveIntensity = 0.12;
                        }
                        // Female reproductive
                        else if (combined.includes('uter') || combined.includes('ovari') || combined.includes('vagina') || combined.includes('cervix') || combined.includes('fallopian')) {
                            mat.color = new THREE.Color('#D08888');
                            mat.roughness = 0.5;
                            mat.metalness = 0.0;
                            mat.emissive = new THREE.Color('#904848');
                            mat.emissiveIntensity = 0.12;
                        }
                        // Default: warm pinkish tone for unmatched tissue
                        else {
                            if (!mat.map) { // Only override if no texture
                                mat.color = new THREE.Color('#C8A090');
                                mat.roughness = 0.6;
                                mat.metalness = 0.02;
                                mat.emissive = new THREE.Color('#503020');
                                mat.emissiveIntensity = 0.06;
                            } else {
                                // Has texture: just enhance rendering
                                mat.roughness = Math.min(mat.roughness || 0.6, 0.75);
                                mat.metalness = Math.min(mat.metalness || 0, 0.1);
                                mat.emissive = new THREE.Color('#1A0A05');
                                mat.emissiveIntensity = 0.05;
                            }
                        }

                        // Female model: hide outer body, show only organs
                        if (isFemaleModel) {
                            // Internal structures that SHOULD be visible
                            const isInternalOrgan = combined.includes('kidney') || combined.includes('renal') ||
                                combined.includes('riñon') || combined.includes('rinon') ||
                                combined.includes('bladder') || combined.includes('vesic') ||
                                combined.includes('vejiga') ||
                                combined.includes('arter') || combined.includes('aorta') ||
                                combined.includes('vein') || combined.includes('vascular') ||
                                combined.includes('blood') || combined.includes('vessel') ||
                                combined.includes('nerve') || combined.includes('neural') ||
                                combined.includes('nervio') ||
                                combined.includes('ureter') || combined.includes('urethr') ||
                                combined.includes('uter') || combined.includes('utero') ||
                                combined.includes('ovari') || combined.includes('ovario') ||
                                combined.includes('fallopian') || combined.includes('trompa') ||
                                combined.includes('tube') || combined.includes('cervix') ||
                                combined.includes('vagina');

                            if (!isInternalOrgan) {
                                // Hide outer body parts completely
                                child.visible = false;
                            }
                        }

                        mat.needsUpdate = true;
                    };

                    if (Array.isArray(child.material)) {
                        child.material.forEach(applyRealisticMaterial);
                    } else {
                        applyRealisticMaterial(child.material);
                    }
                }
            });
        }
    }, [clonedScene]);

    // Calculate marker size relative to model
    const markerSize = useMemo(() => {
        if (!clonedScene) return 0.03;
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        return maxDim * 0.003; // Reduced from 0.008 to make default markers much smaller
    }, [clonedScene]);

    const groupRef = useRef<THREE.Group>(null);

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene}
                onPointerDown={(e: any) => {
                    if (!isDrawingMode) return;
                    e.stopPropagation();
                    if (drawTool === 'line') {
                        const localPoint = groupRef.current ? groupRef.current.worldToLocal(e.point.clone()) : e.point;
                        setLocalPath([localPoint]);
                        setIsDrawingLocal(true);
                    }
                }}
                onPointerMove={(e: any) => {
                    if (!isDrawingMode || !isDrawingLocal || drawTool !== 'line') return;
                    e.stopPropagation();
                    // Add point to stroke
                    const localPoint = groupRef.current ? groupRef.current.worldToLocal(e.point.clone()) : e.point;
                    setLocalPath(prev => [...prev, localPoint]);
                }}
                onPointerUp={(e: any) => {
                    if (!isDrawingMode) return;
                    e.stopPropagation();
                    const localPoint = groupRef.current ? groupRef.current.worldToLocal(e.point.clone()) : e.point;

                    if (drawTool === 'line') {
                        if (isDrawingLocal && localPath.length > 2) {
                            onPathDrawn([...localPath, localPoint], e.object.name || 'Trazo anatómico');
                        }
                        setIsDrawingLocal(false);
                        setLocalPath([]);
                    } else if (drawTool !== 'line') {
                        // Fue solo un clic rápido, sin arrastrar (Mantiene trazos existentes, coloca marcador)
                        onPointClick(localPoint, e.object.name || 'Punto anatómico');
                    }
                }}
            />

            {/* Trazo dibujándose en tiempo real - Siempre arriba */}
            {localPath.length > 1 && (
                <Line points={localPath} color={currentColor || "#B91C1C"} lineWidth={25} dashed={false} transparent depthTest={false} opacity={0.9} />
            )}

            {/* Trazo temporal antes de confirmarlo (Borrador) - Siempre arriba */}
            {currentPaths && currentPaths.map((path: any, idx: number) => (
                <Line key={`current-${idx}`} points={path} color={currentColor || "#B91C1C"} lineWidth={25} dashed={false} transparent depthTest={false} opacity={0.9} />
            ))}

            {/* Marcador actual (temporal) antes de guardar - Siempre arriba */}
            {currentMarker && drawTool !== 'line' && (
                <mesh position={[currentMarker.x, currentMarker.y, currentMarker.z]} renderOrder={999}>
                    {drawTool === 'tumor' && <icosahedronGeometry args={[markerSize * 1.8 * (currentScale || 1), 2]} />}
                    {drawTool === 'quiste' && <sphereGeometry args={[markerSize * 1.5 * (currentScale || 1), 32, 32]} />}
                    {drawTool === 'piedra' && <dodecahedronGeometry args={[markerSize * 1.5 * (currentScale || 1), 0]} />}
                    {drawTool === 'estenosis' && <torusGeometry args={[markerSize * 1.2 * (currentScale || 1), markerSize * 0.4 * (currentScale || 1), 16, 50]} />}
                    {drawTool === 'marker' && <dodecahedronGeometry args={[markerSize * 1.2 * (currentScale || 1), 0]} />}
                    <meshStandardMaterial
                        color={currentColor || "#B91C1C"}
                        roughness={0.7}
                        emissive={currentColor || "#B91C1C"}
                        emissiveIntensity={0.5}
                        depthTest={false}
                        depthWrite={false}
                        transparent={true}
                        opacity={0.9}
                    />
                </mesh>
            )}

            {/* Comentarios guardados */}
            {observations?.map((obs: any) => {
                const obsColor = obs.color || "#10B981"; // Default emerald
                const isSelected = selectedObsId === obs.id;
                // Usar ?? para evitar problema cuando coordenada es 0 (que es considerado falso por ||)
                const posX = obs.coordinates?.x ?? obs.x ?? 0;
                const posY = obs.coordinates?.y ?? obs.y ?? 0;
                const posZ = obs.coordinates?.z ?? obs.z ?? 0;

                const hasMultiplePaths = obs.drawnPaths && obs.drawnPaths.length > 0;
                const hasSinglePath = obs.drawnPath && obs.drawnPath.length > 1;

                return (
                    <group key={obs.id}>
                        {hasMultiplePaths && obs.drawnPaths.map((pathItem: any, i: number) => {
                            const thePath = Array.isArray(pathItem) ? pathItem : (pathItem.points || []);
                            if (thePath.length === 0) return null;
                            return (
                                <Line
                                    key={`obs-${obs.id}-p${i}`}
                                    points={thePath.map((p: any) => new THREE.Vector3(p.x, p.y, p.z))}
                                    color={obsColor}
                                    lineWidth={25}
                                    dashed={false}
                                    transparent
                                    depthTest={false}
                                    opacity={0.8}
                                    onClick={(e) => { e.stopPropagation(); setSelectedObsId(isSelected ? null : obs.id); }}
                                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                                    onPointerOut={() => { document.body.style.cursor = 'crosshair'; }}
                                />
                            );
                        })}
                        {hasSinglePath && !hasMultiplePaths && (
                            <Line
                                points={obs.drawnPath.map((p: any) => new THREE.Vector3(p.x, p.y, p.z))}
                                color={obsColor}
                                lineWidth={20}
                                dashed={false}
                                transparent={true}
                                depthTest={false}
                                opacity={0.8}
                                onClick={(e) => { e.stopPropagation(); setSelectedObsId(isSelected ? null : obs.id); }}
                                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                                onPointerOut={() => { document.body.style.cursor = 'crosshair'; }}
                            />
                        )}
                        {obs.hasMarker !== false && (
                            <group position={[posX, posY, posZ]}>
                                <mesh
                                    renderOrder={999}
                                    onClick={(e) => { e.stopPropagation(); setSelectedObsId(isSelected ? null : obs.id); }}
                                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                                    onPointerOut={() => { document.body.style.cursor = 'crosshair'; }}
                                >
                                    {(obs.markerType === 'tumor') && <icosahedronGeometry args={[markerSize * 1.8 * (obs.scale || 1), 2]} />}
                                    {(obs.markerType === 'quiste') && <sphereGeometry args={[markerSize * 1.5 * (obs.scale || 1), 32, 32]} />}
                                    {(obs.markerType === 'piedra') && <dodecahedronGeometry args={[markerSize * 1.5 * (obs.scale || 1), 0]} />}
                                    {(obs.markerType === 'estenosis') && <torusGeometry args={[markerSize * 1.2 * (obs.scale || 1), markerSize * 0.4 * (obs.scale || 1), 16, 50]} />}
                                    {(!obs.markerType || obs.markerType === 'marker') && <dodecahedronGeometry args={[markerSize * 1.2 * (obs.scale || 1), 0]} />}
                                    <meshStandardMaterial
                                        color={obsColor}
                                        roughness={0.9}
                                        emissive={obsColor}
                                        emissiveIntensity={isSelected ? 1.5 : 0.5}
                                        depthTest={false}
                                        depthWrite={false}
                                        transparent={true}
                                        opacity={0.9}
                                    />
                                </mesh>
                                {/* TEXT LABEL ON MODEL */}
                                <Html center distanceFactor={isSelected ? 10 : 15} position={[0, markerSize * 3 * (obs.scale || 1), 0]}>
                                    <div className={`px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20 transition-all ${isSelected ? 'scale-110 opacity-100 bg-white/10' : 'scale-90 opacity-40 hover:opacity-100 bg-black/40'}`}>
                                        <span className="text-[6px] font-black uppercase text-white tracking-[0.2em]">{(obs.markerType || 'Hallazgo').toUpperCase()}</span>
                                    </div>
                                </Html>
                            </group>
                        )}

                    </group>
                );
            })}
        </group>
    );
}

// --- MAIN COMPONENT ---
export const Body3DDesigner = () => {
    const navigate = useNavigate();
    const { patientId, snapshotId } = useParams();
    const [marker, setMarker] = useState<THREE.Vector3 | null>(null);
    const [drawnPaths, setDrawnPaths] = useState<THREE.Vector3[][]>([]);
    const [note, setNote] = useState('');
    const [obsColor, setObsColor] = useState('#EF4444');
    const [obsScale, setObsScale] = useState(1);
    const [observations, setObservations] = useState<any[]>([]);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawTool, setDrawTool] = useState<'marker' | 'line' | 'tumor' | 'quiste' | 'piedra' | 'estenosis' | 'litiasis'>('piedra');
    const [isCreatingObservation, setIsCreatingObservation] = useState(false);
    const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
    const [obsLocation, setObsLocation] = useState<string>('');
    const [isEditingObs, setIsEditingObs] = useState(false);
    const [stagedObservations, setStagedObservations] = useState<any[]>([]);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const translateLocation = (loc: string) => {
        if (!loc) return 'Localización general';
        const lower = loc.toLowerCase();

        // Specific checks for mesh artifacts
        const isLeft = lower.includes('left') || lower.includes('izq') || lower.includes('l_') || lower.includes('_l') || lower.includes(' iz') || lower.includes('_left') || lower.includes('366');
        const isRight = lower.includes('right') || lower.includes('der') || lower.includes('r_') || lower.includes('_r') || lower.includes(' de') || lower.includes('_right') || lower.includes('365');
        const side = isRight ? 'Derecho' : isLeft ? 'Izquierdo' : '';

        if (lower.includes('kidney') || lower.includes('renal') || lower.includes('riñon') || lower.includes('surface') || lower.includes('vein') || lower.includes('artery')) {
            if (lower.includes('ureter')) return `Uréter ${side}`.trim();
            if (lower.includes('bladder') || lower.includes('vejiga') || lower.includes('vesic')) return 'Vejiga';
            if (lower.includes('urethr') || lower.includes('uretra')) return 'Uretra';

            // If it contains "365" it's right kidney in some models, "366" is left. 
            // Better to rely on "side" if detected, otherwise default to Riñón.
            return `Riñón ${side}`.trim();
        }

        if (lower.includes('ureter')) return `Uréter ${side}`.trim();
        if (lower.includes('bladder') || lower.includes('vejiga') || lower.includes('vesic')) return 'Vejiga';
        if (lower.includes('urethr') || lower.includes('uretra')) return 'Uretra';
        if (lower.includes('prostat')) return 'Próstata';
        if (lower.includes('pene')) return 'Pene';
        return loc.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    };

    const translateMarkerType = (type: string) => {
        const types: any = {
            piedra: 'Piedra',
            litiasis: 'Litiasis',
            tumor: 'Tumor',
            quiste: 'Quiste',
            estenosis: 'Estenosis',
            line: 'Trazo',
            marker: 'Gral'
        };
        return types[type] || 'Hallazgo';
    };

    const anomalyIcons: any = {
        marker: MapPin,
        tumor: Target,
        quiste: Droplet,
        piedra: Hexagon,
        litiasis: Shield,
        estenosis: Minimize2,
        line: PenTool
    };

    // Fetch patient info + observations
    useEffect(() => {
        if (!patientId || snapshotId === 'new') return;
        api.getObservations(patientId, snapshotId).then(setObservations).catch(console.error);
        // Fetch patient details to get sex
        const fetchPatient = async () => {
            try {
                const found = await api.getPatientById(patientId);
                if (found) {
                    setPatient(found);
                    // Auto-select first model
                    const models = found.sex === 'Femenino' ? FEMALE_MODELS : MALE_MODELS;
                    setSelectedModelId(models[0].id);
                }
            } catch (e) { console.error(e); }
        };
        fetchPatient();
    }, [patientId, snapshotId]);

    const availableModels = patient?.sex === 'Femenino' ? FEMALE_MODELS : MALE_MODELS;
    const selectedModel = availableModels.find(m => m.id === selectedModelId) || availableModels[0];

    const handleStage = useCallback(() => {
        const hasDrawnPaths = drawnPaths.length > 0;
        if ((!marker && !hasDrawnPaths) || !note.trim()) return;

        const coords = marker ? { x: marker.x, y: marker.y, z: marker.z } : { x: drawnPaths[0][0].x, y: drawnPaths[0][0].y, z: drawnPaths[0][0].z };

        const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
        const newObs = {
            id: tempId,
            coordinates: coords,
            drawnPaths: hasDrawnPaths ? drawnPaths.map(path => ({ points: path.map(p => ({ x: p.x, y: p.y, z: p.z })) })) : undefined,
            hasMarker: !!marker,
            markerType: drawTool !== 'line' ? drawTool : 'marker',
            note,
            organ: selectedModel?.id || 'anatomy',
            location: obsLocation,
            color: obsColor,
            scale: obsScale,
            createdAt: new Date().toISOString(),
            isStaged: true
        };

        setStagedObservations(prev => [...prev, newObs]);
        setDrawnPaths([]);
        setMarker(null);
        setNote('');
        setIsCreatingObservation(false);
        setIsDrawingMode(false);
    }, [marker, note, selectedModel, drawnPaths, obsColor, obsScale, drawTool, obsLocation]);

    const handleSaveAll = useCallback(async () => {
        if (!patientId) return;
        if (stagedObservations.length === 0) {
            navigate(-1);
            return;
        }

        setIsSavingAll(true);
        try {
            let currentSnapId = snapshotId;
            if (snapshotId === 'new') {
                const newSnap = await api.createSnapshot(patientId);
                currentSnapId = newSnap.id;
            }

            // Save all staged observations sequentially
            for (const obs of stagedObservations) {
                const { id, isStaged, ...data } = obs;
                await api.createObservation(patientId, {
                    ...data,
                    snapshotId: currentSnapId
                });
            }

            navigate(-1);
        } catch (e) {
            console.error(e);
            alert('Error al guardar todos los cambios');
        } finally {
            setIsSavingAll(false);
        }
    }, [patientId, snapshotId, stagedObservations, navigate]);

    const handleDelete = useCallback(async (id: string) => {
        if (id.startsWith('temp_')) {
            setStagedObservations(prev => prev.filter(o => o.id !== id));
            return;
        }
        if (!patientId) return;
        try {
            await api.deleteObservation(patientId, id);
            setObservations(prev => prev.filter(o => o.id !== id));
        } catch (e) { console.error(e); }
    }, [patientId]);

    const handleUpdate = useCallback(async (id: string, updates: any) => {
        if (!patientId) return;
        try {
            await api.updateObservation(patientId, id, updates);
            setObservations(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        } catch (e) { console.error(e); }
    }, [patientId]);

    return (
        <div className="h-screen flex overflow-hidden font-sans bg-[#080c14] text-white select-none">

            {/* === MAIN CONTENT AREA === */}
            <main className="flex-1 relative flex flex-col overflow-hidden">

                {/* TOP HEADER */}
                <header className="h-16 flex items-center justify-between px-8 bg-gradient-to-b from-[#0a0f1a] to-transparent z-40 pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 mr-2"
                            title="Volver"
                        >
                            <ArrowLeft size={18} className="text-white/70" />
                        </button>
                        {patient && (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">Paciente</span>
                                <h1 className="text-sm font-bold text-white/90">{patient.firstName} {patient.lastName}</h1>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pointer-events-auto">
                        {/* Model Selection Tabs */}
                        <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-xl border border-white/10">
                            {availableModels.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModelId(model.id);
                                        setObservations([]);
                                        if (patientId) api.getObservations(patientId, snapshotId).then(setObservations);
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedModelId === model.id
                                        ? 'bg-white/10 text-white shadow-lg'
                                        : 'text-white/40 hover:text-white/70'}`}
                                >
                                    {model.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* 3D CANVAS */}
                <div className="flex-1 relative">
                    <Suspense fallback={
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Cargando Escena</p>
                        </div>
                    }>
                        {selectedModel && (
                            <Canvas key={selectedModel.id} style={{ backgroundColor: 'transparent' }} camera={{ position: [0, 0, 5], fov: 40, near: 0.01, far: 2000 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}>
                                <SceneErrorBoundary>
                                    <ambientLight intensity={0.5} color="#ffffff" />
                                    <pointLight position={[10, 10, 10]} intensity={4.5} />
                                    <pointLight position={[-10, 5, -10]} intensity={2.5} />
                                    <spotLight position={[0, 15, 0]} angle={0.3} intensity={3} />
                                    <Environment files="/hdri/city.hdr" />
                                    <Bounds fit clip margin={0.4}>
                                        <AutoFit>
                                            <Center>
                                                <AnatomyModel
                                                    modelPath={selectedModel.path}
                                                    modelId={selectedModel.id}
                                                    onPointClick={(pt: any, loc: string) => {
                                                        if (drawTool !== 'line') {
                                                            setMarker(pt);
                                                            setObsLocation(loc);
                                                            setIsCreatingObservation(true);
                                                        }
                                                    }}
                                                    onPathDrawn={(path: THREE.Vector3[], loc: string) => {
                                                        setDrawnPaths(prev => [...prev, path]);
                                                        setObsLocation(loc);
                                                        setIsCreatingObservation(true);
                                                    }}
                                                    currentMarker={marker}
                                                    currentColor={obsColor}
                                                    currentScale={obsScale}
                                                    currentPaths={drawnPaths}
                                                    observations={[...observations, ...stagedObservations].filter((obs: any) => obs.organ === selectedModel.id || (!obs.organ && selectedModel.id === availableModels[0].id))}
                                                    onDeleteObservation={handleDelete}
                                                    isDrawingMode={isDrawingMode}
                                                    setIsDrawingMode={setIsDrawingMode}
                                                    drawTool={drawTool}
                                                    selectedObsId={selectedObsId}
                                                    setSelectedObsId={setSelectedObsId}
                                                />
                                            </Center>
                                        </AutoFit>
                                    </Bounds>
                                    <OrbitControls makeDefault rotateSpeed={0.5} enableDamping dampingFactor={0.05} enabled={!isDrawingMode} />
                                </SceneErrorBoundary>
                            </Canvas>
                        )}
                    </Suspense>
                </div>
            </main>

            {/* === FLOATING OBSERVATION LIST & DETAILS (RIGHT) === */}
            <div className="absolute top-24 right-8 z-40 flex flex-col items-end gap-4 pointer-events-none">

                {/* 1. EDITABLE OBSERVATION DETAILS CARD */}
                {selectedObsId && (
                    <div className="pointer-events-auto animate-fade-in-right w-80 bg-[#0a141d]/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex flex-col gap-5">
                        {(() => {
                            const obs = observations.find(o => o.id === selectedObsId);
                            if (!obs) return null;
                            const Icon = anomalyIcons[obs.markerType || 'marker'] || MapPin;
                            return (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5" style={{ color: obs.color || '#10B981' }}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                                    {isEditingObs ? 'Editar Registro' : translateLocation(obs.location || obs.organ)}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[8px] text-white/30 uppercase font-black">
                                                    <Clock size={8} />
                                                    <span>{obs.createdAt ? new Date(obs.createdAt).toLocaleString('es-HN', { day: '2-digit', month: 'short' }) : 'Reciente'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {obs.isStaged && (
                                                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    Sin Guardar
                                                </div>
                                            )}
                                            {!isEditingObs && (
                                                <button
                                                    onClick={() => setIsEditingObs(true)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00a63e]/10 hover:bg-[#00a63e] text-[#00a63e] hover:text-white transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                            )}
                                            <button onClick={() => { setSelectedObsId(null); setIsEditingObs(false); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors"><X size={12} /></button>
                                        </div>
                                    </div>

                                    {!isEditingObs && (
                                        <div className="flex flex-col gap-3">
                                            <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl">
                                                <p className="text-[10px] text-white/70 leading-relaxed italic">
                                                    &quot;{obs.note || 'Sin comentarios'}&quot;
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00a63e]/10 rounded-lg border border-[#00a63e]/10">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: obs.color || '#00a63e' }}></div>
                                                    <span className="text-[8px] text-[#00a63e] font-black uppercase tracking-widest">
                                                        {translateMarkerType(obs.markerType || 'hallazgo')}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] text-white/20 font-medium">Ref: {obs.id?.slice(-4).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {isEditingObs && (
                                        <>

                                            {/* Edit Anomaly Type */}
                                            <div className="grid grid-cols-6 gap-2">
                                                {Object.entries(anomalyIcons).map(([type, IconComponent]: [any, any]) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleUpdate(obs.id, { markerType: type })}
                                                        className={`h-9 rounded-xl flex items-center justify-center transition-all border ${obs.markerType === type ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-40 hover:opacity-80'}`}
                                                    >
                                                        <IconComponent size={14} style={{ color: obs.markerType === type ? obs.color : 'white' }} />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Edit Scale */}
                                            <div className="space-y-2 px-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] text-white/40 uppercase font-black">Escala</span>
                                                    <span className="text-[10px] text-emerald-400 font-black">{(obs.scale || 1).toFixed(1)}</span>
                                                </div>
                                                <input
                                                    type="range" min="0.3" max="5" step="0.1"
                                                    value={obs.scale || 1}
                                                    onChange={e => handleUpdate(obs.id, { scale: Number(e.target.value) })}
                                                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>

                                            {/* Edit Note */}
                                            <textarea
                                                value={obs.note}
                                                onChange={e => handleUpdate(obs.id, { note: e.target.value })}
                                                className="w-full h-24 bg-black/20 border border-white/5 rounded-2xl p-4 text-[11px] outline-none focus:border-emerald-500/30 transition-all resize-none text-white/80 placeholder-white/10"
                                                placeholder="Editar nota..."
                                            />

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { handleDelete(obs.id); setSelectedObsId(null); }}
                                                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all"
                                                >
                                                    Eliminar
                                                </button>
                                                <button
                                                    onClick={() => setSelectedObsId(null)}
                                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all"
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* 2. HISTORY LIST (ICONS) */}
                <div className="pointer-events-auto flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-y-auto max-h-[50vh] custom-scrollbar">
                    {[...observations, ...stagedObservations]
                        .filter(obs => obs.organ === selectedModel?.id)
                        .map((obs, idx) => {
                            const Icon = anomalyIcons[obs.markerType || (obs.drawnPaths ? 'line' : 'marker')] || MapPin;
                            const isSelected = selectedObsId === obs.id;
                            return (
                                <button
                                    key={obs.id}
                                    onClick={() => setSelectedObsId(isSelected ? null : obs.id)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isSelected
                                        ? 'bg-white/10 border-white/20 scale-110 shadow-lg'
                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5'
                                        }`}
                                >
                                    <Icon size={16} style={{ color: obs.color || '#00a63e' }} className={isSelected ? 'animate-pulse' : 'opacity-40'} />
                                </button>
                            );
                        })}
                    {observations.filter(obs => obs.organ === selectedModel?.id).length === 0 && (
                        <div className="w-10 h-10 flex items-center justify-center text-white/10" title="Sin hallazgos">
                            <Target size={20} />
                        </div>
                    )}
                </div>
            </div>

            {/* === FLOATING DOCK (BOTTOM) === */}

            <div className="absolute bottom-8 left-8 right-8 z-50 pointer-events-none flex justify-end items-end gap-4">

                {/* DOCK BAR (Horizontal) */}
                {isDrawingMode && (
                    <div className="pointer-events-auto animate-fade-in-right flex items-center gap-6 px-8 py-4 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mr-4 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50" />

                        {/* 1. Anomalies Group */}
                        <div className="flex items-center gap-1.5 pr-6 border-r border-white/10 relative z-10">
                            {[
                                { id: 'piedra', icon: Hexagon, label: 'Piedra', color: '#F59E0B' },
                                { id: 'tumor', icon: Target, label: 'Tumor', color: '#EF4444' },
                                { id: 'quiste', icon: Droplet, label: 'Quiste', color: '#3B82F6' },
                                { id: 'litiasis', icon: Shield, label: 'Litiasis', color: '#FCD34D' },
                                { id: 'estenosis', icon: Minimize2, label: 'Estenosis', color: '#A855F7' },
                                { id: 'line', icon: PenTool, label: 'Trazo', color: '#10B981' },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setDrawTool(t.id as any)}
                                    className={`group/btn flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${drawTool === t.id
                                        ? 'bg-white/10 text-white border border-white/10 scale-105'
                                        : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                                        }`}
                                >
                                    <t.icon size={16} style={{ color: drawTool === t.id ? t.color : 'inherit' }} />
                                    <span className={`text-[7px] font-black mt-1.5 uppercase tracking-tighter transition-all ${drawTool === t.id ? 'opacity-100 text-[#00a63e]' : 'opacity-0 scale-75 group-hover/btn:opacity-40 group-hover/btn:scale-100'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* 2. Color & Scale Group */}
                        <div className="flex items-center gap-8 px-2 relative z-10">
                            {/* Color Palette */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                {['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#A855F7', '#FFFFFF'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setObsColor(color)}
                                        className={`w-5 h-5 rounded-full transition-all ${obsColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-125' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            {/* Scale Slider */}
                            <div className="flex items-center gap-4 w-48">
                                <Maximize2 size={12} className="text-white/20" />
                                <input
                                    type="range" min="0.3" max="5" step="0.1"
                                    value={obsScale}
                                    onChange={e => setObsScale(Number(e.target.value))}
                                    className="flex-1 accent-emerald-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                />
                                <span className="text-[10px] font-black text-emerald-400 w-8">{obsScale.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN TRIGGER BUTTON (FAB) - Minimalist & Elegant Emerald */}
                <button
                    onClick={() => {
                        if (isDrawingMode) {
                            setIsDrawingMode(false);
                            setIsCreatingObservation(false);
                            setMarker(null);
                            setDrawnPaths([]);
                        } else {
                            setIsDrawingMode(true);
                        }
                    }}
                    className={`pointer-events-auto w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden group border ${isDrawingMode
                        ? 'bg-red-500/80 border-red-400/30 text-white'
                        : 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400/20 text-white'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isDrawingMode ? <X size={24} /> : <PenTool size={24} />}
                    <span className="text-[7px] font-black mt-1 uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                        {isDrawingMode ? 'Cerrar' : 'Lápiz'}
                    </span>

                    {/* Subtle outer glow when active */}
                    {!isDrawingMode && (
                        <div className="absolute -inset-1 bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </button>

                {/* GLOBAL SAVE BUTTON */}
                <button
                    onClick={handleSaveAll}
                    disabled={isSavingAll}
                    className="pointer-events-auto bg-[#00a63e] hover:bg-[#008f36] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isSavingAll ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {isSavingAll ? 'Guardando...' : 'Guardar Todo'}
                </button>
            </div>

            {/* === MINIMALIST FLOATING MODAL === */}
            {isCreatingObservation && (marker || drawnPaths.length > 0) && (
                <div className="fixed bottom-32 right-10 z-[100] animate-fade-in-up w-80">
                    <div className="bg-[#0a141d]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_25px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <MessageSquarePlus size={16} />
                                </div>
                                <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Anotación</span>
                            </div>
                            <button
                                onClick={() => { setIsCreatingObservation(false); setMarker(null); setDrawnPaths([]); setNote(''); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <textarea
                            autoFocus
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Describa el hallazgo..."
                            className="w-full h-28 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs outline-none focus:border-emerald-500/30 transition-all resize-none text-white/90 placeholder-white/20 mb-5 scrollbar-hide"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleStage}
                                disabled={!note.trim()}
                                className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!note.trim()
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
                .animate-fade-in-right { animation: fade-in-right 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Body3DDesigner;