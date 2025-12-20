import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-sm';

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
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
