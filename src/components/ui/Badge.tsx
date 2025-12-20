import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide';

    const variants = {
        success: 'bg-teal-50 text-teal-600 border border-teal-100',
        warning: 'bg-amber-50 text-amber-600 border border-amber-100',
        danger: 'bg-rose-50 text-rose-600 border border-rose-100',
        info: 'bg-blue-50 text-blue-600 border border-blue-100',
        default: 'bg-slate-100 text-slate-500 border border-slate-200',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
