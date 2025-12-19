import React from 'react';

const RoomBurden = ({ isActive }) => {
    return (
        <div className={`room-content`} style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            color: '#fff',
            padding: '20px',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? 'auto' : 'none',
            transition: 'opacity 1s ease-in-out',
            zIndex: 10
        }}>
            <h1 style={{
                fontFamily: 'Impact, sans-serif',
                fontSize: '3rem',
                marginBottom: '2rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textAlign: 'center'
            }}>
                PATHWAYS TO HEALING
            </h1>

            <div style={{ maxWidth: '800px', textAlign: 'center', lineHeight: '1.6', fontSize: '1.2rem', color: '#ccc' }}>
                <p>
                    Understanding the roots of trauma and exploring the solutions that empower survivors to break the silence.
                </p>
            </div>

        </div>
    );
};

export default RoomBurden;
