import React, { useState, useEffect } from 'react';

const GALLERY_IMAGES = [
    '/assets/gallery/6.jpg',
    '/assets/gallery/Bring-Light-to-Child-Abuse.jpg',
    '/assets/gallery/Drug-Legalization-and-Child-Abuse.jpg',
    '/assets/gallery/LEARN-TW-1024x535.jpg',
    '/assets/gallery/childgood-trauma-impacts.jpg',
    '/assets/gallery/childxray_banner_.jpg',
    '/assets/gallery/download.jpg',
    '/assets/gallery/hq720.jpg',
    '/assets/gallery/images.jpg',
    '/assets/gallery/istockphoto-493884474-612x612.jpg',
    '/assets/gallery/maxresdefault.jpg',
    '/assets/gallery/medium.jpg',
    '/assets/gallery/pandemic-tvnews-May2021.png',
    '/assets/gallery/sddefault.jpg',
    '/assets/gallery/skynews-child-abuse-neglect_4930064.jpg',
    '/assets/gallery/who-gsrpvac-social-media-tile-ig-01.jpg'
];

const RoomNewsPile = ({ isActive }) => {
    const [fragments, setFragments] = useState([]);

    // Reset and start building the pile when active
    useEffect(() => {
        if (!isActive) {
            setFragments([]);
            return;
        }

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex >= GALLERY_IMAGES.length * 3) { // Show more fragments than just source images (repeats allowed for density)
                clearInterval(interval);
                return;
            }

            const src = GALLERY_IMAGES[currentIndex % GALLERY_IMAGES.length];

            // Random properties for collage effect
            const newFragment = {
                id: Date.now() + Math.random(),
                src: src,
                left: 10 + Math.random() * 60, // 10% to 70%
                top: 10 + Math.random() * 60,  // 10% to 70%
                width: 20 + Math.random() * 20, // 20% to 40% width
                rotation: (Math.random() - 0.5) * 20, // -10 to +10 deg
                zIndex: currentIndex
            };

            setFragments(prev => [...prev, newFragment]);
            currentIndex++;

        }, 800); // Add new fragment every 800ms

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#000',
            overflow: 'hidden'
        }}>

            {/* Title Overlay */}
            <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                textAlign: 'center',
                zIndex: 1000,
                mixBlendMode: 'difference'
            }}>
                <h1 style={{
                    color: '#fff',
                    fontSize: '3rem',
                    fontFamily: 'Impact, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '5px'
                }}>
                    REALITY FRAGMENTS
                </h1>
                <p style={{ color: '#aaa', fontSize: '1rem', marginTop: '10px' }}>
                    SILENT EVIDENCE
                </p>
            </div>

            {/* Fragments Container */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {fragments.map((frag) => (
                    <div
                        key={frag.id}
                        className="gallery-anim-enter"
                        style={{
                            position: 'absolute',
                            left: `${frag.left}%`,
                            top: `${frag.top}%`,
                            width: `${frag.width}%`,
                            transform: `rotate(${frag.rotation}deg)`,
                            zIndex: frag.zIndex,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.5s ease'
                        }}
                    >
                        <img
                            src={frag.src}
                            alt="fragment"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                filter: 'grayscale(100%)'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomNewsPile;
