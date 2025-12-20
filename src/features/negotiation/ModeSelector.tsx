import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { PrivacyMode, PrivacyModeType } from '../../types';
import * as Icons from 'lucide-react';

export const ModeSelector: React.FC = () => {
    const currentHome = useHomeStore((state) => state.currentHome);
    const setActiveMode = useHomeStore((state) => state.setActiveMode);

    if (!currentHome) return null;

    const handleModeSelect = (modeId: PrivacyModeType) => {
        setActiveMode(modeId);
    };

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
    };

    const getModeCardStyles = (mode: PrivacyMode, isActive: boolean) => {
        const colorMap = {
            security: isActive
                ? 'border-security-600 bg-security-50/50'
                : 'border-gray-200 hover:border-security-400',
            social: isActive
                ? 'border-social-600 bg-social-50/50'
                : 'border-gray-200 hover:border-social-400',
            private: isActive
                ? 'border-private-600 bg-private-50/50'
                : 'border-gray-200 hover:border-private-400',
        };

        return colorMap[mode.color as keyof typeof colorMap] || 'border-gray-200';
    };

    const getModeIconColor = (mode: PrivacyMode, isActive: boolean) => {
        const colorMap = {
            security: isActive ? 'text-security-600' : 'text-gray-400',
            social: isActive ? 'text-social-600' : 'text-gray-400',
            private: isActive ? 'text-private-600' : 'text-gray-400',
        };

        return colorMap[mode.color as keyof typeof colorMap] || 'text-gray-400';
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy Modes</h3>
                <p className="text-sm text-gray-600">Select how you'd like your privacy protected</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {currentHome.availableModes.map((mode) => {
                    const isActive = currentHome.activeMode === mode.id;

                    return (
                        <div
                            key={mode.id}
                            onClick={() => handleModeSelect(mode.id)}
                            className={`
                border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300
                transform hover:scale-[1.02] active:scale-[0.98]
                ${getModeCardStyles(mode, isActive)}
                ${isActive ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
              `}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`
                  flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                  ${isActive ? `bg-${mode.color}-100` : 'bg-gray-100'}
                  transition-colors duration-300
                `}>
                                    <div className={getModeIconColor(mode, isActive)}>
                                        {getIcon(mode.icon)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900">{mode.name}</h4>
                                        {isActive && (
                                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                <Icons.Check className="w-3 h-3" />
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{mode.description}</p>

                                    {/* Rules Summary */}
                                    {isActive && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {mode.rules.disableCameras && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                    📷 Cameras masked
                                                </span>
                                            )}
                                            {mode.rules.disableSpeakers && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                    🔇 Speakers off
                                                </span>
                                            )}
                                            {mode.rules.disableSensors && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                    📡 Sensors off
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
