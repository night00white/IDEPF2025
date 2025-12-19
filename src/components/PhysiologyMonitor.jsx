import React, { useState, useEffect } from 'react';

const PhysiologyMonitor = ({ stressLevel = 'normal' }) => {
    // Normal: HR 60-80, BR 12-20
    // High: HR 120-140, BR 25-35
    const [heartRate, setHeartRate] = useState(70);
    const [breathingRate, setBreathingRate] = useState(16);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeartRate(prev => {
                const targetMin = stressLevel === 'high' ? 120 : 60;
                const targetMax = stressLevel === 'high' ? 140 : 80;

                // Move towards target range
                let change = 0;
                if (prev < targetMin) change = 2;
                else if (prev > targetMax) change = -2;
                else change = Math.random() > 0.5 ? 1 : -1;

                return prev + change;
            });

            setBreathingRate(prev => {
                const targetMin = stressLevel === 'high' ? 25 : 12;
                const targetMax = stressLevel === 'high' ? 35 : 20;

                let change = 0;
                if (prev < targetMin) change = 1;
                else if (prev > targetMax) change = -1;
                else change = Math.random() > 0.5 ? 0.5 : -0.5;

                return prev + change;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [stressLevel]);

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '20px',
            color: stressLevel === 'high' ? '#ffaaaa' : 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: '0.9rem',
            background: stressLevel === 'high' ? 'rgba(50,0,0,0.5)' : 'rgba(0,0,0,0.3)',
            padding: '10px 15px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            border: stressLevel === 'high' ? '1px solid rgba(255,50,50,0.3)' : '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.5s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff3333', transform: stressLevel === 'high' ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s' }}>♥</span>
                <span>{heartRate} BPM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#33ccff' }}>≈</span>
                <span>{Math.floor(breathingRate)} L/min</span>
            </div>
        </div>
    );
};

export default PhysiologyMonitor;
