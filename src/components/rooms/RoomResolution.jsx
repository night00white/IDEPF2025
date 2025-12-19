import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- DATA ---
const RESOURCES = [
    { title: "Safety Toolkit", icon: "🛡️" },
    { title: "Survivor Forum", icon: "💬" },
    { title: "Legal Aid", icon: "⚖️" },
    { title: "Therapy Groups", icon: "❤️" },
    { title: "System Support", icon: "🔒" },
];

// --- SHAPE GENERATION UTILS ---

const NUM_PARTICLES = 2000;

// 1. Pointy (Cone/Pyramid pointing down)
const getPointyPoints = () => {
    const points = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        // Cone: x^2 + z^2 = y^2
        const h = Math.random() * 4; // Height 0 to 4
        // Let y go from -2 to 2. Tip at -2.
        const y = (Math.random() * 4) - 2;
        const radius = ((y + 2) / 4) * 2.5;

        const theta = Math.random() * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);

        points.push(x, y, z);
    }
    return new Float32Array(points);
};

// 2. Spread Out (Galaxy / Wide Sphere)
const getSpreadPoints = () => {
    const points = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const r = 4 + Math.pow(Math.random(), 2) * 6; // 4 to 10
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        points.push(x, y, z);
    }
    return new Float32Array(points);
};

// 3. Crowd / Human Shapes (A group of standing humans)
const getCrowdPoints = () => {
    const points = [];
    const numHumans = 15; // More density
    const particlesPerHuman = Math.floor(NUM_PARTICLES / numHumans);

    for (let h = 0; h < numHumans; h++) {
        const crowdX = (Math.random() - 0.5) * 8;
        const crowdZ = (Math.random() - 0.5) * 4;
        const scale = 0.8 + Math.random() * 0.4;

        for (let i = 0; i < particlesPerHuman; i++) {
            let x, y, z;
            const r = Math.random();

            if (r < 0.2) { // Head
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const rad = 0.4 * scale;
                x = rad * Math.sin(phi) * Math.cos(theta);
                y = (rad * Math.sin(phi) * Math.sin(theta) + 2.5) * scale;
                z = rad * Math.cos(phi);
            } else if (r < 0.55) { // Torso
                x = ((Math.random() - 0.5) * 0.8) * scale;
                y = (Math.random() * 2.5) * scale;
                z = ((Math.random() - 0.5) * 0.5) * scale;
            } else if (r < 0.8) { // Legs
                x = ((Math.random() > 0.5 ? 0.25 : -0.25) + (Math.random() - 0.5) * 0.25) * scale;
                y = (Math.random() * -2.5) * scale;
                z = ((Math.random() - 0.5) * 0.3) * scale;
            } else { // Arms
                const side = Math.random() > 0.5 ? 1 : -1;
                x = side * (0.5 + Math.random() * 0.8) * scale;
                y = (1.0 + (Math.random() - 0.5) * 1.5) * scale;
                z = ((Math.random() - 0.5) * 0.3) * scale;
            }
            points.push(crowdX + x, y - 1, crowdZ + z);
        }
    }
    while (points.length < NUM_PARTICLES * 3) points.push(0, 0, 0);
    return new Float32Array(points);
};

const SHAPES = [
    { name: 'pointy', gen: getPointyPoints },
    { name: 'spread', gen: getSpreadPoints },
    { name: 'crowd', gen: getCrowdPoints }
];

const CosmicParticleSystem = () => {
    const pointsRef = useRef();

    // Precompute all shapes
    const shapePositions = useMemo(() => {
        return SHAPES.map(s => s.gen());
    }, []);

    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [targetShapeIndex, setTargetShapeIndex] = useState(0);

    // Animation State
    const transitionRef = useRef(0); // 0 to 1
    const lastChangeRef = useRef(0);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.elapsedTime;

        // Cycle shapes
        if (time - lastChangeRef.current > 6) { // Switch every 6s
            lastChangeRef.current = time;
            setTargetShapeIndex((prev) => (prev + 1) % SHAPES.length);
            transitionRef.current = 0;
        }

        // Interpolate
        if (transitionRef.current < 1) {
            transitionRef.current += 0.005; // Very smooth transition
        }

        if (transitionRef.current >= 1 && currentShapeIndex !== targetShapeIndex) {
            setCurrentShapeIndex(targetShapeIndex);
            transitionRef.current = 1;
        }

        const positions = pointsRef.current.geometry.attributes.position.array;
        const fromPos = shapePositions[currentShapeIndex];
        const toPos = shapePositions[targetShapeIndex];
        const t = Math.min(transitionRef.current, 1);

        // Cubic easing
        const smoothT = t * t * (3 - 2 * t);

        for (let i = 0; i < NUM_PARTICLES * 3; i++) {
            let px = THREE.MathUtils.lerp(fromPos[i], toPos[i], smoothT);
            let py = THREE.MathUtils.lerp(fromPos[i + 1], toPos[i + 1], smoothT);
            let pz = THREE.MathUtils.lerp(fromPos[i + 2], toPos[i + 2], smoothT);

            // "Cosmic Chaos"
            if (t > 0.1 && t < 0.9) {
                px += (Math.random() - 0.5) * 0.05;
                py += (Math.random() - 0.5) * 0.05;
                pz += (Math.random() - 0.5) * 0.05;
            }

            positions[i] = px;
            positions[i + 1] = py;
            positions[i + 2] = pz;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Gentle rotation
        pointsRef.current.rotation.y = time * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={NUM_PARTICLES}
                    array={new Float32Array(NUM_PARTICLES * 3)}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#00ffff" // Glowing Cyan
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
};

const RoomResolution = ({ isActive, onNavigate }) => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#000000',
            overflow: 'hidden'
        }}>

            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <color attach="background" args={['#020205']} />
                <fog attach="fog" args={['#020205', 8, 30]} />

                <ambientLight intensity={0.5} />

                <CosmicParticleSystem />

                <Sparkles count={400} scale={20} size={3} speed={0.4} opacity={0.4} color="#ffffff" />

                <EffectComposer>
                    <Bloom luminanceThreshold={0.1} intensity={1.5} radius={0.6} />
                </EffectComposer>
            </Canvas>

            {isActive && (
                <>
                    {/* Main Phrase */}
                    <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '90%', maxWidth: '800px', pointerEvents: 'none', zIndex: 10 }}>
                        <h1 style={{
                            color: '#ffffff',
                            fontSize: '1.5rem', // Smaller Font Size
                            fontFamily: 'Helvetica Neue, sans-serif',
                            fontWeight: '300',
                            textShadow: '0 0 10px #00ffff',
                            lineHeight: '1.4',
                            letterSpacing: '1px'
                        }}>
                            "YOU HAVE REFLECTED YOUR EXPERIENCE AND NOW YOU ARE NOT ALONE"
                        </h1>
                    </div>

                    {/* Resources Dock */}
                    <div style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '95%',
                        maxWidth: '800px',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        pointerEvents: 'auto',
                        zIndex: 20
                    }}>
                        {RESOURCES.map((r, i) => (
                            <div key={i} style={{
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                padding: '15px'
                            }}
                                onClick={() => {
                                    if (r.title === "System Support") {
                                        onNavigate(7); // Jump to System Support (Index 7)
                                    }
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <div style={{
                                    fontSize: '2.5rem',
                                    marginBottom: '10px',
                                    color: '#ffffff',
                                    filter: 'grayscale(100%) brightness(2)',
                                    // Removed Text Shadow
                                }}>
                                    {r.icon}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem', // Slightly smaller text
                                    fontWeight: 'bold',
                                    color: '#e0e0e0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {r.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RoomResolution;
