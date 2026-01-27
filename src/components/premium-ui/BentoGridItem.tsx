import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BentoGridItemProps {
    title: string;
    description?: string;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const BentoGridItem = ({
    title,
    description,
    header,
    icon,
    className,
    onClick,
}: BentoGridItemProps) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white border border-transparent justify-between flex flex-col space-y-4 cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-bold text-gray-800 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-normal text-gray-500 text-xs">
                    {description}
                </div>
            </div>
        </motion.div>
    );
};
