import { useRef } from 'react';
import { useParticleEngine } from '../../hooks/useParticleEngine';

const RoomCollaboration = ({ isActive }) => {
    const canvasRef = useRef(null);

    // Config for Generational Link:
    // Fine, delicate, interconnected, golden/amber hints
    useParticleEngine(canvasRef, {
        count: 2000,
        colors: ['#d4af37', '#ffffff', '#888888'], // Gold, white, grey
        speed: 0.8,
        flowFieldScale: 0.008,
        trail: 0.15,
        interactionRadius: 250
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#111' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            {isActive && (
                <div style={{ position: 'absolute', top: '10%', left: '10%', pointerEvents: 'none' }}>
                    <h2 style={{ color: '#d4af37', textTransform: 'uppercase', fontSize: '2rem' }}>Generational Link</h2>
                    <p style={{ color: '#ccc', maxWidth: '300px' }}>Trauma and resilience passed down like a web.</p>
                </div>
            )}
        </div>
    );
};

export default RoomCollaboration;
