import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- DATA ---
const NODES = [
    // DONORS (Global)
    { id: 'us', name: "US Gov / USAID", lat: 38, lon: -77, type: 'donor', region: 'Global', connectsTo: ['unicef', 'acpf', 'ecpat-latam'] },
    { id: 'eu', name: "EU Commission", lat: 50, lon: 4, type: 'donor', region: 'Global', connectsTo: ['unicef', 'anppcan', 'acwc'] },

    // UN (Global)
    { id: 'unicef', name: "UNICEF HQ (NY)", lat: 40, lon: -73, type: 'ingo', region: 'Global', connectsTo: ['arab-council', 'acpf', 'saievac', 'ecpat-asia', 'red-por'] },

    // MENA
    { id: 'arab-council', name: "Arab Council (Cairo)", lat: 30, lon: 31, type: 'regional', region: 'MENA', connectsTo: ['kafa', 'aman'] },
    { id: 'kafa', name: "KAFA (Lebanon)", lat: 33, lon: 35, type: 'local', region: 'MENA', connectsTo: [] },
    { id: 'aman', name: "Aman (Jordan)", lat: 31, lon: 36, type: 'local', region: 'MENA', connectsTo: [] },

    // AFRICA
    { id: 'acpf', name: "African Child Policy Forum", lat: 9, lon: 38, type: 'regional', region: 'Africa', connectsTo: ['anppcan'] },
    { id: 'anppcan', name: "ANPPCAN (Kenya)", lat: -1, lon: 36, type: 'regional', region: 'Africa', connectsTo: [] },

    // SOUTH ASIA
    { id: 'saievac', name: "SAIEVAC (Kathmandu)", lat: 27, lon: 85, type: 'regional', region: 'Asia', connectsTo: ['childline', 'bba'] },
    { id: 'childline', name: "Childline 1098 (India)", lat: 20, lon: 78, type: 'local', region: 'Asia', connectsTo: [] },
    { id: 'bba', name: "Bachpan Bachao (India)", lat: 28, lon: 77, type: 'local', region: 'Asia', connectsTo: [] },

    // LATAM
    { id: 'ecpat-latam', name: "ECPAT Latin America", lat: -12, lon: -77, type: 'regional', region: 'LatAm', connectsTo: ['red-por'] },
    { id: 'red-por', name: "Red por los Derechos", lat: 19, lon: -99, type: 'local', region: 'LatAm', connectsTo: [] },

    // SE ASIA
    { id: 'acwc', name: "ACWC (ASEAN)", lat: -6, lon: 106, type: 'regional', region: 'SEAsia', connectsTo: ['ecpat-asia'] },
    { id: 'ecpat-asia', name: "ECPAT Asia (Bangkok)", lat: 13, lon: 100, type: 'regional', region: 'SEAsia', connectsTo: ['childfund'] },
    { id: 'childfund', name: "ChildFund (Vietnam)", lat: 14, lon: 108, type: 'local', region: 'SEAsia', connectsTo: [] },
];

const BUTTON_LABELS = {
    'Global': 'GLOBAL VIEW',
    'MENA': 'MIDDLE EAST & N. AFRICA',
    'Africa': 'SUB-SAHARAN AFRICA',
    'Asia': 'SOUTH ASIA',
    'SEAsia': 'SOUTHEAST ASIA',
    'LatAm': 'LATIN AMERICA'
};

const getPos = (lat, lon) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = 6.0;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = (r * Math.sin(phi) * Math.sin(theta));
    const y = (r * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

// --- WIREFRAME GLOBE ---
const WireframeGlobe = () => {
    const meshRef = useRef();
    useFrame(() => {
        if (meshRef.current) meshRef.current.rotation.y += 0.0005;
    });

    return (
        <group ref={meshRef}>
            {/* Main Wireframe Sphere - Faint */}
            <Sphere args={[5.8, 32, 32]}>
                <meshBasicMaterial color="#888888" wireframe transparent opacity={0.05} depthWrite={false} />
            </Sphere>
            {/* Removed Inner Core to prevent line occlusion */}
        </group>
    );
};

// Interactive System Logic
const InteractiveSystem = ({ activeRegion }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    // Map Nodes to Positions
    const nodes = useMemo(() => NODES.map(n => ({ ...n, pos: getPos(n.lat, n.lon) })), []);

    // Filter Lines
    const lines = useMemo(() => {
        const l = [];
        nodes.forEach(source => {
            source.connectsTo.forEach(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (target) {
                    l.push({ start: source.pos, end: target.pos, sourceId: source.id, targetId: target.id });
                }
            });
        });
        return l;
    }, [nodes]);

    // Handle Region Change
    useEffect(() => {
        if (activeRegion) {
            const regionalNode = nodes.find(n => n.region === activeRegion && n.type === 'regional');
            if (regionalNode) setSelectedNode(regionalNode.id);
        }
    }, [activeRegion, nodes]);

    return (
        <group>
            {/* Draw Lines */}
            {lines.map((line, i) => {
                const isConnected = selectedNode === line.sourceId || selectedNode === line.targetId;
                const isGlobal = activeRegion === 'Global' && false;
                if (!isConnected && !isGlobal) return null;

                return (
                    <Line key={i} points={[line.start, line.end]} color={selectedNode === line.sourceId ? "#00ffff" : "#ffff00"} opacity={0.8} transparent lineWidth={2} />
                );
            })}

            {/* Draw Nodes */}
            {nodes.map((n, i) => {
                const isSelected = selectedNode === n.id;
                const isRegionActive = activeRegion === 'Global' || n.region === activeRegion;
                return (
                    <mesh
                        key={i} position={n.pos} onClick={(e) => { e.stopPropagation(); setSelectedNode(n.id); }}
                        onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'default'}
                    >
                        <sphereGeometry args={[isSelected ? 0.2 : 0.1, 16, 16]} />
                        <meshBasicMaterial color={isSelected ? '#ffffff' : (n.type === 'donor' ? '#00bbff' : (n.type === 'local' ? '#ffcc00' : '#00ffff'))} />
                        {(isSelected || isRegionActive) && (
                            <Html distanceFactor={10}>
                                <div style={{
                                    background: isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)', padding: '5px 10px', borderRadius: '4px', border: isSelected ? '1px solid #fff' : 'none',
                                    color: isSelected ? '#fff' : '#aaa', fontSize: '0.8rem', whiteSpace: 'nowrap', pointerEvents: 'none', transition: 'all 0.3s'
                                }}>
                                    {n.name}
                                </div>
                            </Html>
                        )}
                    </mesh>
                );
            })}
        </group>
    );
};

const RoomInteraction = ({ isActive }) => {
    const [activeRegion, setActiveRegion] = useState('Global');

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
            <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
                <color attach="background" args={['#000000']} /> {/* Pure Black Background */}
                <ambientLight intensity={0.5} />

                <WireframeGlobe />
                <InteractiveSystem activeRegion={activeRegion} />

                <OrbitControls autoRotate={!activeRegion} autoRotateSpeed={0.5} enableZoom={false} />
                <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} opacity={0.5} /> {/* Reduced Stars */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} intensity={1.5} />
                </EffectComposer>
            </Canvas>

            {isActive && (
                <>
                    <div style={{ position: 'absolute', top: '5%', left: '5%', pointerEvents: 'none', maxWidth: '400px' }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Impact', marginBottom: '10px' }}>SYSTEM SUPPORT</h2>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            Organizations do not work in isolation. This visualization maps the critical connections between Global Donors, Regional Bodies, and Local NGOs, demonstrating how resources and advocacy flow across borders to support unseen children.
                        </p>
                    </div>

                    {/* Full Name Region Buttons */}
                    <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '90%' }}>
                        {Object.keys(BUTTON_LABELS).map(region => (
                            <button
                                key={region}
                                onClick={() => setActiveRegion(region)}
                                style={{
                                    background: activeRegion === region ? '#00ffff' : 'rgba(0,0,0,0.7)',
                                    color: activeRegion === region ? '#000' : '#fff',
                                    border: '1px solid #00ffff',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.65rem', // Smaller text
                                    transition: 'all 0.3s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0px' // Removed extra spacing
                                }}
                            >
                                {BUTTON_LABELS[region]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RoomInteraction;
