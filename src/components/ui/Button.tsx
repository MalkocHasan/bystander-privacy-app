import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    className = '',
}) => {
    const baseStyles = 'font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-sm';

    const variants = {
        primary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/20 shadow-lg',
        secondary: 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:shadow-md',
        outline: 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 bg-transparent shadow-none',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        >
            {children}
        </button>
    );
};
