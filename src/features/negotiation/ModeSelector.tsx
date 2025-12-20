import React, { useState } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import * as Icons from 'lucide-react';
import type { PrivacyModeType, PrivacyMode } from '../../types';
import { Settings } from 'lucide-react';
import { ModeConfigModal } from './ModeConfigModal';

export const ModeSelector: React.FC = () => {
    const { currentHome, setActiveMode, currentUserRole } = useHomeStore();
    const [editingMode, setEditingMode] = useState<PrivacyMode | null>(null);

    if (!currentHome) return null;

    const handleModeSelect = (modeId: string) => {
        setActiveMode(modeId as PrivacyModeType);
    };

    const handleEditClick = (e: React.MouseEvent, mode: PrivacyMode) => {
        e.stopPropagation();
        setEditingMode(mode);
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
                    ? 'bg-teal-500 text-white shadow-soft-lg ring-4 ring-teal-100 dark:ring-teal-900/50'
                    : 'bg-white text-teal-600 hover:bg-teal-50 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700';
            case 'social': // Standard / Active
                return isActive
                    ? 'bg-blue-500 text-white shadow-soft-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                    : 'bg-white text-blue-500 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700';
            case 'security': // Caution
                return isActive
                    ? 'bg-amber-500 text-white shadow-soft-lg ring-4 ring-amber-100 dark:ring-amber-900/50'
                    : 'bg-white text-amber-500 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700';
            default:
                return 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <>
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
                                ${!isActive && 'shadow-soft-sm border-slate-100 dark:border-slate-700'}
                            `}
                        >
                            {/* Edit Button (Host Only) */}
                            {currentUserRole === 'host' && (
                                <div
                                    onClick={(e) => handleEditClick(e, mode)}
                                    className={`
                                        absolute top-2 right-2 p-2 rounded-full transition-colors z-10
                                        ${isActive
                                            ? 'text-white/70 hover:bg-white/20 hover:text-white'
                                            : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300'
                                        }
                                    `}
                                >
                                    <Settings className="w-4 h-4" />
                                </div>
                            )}

                            {getIcon(mode.icon)}

                            <span className="font-bold text-lg mb-1 leading-tight">
                                {mode.name}
                            </span>

                            <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                {mode.description}
                            </span>

                            {isActive && (
                                <div className="absolute top-3 left-3">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Config Modal */}
            {editingMode && (
                <ModeConfigModal
                    isOpen={!!editingMode}
                    mode={editingMode}
                    onClose={() => setEditingMode(null)}
                />
            )}
        </>
    );
};
