import React from 'react';

const LABEL_CLASS = "block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider";

export const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col mb-4">
        <label className={LABEL_CLASS}>{label}</label>
        {children}
    </div>
);
