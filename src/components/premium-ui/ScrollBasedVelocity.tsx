import React, { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
} from "framer-motion";
import { wrap } from "@motionone/utils";
import { cn } from "../../lib/utils";

interface ScrollVelocityContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const ScrollVelocityContainer = ({
    children,
    className,
}: ScrollVelocityContainerProps) => {
    return (
        <div className={cn("w-full overflow-hidden", className)}>{children}</div>
    );
};

interface ScrollVelocityRowProps {
    children: React.ReactNode;
    baseVelocity: number;
    direction?: number;
    className?: string;
}

export const ScrollVelocityRow = ({
    children,
    baseVelocity = 100,
    direction = 1,
    className,
}: ScrollVelocityRowProps) => {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false,
    });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1 * direction;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1 * direction;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className={cn("flex flex-nowrap whitespace-nowrap", className)}>
            <motion.div className="flex flex-nowrap" style={{ x }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="block mr-8">
                        {children}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};
