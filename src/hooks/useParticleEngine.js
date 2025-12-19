import { useEffect, useRef } from 'react';

export const useParticleEngine = (canvasRef, config = {}) => {
    const requestRef = useRef();

    // Default Config
    const settings = {
        count: 2000,
        colors: ['#ffffff'],
        speed: 1,
        flowFieldScale: 0.005,
        trail: 0.1, // 0 to 1, higher is less trail (more clearing)
        interactionRadius: 200,
        ...config
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Set Dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize Particles
        let particles = [];
        for (let i = 0; i < settings.count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: 0,
                vy: 0,
                size: Math.random() * 2 + 0.5,
                color: settings.colors[Math.floor(Math.random() * settings.colors.length)],
                life: Math.random(),
                baseX: Math.random() * canvas.width, // For returning to origin logic if needed
                baseY: Math.random() * canvas.height
            });
        }

        // Interaction State
        let mouse = { x: -1000, y: -1000 };
        const handleMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMove);

        // Animation Loop
        let time = 0;
        const animate = () => {
            time += 0.005;

            // Clear with trail effect
            ctx.fillStyle = `rgba(5, 5, 5, ${settings.trail})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Simple Flow Field (Simplex-ish noise replacement using Sin/Cos)
                const angle = (Math.cos(p.x * settings.flowFieldScale) + Math.sin(p.y * settings.flowFieldScale + time)) * Math.PI * 2;

                // Base velocity from flow
                p.vx += Math.cos(angle) * 0.1 * settings.speed;
                p.vy += Math.sin(angle) * 0.1 * settings.speed;

                // Friction
                p.vx *= 0.95;
                p.vy *= 0.95;

                // Mouse Interaction (Variable based on specialized logic, but here is generic repulsion)
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < settings.interactionRadius) {
                    const force = (settings.interactionRadius - dist) / settings.interactionRadius;
                    const angleToMouse = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angleToMouse) * force * 0.5;
                    p.vy -= Math.sin(angleToMouse) * force * 0.5;
                }

                // Apply velocity
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [JSON.stringify(settings)]); // Re-run if settings change (shallow compare hack)

    return {};
};
