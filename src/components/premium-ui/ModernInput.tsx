import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    label?: string;
}

export const ModernInput = ({ icon, label, className, ...props }: ModernInputProps) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
                        {icon}
                    </div>
                )}
                <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "w-full bg-[#F3F4F6] focus:bg-white",
                        "border-none outline-none ring-0",
                        "rounded-2xl py-4 pr-4",
                        "text-gray-900 placeholder-gray-400",
                        "shadow-sm focus:shadow-md transition-all duration-300",
                        icon ? "pl-12" : "pl-4",
                        className
                    )}
                    {...(props as any)}
                />
            </div>
        </div>
    );
};
