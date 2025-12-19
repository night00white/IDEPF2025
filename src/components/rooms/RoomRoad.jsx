import React from 'react';

const RoomRoad = ({ isActive }) => {
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
                Road Without Exit
            </h1>

            <div className="sketchfab-embed-wrapper" style={{ width: '80%', height: '60%', maxWidth: '1000px', border: '1px solid #333' }}>
                <iframe
                    title="Road without Exit scan and pano"
                    frameBorder="0"
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking="true"
                    execution-while-out-of-viewport="true"
                    execution-while-not-rendered="true"
                    web-share="true"
                    src="https://sketchfab.com/models/c26439780edb45b2818cbe49e0b30c3e/embed?autospin=1&autostart=1&preload=1&transparent=1"
                    style={{ width: '100%', height: '100%' }}
                >
                </iframe>
            </div>
        </div>
    );
};

export default RoomRoad;
