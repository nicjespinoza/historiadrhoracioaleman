import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ActionPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
}

export const ActionPill = ({ children, icon, variant = 'primary', className, ...props }: ActionPillProps) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-primary hover:bg-secondary/80',
        accent: 'bg-accent text-white hover:bg-accent/90',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-lg transition-colors",
                variants[variant],
                className
            )}
            {...(props as any)}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
        </motion.button>
    );
};
