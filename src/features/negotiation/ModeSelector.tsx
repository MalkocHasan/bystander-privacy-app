import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import * as Icons from 'lucide-react';
import type { PrivacyModeType } from '../../types';

export const ModeSelector: React.FC = () => {
    const currentHome = useHomeStore((state) => state.currentHome);
    const setActiveMode = useHomeStore((state) => state.setActiveMode);

    if (!currentHome) return null;

    const handleModeSelect = (modeId: string) => {
        setActiveMode(modeId as PrivacyModeType);
    };

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-8 h-8 mb-3" /> : null;
    };

    // Define Soft UI colors for each mode
    const getModeStyles = (modeId: string, isActive: boolean) => {
        switch (modeId) {
            case 'private': // Safe / Trust
                return isActive
                    ? 'bg-teal-500 text-white shadow-soft-lg ring-4 ring-teal-100'
                    : 'bg-white text-teal-600 hover:bg-teal-50';
            case 'social': // Standard / Active
                return isActive
                    ? 'bg-blue-500 text-white shadow-soft-lg ring-4 ring-blue-100'
                    : 'bg-white text-blue-500 hover:bg-blue-50';
            case 'security': // Caution
                return isActive
                    ? 'bg-amber-500 text-white shadow-soft-lg ring-4 ring-amber-100'
                    : 'bg-white text-amber-500 hover:bg-amber-50';
            default:
                return 'bg-white text-slate-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentHome.availableModes.map((mode) => {
                const isActive = currentHome.activeMode === mode.id;
                const styles = getModeStyles(mode.id, isActive);

                return (
                    <button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.id)}
                        className={`
                            relative flex flex-col items-center justify-center p-6 rounded-3xl text-center
                            transition-all duration-300 ease-out btn-touch border border-transparent
                            ${styles}
                            ${!isActive && 'shadow-soft-sm border-slate-100'}
                        `}
                    >
                        {getIcon(mode.icon)}

                        <span className="font-bold text-lg mb-1 leading-tight">
                            {mode.name}
                        </span>

                        <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {mode.description}
                        </span>

                        {isActive && (
                            <div className="absolute top-3 right-3">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
