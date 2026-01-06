import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
    label: string;
    value: string;
}

interface FloatingLabelSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label: string;
    options: (string | SelectOption)[];
    icon?: React.ReactNode;
    error?: string;
    success?: boolean;
    containerClassName?: string;
    wrapperClassName?: string;
}

export const FloatingLabelSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(({
    label,
    options,
    icon,
    error,
    success,
    className,
    containerClassName,
    wrapperClassName,
    value,
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
                        success ? "text-green-500" : ""
                    )}>
                        {icon}
                    </div>
                )}

                <div className="relative flex-1 h-14">
                    <motion.label
                        initial={false}
                        animate={{
                            y: isFocused || hasValue ? 8 : 18,
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

                    <select
                        {...props}
                        value={value}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            "w-full h-full bg-transparent border-none outline-none px-0 pt-5 pb-1 text-gray-900 font-medium placeholder-transparent appearance-none cursor-pointer",
                            icon ? "pl-0" : "pl-4",
                            className
                        )}
                    >
                        <option value="" disabled className="hidden"></option>
                        {options.map((opt, idx) => {
                            const optionLabel = typeof opt === 'string' ? opt : opt.label;
                            const optionValue = typeof opt === 'string' ? opt : opt.value;
                            return (
                                <option key={idx} value={optionValue}>
                                    {optionLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Right Icons: Status + Chevron */}
                <div className="pr-4 flex items-center gap-2">
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

                    <motion.div
                        animate={{ rotate: isFocused ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "text-gray-400 transition-colors",
                            isFocused ? "text-primary" : ""
                        )}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
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

FloatingLabelSelect.displayName = 'FloatingLabelSelect';
