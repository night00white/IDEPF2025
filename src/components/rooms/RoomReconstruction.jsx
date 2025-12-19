import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

// A simple particle system to symbolize the "fading into particles" or just atmosphere
const AtmosphereParticles = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
            <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#ffffff" />
        </Canvas>
    </div>
);

const RoomReconstruction = ({ isActive, onNavigate }) => {
    // Phases: 'viewing' -> 'reflection'
    const [phase, setPhase] = useState('viewing');
    const [feeling, setFeeling] = useState('');

    useEffect(() => {
        let timer;
        if (isActive && phase === 'viewing') {
            // After 10 seconds of viewing the house, transition to reflection
            timer = setTimeout(() => {
                setPhase('reflection');
            }, 10000);
        } else if (!isActive) {
            setPhase('viewing'); // Reset
            setFeeling('');
        }
        return () => clearTimeout(timer);
    }, [isActive, phase]);

    const handleEmotionClick = (emotion) => {
        setFeeling(emotion);
        // Optional: Auto navigate or show confirmation? 
        // For now, we just select it to show interaction.
        // Maybe change text to "Thank you for acknowledging."
    };

    const containerStyle = {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        zIndex: 1
    };

    // Crop sketchfab header
    const iFrameStyle = {
        width: '100%',
        height: 'calc(100% + 60px)',
        marginTop: '-60px',
        border: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'opacity 2s ease-in-out', // Slow fade
        opacity: phase === 'viewing' ? 1 : 0.3 // Dim it, don't hide completely? Or hide? User said "After the model". Let's dim it to 0.2 to keep context but focus on text.
    };

    return (
        <div className={`room-content`} style={{
            width: '100%',
            height: '100%',
            background: '#000000',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? 'auto' : 'none',
            transition: 'opacity 1s ease-in-out',
            zIndex: 10
        }}>

            {/* Background Particles (Always there or fade in?) */}
            {phase === 'reflection' && <AtmosphereParticles />}

            {/* House Model - Only this one */}
            <div style={{ ...containerStyle }}>
                <iframe
                    title="House Interior"
                    frameBorder="0"
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking="true"
                    execution-while-out-of-viewport="true"
                    execution-while-not-rendered="true"
                    web-share="true"
                    src="https://sketchfab.com/models/89c45d1d5dfa4876ba353c86007084b8/embed?autospin=0.2&autostart=1&preload=1&transparent=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_stop=0&ui_theme=dark"
                    style={iFrameStyle}
                />
            </div>

            {/* Reflection UI overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: phase === 'reflection' ? 'rgba(0,0,0,0.85)' : 'transparent', // Darken background
                pointerEvents: phase === 'reflection' ? 'auto' : 'none',
                opacity: phase === 'reflection' ? 1 : 0,
                transition: 'all 2s ease-in-out',
                zIndex: 20
            }}>
                <h1 key={feeling ? 'valid' : 'question'} style={{
                    color: '#fff',
                    fontFamily: 'Helvetica Neue, sans-serif',
                    fontWeight: 300,
                    fontSize: '2rem',
                    marginBottom: '40px',
                    letterSpacing: '2px',
                    transform: phase === 'reflection' ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'transform 2s ease-out'
                }}>
                    {feeling ? "Your feelings are valid." : "How are you feeling right now?"}
                </h1>

                {!feeling ? (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['Overwhelmed', 'Numb', 'Anxious', 'Hopeful', 'Angry', 'Empty'].map((emotion) => (
                            <button
                                key={emotion}
                                onClick={() => handleEmotionClick(emotion)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #555',
                                    color: '#ccc',
                                    padding: '10px 30px',
                                    borderRadius: '30px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#fff';
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = '#555';
                                    e.currentTarget.style.color = '#ccc';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 1s forwards' }}>
                        <p style={{ color: '#aaa', fontStyle: 'italic', textTransform: 'uppercase' }}>PROCEEDING TO RECONSTRUCTION AND LETS FIND AREA OF INTERVENTION</p>
                        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
                    </div>
                )}
            </div>

        </div>
    );
};

export default RoomReconstruction;
