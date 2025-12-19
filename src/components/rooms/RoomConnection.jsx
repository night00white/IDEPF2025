import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const EARTH_TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg';

// COLOR PALETTE - "Shades of Red and White"
const C_1 = new THREE.Color('#2b0505'); // Very Dark Red
const C_2 = new THREE.Color('#4a0a0a');
const C_3 = new THREE.Color('#6b1010');
const C_4 = new THREE.Color('#8f1515'); // Medium Red
const C_5 = new THREE.Color('#b31b1b');
const C_6 = new THREE.Color('#d62222');
const C_7 = new THREE.Color('#ff4d4d'); // Light Red starts
const C_8 = new THREE.Color('#ff8080');
const C_9 = new THREE.Color('#ffb3b3'); // Very Light Red/Pink
const C_10 = new THREE.Color('#ffffff'); // Pure White

const C_GREY = new THREE.Color('#111111');

// HELPER: Convert Vector3 to Lat/Lon
const vector3ToLatLon = (vector) => {
    const p = vector.clone().normalize();
    const phi = Math.acos(p.y);
    const theta = Math.atan2(p.z, -p.x);

    const lat = 90 - (phi * 180 / Math.PI);
    let lon = (theta * 180 / Math.PI) - 180;

    if (lon < -180) lon += 360;
    if (lon > 180) lon -= 360;

    return { lat, lon };
};

// DATA CONTENT (Updated: N. Europe Highest, USA -> North America)
const REGIONAL_DATA = [
    {
        id: 0,
        region: "Conflict & Failed States",
        color: "#ff4d4d",
        particleColor: C_1,
        visIndex: "~5–10% (Lowest)",
        examples: "Afghanistan, South Sudan, Somalia, Syria, Yemen",
        why: ["No functioning reporting systems", "Abuse by armed groups", "Survival > justice", "NGOs document only fragments"],
        evidence: ["Humanitarian reports", "Survivor testimonies", "Almost no police or court data"],
        note: "Abuse exists almost entirely outside record systems",
        check: (lat, lon) => (lat > 29 && lat < 38 && lon > 60 && lon < 72)
    },
    {
        id: 1,
        region: "Sub-Saharan Africa",
        color: "#ff4d4d",
        particleColor: C_2,
        visIndex: "~10–20%",
        examples: "DR Congo, Nigeria, Ethiopia, Uganda",
        why: ["Weak infrastructure", "Informal justice systems", "Child labor & marriage normalize abuse", "Under-resourced child services"],
        evidence: ["Household surveys (WHO, UNICEF)", "Hospital injury data", "Very low prosecution rates"],
        note: null,
        check: (lat, lon) => (lat > -35 && lat < 15 && lon > -20 && lon < 55)
    },
    {
        id: 2,
        region: "Middle East & North Africa (MENA)",
        color: "#ff4d4d",
        particleColor: C_3,
        visIndex: "~15–25%",
        examples: "Saudi Arabia, Egypt, Iraq, Jordan",
        why: ["Abuse framed as private/family matter", "Honor & shame", "Weak mandatory reporting", "Gendered silencing"],
        evidence: ["NGO case studies", "Medical reports", "Rare public court cases"],
        note: null,
        check: (lat, lon) => (lat > 12 && lat < 40 && lon > -15 && lon < 65)
    },
    {
        id: 3,
        region: "South Asia",
        color: "#ff8080",
        particleColor: C_4,
        visIndex: "~20–35%",
        examples: "India, Pakistan, Bangladesh, Nepal",
        why: ["Family power structures", "Police mistrust", "Long court delays", "Abuse by known adults"],
        evidence: ["Anonymous surveys (high prevalence)", "Low official reporting", "Media coverage only in extreme cases"],
        note: "One of the largest gaps between lived reality and official data",
        check: (lat, lon) => (lat > 5 && lat < 35 && lon > 60 && lon < 95)
    },
    {
        id: 4,
        region: "Southeast Asia (Non-East)",
        color: "#ff8080",
        particleColor: C_5,
        visIndex: "~25–40%",
        examples: "Cambodia, Indonesia, Philippines, Myanmar",
        why: ["Exploitation linked to poverty", "Tourism-related abuse", "Corruption", "Focus on trafficking over domestic abuse"],
        evidence: ["NGO investigations", "International task forces", "Underreported domestic cases"],
        note: null,
        check: (lat, lon) => (lat > -10 && lat < 25 && lon > 95 && lon < 150)
    },
    {
        id: 5,
        region: "Latin America & Caribbean",
        color: "#ffb3b3",
        particleColor: C_6,
        visIndex: "~40–55%",
        examples: "Mexico, Brazil, Honduras, Guatemala",
        why: ["High overall violence desensitizes systems", "Police distrust", "Gang control", "Urban–rural reporting gaps"],
        evidence: ["Police data (partial)", "NGO + media investigations", "Inconsistent child protection response"],
        note: null,
        check: (lat, lon) => (lat > -55 && lat < 30 && lon > -120 && lon < -35)
    },
    {
        id: 6,
        region: "East Asia",
        color: "#ffb3b3",
        particleColor: C_7,
        visIndex: "~45–60%",
        examples: "China, Japan, South Korea",
        why: ["Strong institutions but cultural silence", "Reluctance to report family abuse", "Face-saving norms", "Increasing awareness recently"],
        evidence: ["Government statistics (limited)", "School & welfare data", "Growing media attention"],
        note: null,
        check: (lat, lon) => (lat > 20 && lat < 50 && lon > 100 && lon < 145)
    },
    {
        id: 7,
        region: "Southern & Eastern Europe",
        color: "#ffffff",
        particleColor: C_8,
        visIndex: "~55–70%",
        examples: "Hungary, Poland, Romania, Balkans",
        why: ["Reporting exists but politicized", "Institutional abuse scandals", "NGOs fill gaps", "Uneven enforcement"],
        evidence: ["Court cases", "Media investigations", "EU pressure reports"],
        note: null,
        check: (lat, lon) => (lat > 35 && lat < 48 && lon > 10 && lon < 40)
    },
    {
        id: 8,
        region: "North America",
        color: "#ffffff",
        particleColor: C_9,
        visIndex: "~80–90%",
        examples: "USA, Canada",
        why: ["Mandatory reporting", "Centralized hotlines", "Litigation culture", "Media & data transparency"],
        evidence: ["CPS data", "Court records", "Media + research datasets"],
        note: "Still: Racial, class, and immigration disparities; Underreporting in undocumented communities; Foster system failures",
        check: (lat, lon) => (lat > 25 && lat < 50 && lon > -125 && lon < -65)
    },
    {
        id: 9,
        region: "Northern & Western Europe",
        color: "#ffffff",
        particleColor: C_10,
        visIndex: "~90–98% (Highest)",
        examples: "Sweden, Norway, Germany, UK",
        why: ["Mandatory reporting", "Strong welfare systems", "Media scrutiny", "Survivor advocacy"],
        evidence: ["Police + health + education data", "Longitudinal studies", "Public inquiries"],
        note: "High visibility ≠ solved problem — just better surfaced",
        check: (lat, lon) => (lat > 48 && lat < 70 && lon > -10 && lon < 30)
    },
];

const WorldMapParticles = () => {
    const pointsRef = useRef();
    const [particles, setParticles] = useState(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'Anonymous';
        loader.load(EARTH_TEXTURE_URL, (texture) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(texture.image, 0, 0, 1024, 512);

            const imgData = ctx.getImageData(0, 0, 1024, 512);
            const data = imgData.data;

            const positions = [];
            const colors = [];
            const count = 65000;

            for (let i = 0; i < count; i++) {
                const u = Math.random();
                const v = Math.random();
                const px = Math.floor(u * 1024);
                const py = Math.floor((1 - v) * 512);
                const index = (py * 1024 + px) * 4;
                const brightness = data[index];

                if (brightness > 20) {
                    const lon = (u - 0.5) * 360;
                    const lat = (v - 0.5) * 180;

                    const phi = (90 - lat) * (Math.PI / 180);
                    const theta = (lon + 180) * (Math.PI / 180);
                    const r = 6;

                    let x = -(r * Math.sin(phi) * Math.cos(theta));
                    let z = (r * Math.sin(phi) * Math.sin(theta));
                    let y = (r * Math.cos(phi));

                    let pColor = C_GREY;
                    let scatter = 0.05;
                    let keepProbability = 0.2;

                    // Red Scale Logic 
                    // N. Europe (Highest) -> White
                    if (lat > 48 && lat < 70 && lon > -10 && lon < 30) {
                        pColor = C_10; scatter = 0.01; keepProbability = 1.0;
                    }
                    // N. America (High) -> Very Light Red
                    else if (lat > 25 && lat < 50 && lon > -125 && lon < -65) {
                        pColor = C_9; scatter = 0.02; keepProbability = 0.95;
                    }
                    // S/E Europe -> Light Red
                    else if (lat > 35 && lat < 48 && lon > 10 && lon < 40) {
                        pColor = C_8; scatter = 0.04; keepProbability = 0.9;
                    }
                    // E Asia
                    else if (lat > 20 && lat < 50 && lon > 100 && lon < 145) {
                        pColor = C_7; scatter = 0.06; keepProbability = 0.85;
                    }
                    // LatAm
                    else if (lat > -55 && lat < 30 && lon > -120 && lon < -35) {
                        pColor = C_6; scatter = 0.10; keepProbability = 0.75;
                    }
                    // SE Asia
                    else if (lat > -10 && lat < 25 && lon > 95 && lon < 150) {
                        pColor = C_5; scatter = 0.15; keepProbability = 0.65;
                    }
                    // S Asia -> Scattered
                    else if (lat > 5 && lat < 35 && lon > 60 && lon < 95) {
                        pColor = C_4; scatter = 0.20; keepProbability = 0.6;
                    }
                    // MENA -> Scattered
                    else if (lat > 12 && lat < 40 && lon > -15 && lon < 65) {
                        pColor = C_3; scatter = 0.30; keepProbability = 0.5;
                    }
                    // Sub-Sahara -> Very Scattered
                    else if (lat > -35 && lat < 15 && lon > -20 && lon < 55) {
                        pColor = C_2; scatter = 0.40; keepProbability = 0.4;
                    }

                    // Conflict -> Ghost
                    if (lat > 29 && lat < 38 && lon > 60 && lon < 72) {
                        pColor = C_1; scatter = 0.60; keepProbability = 0.3;
                    }

                    if (Math.random() > keepProbability) continue;

                    x += (Math.random() - 0.5) * scatter;
                    y += (Math.random() - 0.5) * scatter;
                    z += (Math.random() - 0.5) * scatter;

                    positions.push(x, y, z);
                    colors.push(pColor.r, pColor.g, pColor.b);
                }
            }

            setParticles({
                positions: new Float32Array(positions),
                colors: new Float32Array(colors)
            });
        });
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            // pointsRef.current.rotation.y += 0.0005; 
        }
    });

    if (!particles) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.positions.length / 3} array={particles.positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={particles.colors.length / 3} array={particles.colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.045} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
};

const InteractiveGlobe = ({ setRegionIndex }) => {
    const groupRef = useRef();

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.0003;
        }
    });

    const onGlobeClick = (e) => {
        e.stopPropagation();
        const object = e.object;
        const point = e.point;

        const localPoint = object.worldToLocal(point.clone());
        const { lat, lon } = vector3ToLatLon(localPoint);

        const found = REGIONAL_DATA.find(r => r.check(lat, lon));
        if (found) {
            setRegionIndex(found.id);
        }
    };

    return (
        <group ref={groupRef}>
            <WorldMapParticles />
            {/* Invisible Hit Sphere */}
            <mesh onClick={onGlobeClick} visible={false}>
                <sphereGeometry args={[6, 32, 32]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
};

const RoomConnection = ({ isActive }) => {
    const [regionIndex, setRegionIndex] = useState(8); // Default to North America (Index 8)

    const handleNext = () => setRegionIndex((prev) => (prev + 1) % REGIONAL_DATA.length);
    const handlePrev = () => setRegionIndex((prev) => (prev - 1 + REGIONAL_DATA.length) % REGIONAL_DATA.length);

    const currentRegion = REGIONAL_DATA[regionIndex];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
            <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
                <color attach="background" args={['#050101']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[20, 10, 20]} color="#ff4444" intensity={1.5} />

                <InteractiveGlobe setRegionIndex={setRegionIndex} />

                <OrbitControls autoRotate={false} enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={1.2} />
                </EffectComposer>
            </Canvas>

            {isActive && (
                <div style={{
                    position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)',
                    maxWidth: '450px',
                    color: '#fff', pointerEvents: 'auto',
                    textShadow: '0 2px 10px rgba(0,0,0,1)',
                    zIndex: 10
                }}>
                    <div style={{ borderLeft: `6px solid ${currentRegion.color}`, paddingLeft: '20px', background: 'linear-gradient(90deg, rgba(20,0,0,0.9), transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ color: '#ffaaaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', margin: 0 }}>
                                GLOBAL DATA AUDIT: REGION {regionIndex + 1}/{REGIONAL_DATA.length}
                            </h3>
                            {/* Arrows */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handlePrev} style={{ background: 'transparent', border: '1px solid #774444', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>&lt;</button>
                                <button onClick={handleNext} style={{ background: 'transparent', border: '1px solid #774444', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>&gt;</button>
                            </div>
                        </div>

                        <h1 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '5px', color: currentRegion.color }}>
                            {currentRegion.region}
                        </h1>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
                            Visibility Index: <span style={{ color: currentRegion.color }}>{currentRegion.visIndex}</span>
                        </div>

                        <p style={{ color: '#ffdddd', fontSize: '0.9rem', marginBottom: '20px', fontStyle: 'italic' }}>
                            {currentRegion.examples}
                        </p>

                        <div style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#ffaaaa', display: 'block', marginBottom: '5px', textTransform: 'uppercase', fontSize: '0.8rem' }}>WHY REPORTING IS LOW</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {currentRegion.why.map((item, i) => <li key={i} style={{ marginBottom: '4px', fontSize: '0.9rem', color: '#ffcccc' }}>• {item}</li>)}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#ffaaaa', display: 'block', marginBottom: '5px', textTransform: 'uppercase', fontSize: '0.8rem' }}>PRIMARY EVIDENCE TYPE</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {currentRegion.evidence.map((item, i) => <li key={i} style={{ marginBottom: '4px', fontSize: '0.9rem', color: '#ffbbbb' }}>• {item}</li>)}
                            </ul>
                        </div>

                        {currentRegion.note && (
                            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(200, 50, 50, 0.1)', borderLeft: '2px solid #fff', fontSize: '0.85rem', color: '#ffeeee' }}>
                                📌 {currentRegion.note}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomConnection;
