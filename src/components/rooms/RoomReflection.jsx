import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Line, Billboard, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- DATA ---
// Updated to reflect "HIDDEN SIGNAL IDENTIFICATION"
const STORY_CATEGORIES = {
    "EMOTIONAL WITHDRAWAL": [
        "It happens in silence.",
        "Deafening hush.",
        "Invisible to everyone.",
        "Nobody notices the signs.",
        "I kept it secret.",
        "Trapped inside.",
        "No way out.",
        "I felt alone."
    ],
    "BEHAVIORAL CHANGES": [
        "Sudden aggression.",
        "Loss of interest.",
        "Scared to speak.",
        "Acting out.",
        "Ignored the signs.",
        "Sleep disturbance.",
        "Nobody listened.",
        "Rebellious behavior."
    ],
    "PHYSICAL SIGNS": [ // Formerly HOPE
        "Unexplained bruises.",
        "Always tired.",
        "Flinching at touch.",
        "Poor hygiene.",
        "Wearing long sleeves.",
        "Weight loss.",
        "Frequent injuries.",
        "Somatic complaints."
    ]
};

// --- COMPONENTS ---

const GlowingSphereNode = ({ position, text, isCenter = false, isClusterCenter = false, isNew = false, onClick }) => {
    const meshRef = useRef();

    // Random subtle rotation for the sphere texture/material feel
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;

            if (isNew) {
                // Pulse effect
                const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
                meshRef.current.scale.setScalar(s);
            }
        }
    });

    const size = isCenter ? 3.5 : (isClusterCenter ? 2.2 : 1.2);
    const color = isNew ? "#ff0000" : (isCenter ? "#ffffff" : (isClusterCenter ? "#00ccff" : "#0066cc"));

    const handlePointerOver = () => {
        document.body.style.cursor = onClick ? 'pointer' : 'auto';
    };

    const handlePointerOut = () => {
        document.body.style.cursor = 'auto';
    };

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* Text INSIDE the sphere */}
                <Billboard FOLLOW={true}>
                    <Text
                        position={[0, 0, 0]} // Centered inside
                        fontSize={isCenter ? 0.5 : (isClusterCenter ? 0.3 : 0.18)}
                        color="#ffffff"
                        maxWidth={isCenter ? 3 : 2}
                        textAlign="center"
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                        fillOpacity={1}
                        toneMapped={false}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {text}
                    </Text>
                    {isNew && (
                        <Text
                            position={[0, -0.5, 0]}
                            fontSize={0.12}
                            color="#ffaaaa"
                            textAlign="center"
                            toneMapped={false}
                        >
                            (Click)
                        </Text>
                    )}
                </Billboard>

                <mesh
                    ref={meshRef}
                    onClick={(e) => {
                        if (onClick) {
                            e.stopPropagation();
                            onClick();
                        }
                    }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <sphereGeometry args={[size, 32, 32]} />
                    {/* Transparent Glassy Material to see text inside */}
                    <meshPhysicalMaterial
                        color={color}
                        transparent
                        opacity={0.2} // More transparent
                        roughness={0.1}
                        metalness={0.1}
                        transmission={0.1} // Slight transmission
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        emissive={color}
                        emissiveIntensity={isNew ? 1.0 : 0.3} // Subtle inner glow
                        toneMapped={false}
                        depthWrite={false} // Important for transparency sorting with text inside
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </Float>
        </group>
    );
};

const NetworkCloud = ({ storiesData, newStoryId, onNavigate }) => {
    const { nodes, connections } = useMemo(() => {
        const _nodes = [];
        const _lines = [];

        const centerPos = [0, 0, 0];
        _nodes.push({ id: 'main-center', text: "HIDDEN SIGNAL IDENTIFICATION", pos: centerPos, isCenter: true });

        const clusterCenters = [
            { id: 'c-silence', name: "EMOTIONAL WITHDRAWAL", pos: [-8, 5, -5] },
            { id: 'c-pain', name: "BEHAVIORAL CHANGES", pos: [8, 3, 4] },
            { id: 'c-hope', name: "PHYSICAL SIGNS", pos: [0, -8, 2] }
        ];

        clusterCenters.forEach((cluster, idx) => {
            _nodes.push({ id: cluster.id, text: cluster.name, pos: cluster.pos, isClusterCenter: true });
            _lines.push([centerPos, cluster.pos]);

            const clusterStories = storiesData[cluster.name] || [];

            clusterStories.forEach((item, i) => {
                const storyText = typeof item === 'string' ? item : item.text;
                const storyId = typeof item === 'string' ? `node-${cluster.name}-${i}` : item.id;

                // Wider distribution
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 4 + Math.random() * 3;

                const x = cluster.pos[0] + r * Math.sin(phi) * Math.cos(theta);
                const y = cluster.pos[1] + r * Math.sin(phi) * Math.sin(theta);
                const z = cluster.pos[2] + r * Math.cos(phi);

                _nodes.push({
                    id: storyId,
                    text: storyText,
                    pos: [x, y, z],
                    isCenter: false,
                    isNew: storyId === newStoryId
                });

                _lines.push([cluster.pos, [x, y, z]]);
            });
        });

        return { nodes: _nodes, connections: _lines };
    }, [storiesData, newStoryId]);

    return (
        <group>
            {connections.map((pts, i) => (
                <Line
                    key={`l-${i}`}
                    points={pts}
                    color="#00aaff"
                    transparent
                    opacity={0.1}
                    lineWidth={1}
                    toneMapped={false}
                />
            ))}

            {nodes.map(node => (
                <GlowingSphereNode
                    key={node.id}
                    position={node.pos}
                    text={node.text}
                    isCenter={node.isCenter}
                    isClusterCenter={node.isClusterCenter}
                    isNew={node.isNew}
                    onClick={node.isNew ? () => onNavigate(4) : undefined}
                />
            ))}
        </group>
    );
};

// ZoomEnter removed or modified to not lock the camera
const CameraController = ({ isActive }) => {
    useFrame((state) => {
        if (!isActive) return;

        // Only animate if we are far away, to simulate entry. 
        // Once close enough, stop forcing position so controls can work.
        const targetZ = 35;
        const cam = state.camera;

        if (cam.position.z > 40) {
            cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetZ, 0.04);
        }
    });
    return null;
}

const RoomReflection = ({ isActive, onNavigate }) => {
    const [story, setStory] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [newStoryId, setNewStoryId] = useState(null);
    const [storiesData, setStoriesData] = useState(STORY_CATEGORIES);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!story.trim()) return;

        const newId = `new-${Date.now()}`;
        setStoriesData(prev => ({
            ...prev,
            "PHYSICAL SIGNS": [...prev["PHYSICAL SIGNS"], { text: story, id: newId }] // Default to adding here for demo
        }));
        setNewStoryId(newId);
        setStory('');
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000' }}>
            <Canvas camera={{ position: [0, 0, 90], fov: 50 }}>
                <color attach="background" args={['#050510']} />
                <fog attach="fog" args={['#050510', 20, 100]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[20, 20, 20]} intensity={1.5} color="#4488ff" />
                <pointLight position={[-20, -10, -10]} intensity={1} color="#cc00ff" />

                <NetworkCloud storiesData={storiesData} newStoryId={newStoryId} onNavigate={onNavigate} />

                <Sparkles count={500} scale={60} size={4} speed={0.2} opacity={0.5} color="#ffffff" toneMapped={false} />
                <CameraController isActive={isActive} />

                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />
                </EffectComposer>

                <OrbitControls
                    enabled={!isTyping}
                    enableRotate={true} // Allow rotate
                    enableZoom={true}   // Explicitly allow zoom
                    enablePan={true}
                    zoomSpeed={1.0}
                    minDistance={5}
                    maxDistance={100}
                    mouseButtons={{
                        LEFT: THREE.MOUSE.ROTATE, // Default rotate
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.PAN
                    }}
                />
            </Canvas>

            {isActive && (
                <>
                    <div style={{
                        position: 'absolute',
                        bottom: '120px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '500px',
                        zIndex: 100
                    }}>
                        <h2 style={{
                            color: '#00aaff',
                            textAlign: 'center',
                            fontFamily: 'Helvetica, sans-serif',
                            fontSize: '1.2rem',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            textShadow: '0 0 10px #00aaff'
                        }}>
                            If you feel comfortable, please share the void your hidden signals
                        </h2>

                        <div style={{ pointerEvents: 'auto' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={story}
                                    onChange={(e) => setStory(e.target.value)}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                    placeholder="Add a node..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.7)',
                                        color: '#fff',
                                        border: '1px solid #00aaff',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        background: '#00aaff',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '45px',
                                        height: '45px',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 15px #00aaff'
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default RoomReflection;
