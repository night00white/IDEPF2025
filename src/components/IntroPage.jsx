import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './IntroPage.css';

const PeterDeJongAttractor = () => {
    const pointsRef = useRef();

    // Peter de Jong Attractor parameters
    // x_n+1 = sin(a * y_n) - cos(b * x_n)
    // y_n+1 = sin(c * x_n) - cos(d * y_n)

    const { positions, colors } = useMemo(() => {
        const count = 50000; // High count for attractor density
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        // Attractor Constants (CHAOS)
        const a = 1.4, b = -2.3, c = 2.4, d = -2.1;

        let x = 0.1, y = 0.1, z = 0.1;

        const color1 = new THREE.Color('#ffffff'); // White
        const color2 = new THREE.Color('#888888'); // Grey

        for (let i = 0; i < count; i++) {
            // 2D Attractor Equation
            const xNext = Math.sin(a * y) - Math.cos(b * x);
            const yNext = Math.sin(c * x) - Math.cos(d * y);

            x = xNext;
            y = yNext;

            // FLAT PROJECTION (Abstract Chaos Cloud)
            // Map x,y directly to screen space spread
            const scale = 2.0;
            const pX = x * scale;
            const pY = y * scale;
            const pZ = (Math.random() - 0.5) * 0.1;

            // Color Mix
            const mix = (Math.sin(x * y) + 1) / 2;
            const finalColor = color1.clone().lerp(color2, mix);

            positions[i * 3] = pX;
            positions[i * 3 + 1] = pY;
            positions[i * 3 + 2] = pZ;

            colors[i * 3] = finalColor.r;
            colors[i * 3 + 1] = finalColor.g;
            colors[i * 3 + 2] = finalColor.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            // Gentle float
            pointsRef.current.rotation.z += 0.001;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.03} vertexColors transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
};

const IntroPage = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Sequence timer
        const timers = [
            setTimeout(() => setStep(1), 500), // Show Header
            setTimeout(() => setStep(2), 1500), // Show Facts & Button
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="intro-container">
            {/* 3D Background: Peter de Jong Attractor */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <color attach="background" args={['#000']} />
                    <PeterDeJongAttractor />
                    <EffectComposer>
                        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.2} />
                    </EffectComposer>
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className={`intro-header ${step >= 1 ? 'visible' : ''}`} style={{ zIndex: 1, position: 'relative' }}>
                <h1 style={{ lineHeight: '0.9', fontSize: '6rem', textShadow: '0 0 30px #d00' }}>SILENT EVIDENCE:<br />MAKING THE<br />INVISIBLE VISIBLE</h1>
                <p style={{ marginTop: '1rem', letterSpacing: '2px', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>• ADVOCACY • DESIGN • DATA •</p>
            </div>

            <div className="intro-content" style={{ zIndex: 1, position: 'relative' }}>
                <div className={`fact-group ${step >= 2 ? 'visible' : ''}`}>

                </div>
            </div>

            <div className={`intro-action ${step >= 2 ? 'visible' : ''}`} style={{ zIndex: 1, position: 'relative' }}>
                <button className="enter-btn" onClick={onComplete}>
                    ENTER EXPERIENCE
                </button>
            </div>
        </div>
    );
};

export default IntroPage;
