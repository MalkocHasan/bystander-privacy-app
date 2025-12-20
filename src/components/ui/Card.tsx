import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    variant = 'default'
}) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

    const variants = {
        default: 'bg-white shadow-lg hover:shadow-xl',
        outline: 'border-2 border-gray-200 hover:border-gray-300',
        gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg',
    };

    const interactiveStyles = onClick
        ? 'cursor-pointer transform hover:-translate-y-1 active:scale-95'
        : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
