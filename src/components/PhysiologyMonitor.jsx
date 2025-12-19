import React, { useState, useEffect } from 'react';

const PhysiologyMonitor = () => {
    const [heartRate, setHeartRate] = useState(72);
    const [breathingRate, setBreathingRate] = useState(16);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate Heart Rate between 68 and 85
            setHeartRate(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                let next = prev + change;
                if (next < 68) next = 68;
                if (next > 85) next = 85;
                return next;
            });

            // Fluctuate Breathing Rate between 14 and 20
            setBreathingRate(prev => {
                const change = Math.random() > 0.5 ? 0.5 : -0.5;
                let next = prev + change;
                if (next < 14) next = 14;
                if (next > 20) next = 20;
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: '0.9rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '10px 15px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff3333' }}>♥</span>
                <span>{heartRate} BPM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#33ccff' }}>≈</span>
                <span>{Math.floor(breathingRate)} L/min</span> {/* Abstracting breathing to liters or rate */}
            </div>
        </div>
    );
};

export default PhysiologyMonitor;
