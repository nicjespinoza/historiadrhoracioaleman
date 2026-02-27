import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface GlowingEffectProps {
    spread?: number;
    glow?: boolean;
    disabled?: boolean;
    proximity?: number;
    inactiveZone?: number;
    className?: string;
}

export const GlowingEffect = ({
    spread = 40,
    glow = true,
    disabled = false,
    proximity = 64,
    inactiveZone = 0.01,
    className,
}: GlowingEffectProps) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!containerRef.current || disabled) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check proximity
            if (
                x < -proximity ||
                x > rect.width + proximity ||
                y < -proximity ||
                y > rect.height + proximity
            ) {
                setOpacity(0);
                return;
            }

            setPosition({ x, y });
            setOpacity(1);
        },
        [disabled, proximity]
    );

    useEffect(() => {
        if (disabled) return;
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove, disabled]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "pointer-events-none absolute -inset-px hidden rounded-xl opacity-0 transition-opacity duration-300 md:block",
                glow && "opacity-100",
                className
            )}
            style={{
                opacity: glow ? opacity : 0,
                background: `radial-gradient(${spread}px circle at ${position.x}px ${position.y}px, var(--glow-color, rgba(255,255,255,0.1)), transparent)`,
            }}
        />
    );
};
