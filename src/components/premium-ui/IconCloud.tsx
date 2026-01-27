import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface IconCloudProps {
    images: string[];
    className?: string;
}

export const IconCloud: React.FC<IconCloudProps> = ({ images, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [iconTags, setIconTags] = useState<any[]>([]);

    useEffect(() => {
        const tags = images.map((url) => {
            const img = new Image();
            img.src = url;
            return { image: img, x: 0, y: 0, z: 0 };
        });
        setIconTags(tags);
    }, [images]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const radius = Math.min(canvas.width, canvas.height) / 2 * 0.8;
        let rotationX = 0.001;
        let rotationY = 0.001;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            iconTags.forEach((tag) => {
                // Rotate
                const cosX = Math.cos(rotationX);
                const sinX = Math.sin(rotationX);
                const cosY = Math.cos(rotationY);
                const sinY = Math.sin(rotationY);

                const y1 = tag.y * cosX - tag.z * sinX;
                const z1 = tag.z * cosX + tag.y * sinX;
                const x1 = tag.x * cosY - z1 * sinY;
                const z2 = z1 * cosY + tag.x * sinY;

                tag.x = x1;
                tag.y = y1;
                tag.z = z2;

                // Project
                const scale = radius / (radius - tag.z); // Simple perspective
                const alpha = (tag.z + radius) / (2 * radius);

                // Draw
                if (tag.image.complete && alpha > 0) {
                    const size = 40 * scale; // Base size 40
                    ctx.globalAlpha = Math.min(Math.max(alpha, 0), 1);
                    ctx.drawImage(
                        tag.image,
                        centerX + tag.x - size / 2,
                        centerY + tag.y - size / 2,
                        size,
                        size
                    );
                    ctx.globalAlpha = 1;
                }
            });

            // Sort by z for correct layering
            iconTags.sort((a, b) => b.z - a.z);

            animationFrameId = requestAnimationFrame(draw);
        };

        // Initial distribution (Fibonacci Sphere)
        const phi = Math.PI * (3 - Math.sqrt(5));
        iconTags.forEach((tag, i) => {
            const y = 1 - (i / (iconTags.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            tag.x = x * radius;
            tag.y = y * radius;
            tag.z = z * radius;
        });

        draw();

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            rotationY = x * 0.0001;
            rotationX = -y * 0.0001;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [iconTags]);

    return (
        <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className={cn("max-w-full h-auto cursor-pointer", className)}
        />
    );
};
