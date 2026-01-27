import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    success?: boolean;
    containerClassName?: string;
    wrapperClassName?: string;
    as?: 'input' | 'textarea';
    rows?: number;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, FloatingLabelInputProps>(({
    label,
    icon,
    error,
    success,
    className,
    containerClassName,
    wrapperClassName,
    value,
    as = 'input',
    rows,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== '' && value !== undefined;

    return (
        <div className={cn("relative mb-6", containerClassName)}>
            <motion.div
                animate={isFocused ? "focused" : "idle"}
                variants={{
                    idle: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
                    focused: { scale: 1.02, boxShadow: "0px 10px 30px -10px rgba(0,0,0,0.1)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "relative flex items-center w-full rounded-2xl border transition-all duration-300 overflow-hidden",
                    isFocused ? "bg-white border-primary/30" : "bg-gray-50/50 border-transparent",
                    error ? "border-red-500/50 bg-red-50/10" : "",
                    success ? "border-green-500/50 bg-green-50/10" : "",
                    wrapperClassName
                )}
            >
                {/* Icon */}
                {icon && (
                    <div className={cn(
                        "pl-4 pr-2 transition-colors duration-300",
                        isFocused ? "text-primary" : "text-gray-400",
                        error ? "text-red-500" : "",
                        success ? "text-green-500" : "",
                        as === 'textarea' ? "self-start mt-4" : ""
                    )}>
                        {icon}
                    </div>
                )}

                <div className={cn("relative flex-1", as === 'textarea' ? "h-auto py-2" : "h-14")}>
                    <motion.label
                        initial={false}
                        animate={{
                            y: isFocused || hasValue ? (as === 'textarea' ? 4 : 8) : (as === 'textarea' ? 12 : 18),
                            x: isFocused || hasValue ? 0 : 0,
                            scale: isFocused || hasValue ? 0.75 : 1,
                            opacity: isFocused || hasValue ? 0.7 : 0.5
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={cn(
                            "absolute left-0 pointer-events-none font-medium origin-top-left",
                            icon ? "pl-0" : "pl-4",
                            error ? "text-red-500" : "text-gray-500"
                        )}
                    >
                        {label}
                    </motion.label>

                    {as === 'textarea' ? (
                        <textarea
                            {...(props as any)}
                            value={value}
                            rows={rows || 3}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e as any);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                props.onBlur?.(e as any);
                            }}
                            className={cn(
                                "w-full bg-transparent border-none outline-none px-0 pt-6 pb-1 text-gray-900 font-medium placeholder-transparent resize-none",
                                icon ? "pl-0" : "pl-4",
                                className
                            )}
                            placeholder={label}
                        />
                    ) : (
                        <input
                            {...(props as any)}
                            value={value}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e as any);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                props.onBlur?.(e as any);
                            }}
                            className={cn(
                                "w-full h-full bg-transparent border-none outline-none px-0 pt-5 pb-1 text-gray-900 font-medium placeholder-transparent",
                                icon ? "pl-0" : "pl-4",
                                className
                            )}
                            placeholder={label}
                        />
                    )}
                </div>

                {/* Status Icons */}
                <div className={cn("pr-4", as === 'textarea' ? "self-start mt-4" : "")}>
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error-icon"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-red-500"
                            >
                                <AlertCircle size={20} />
                            </motion.div>
                        )}
                        {success && !error && (
                            <motion.div
                                key="success-icon"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="text-green-500"
                            >
                                <Check size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="text-xs text-red-500 font-medium mt-1 ml-2 flex items-center gap-1"
                    >
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';
