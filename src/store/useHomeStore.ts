import { create } from 'zustand';
import type { HomeProfile, PrivacyModeType, Device, DeviceStatus } from '../types';

import { MOCK_HOMES } from '../data/mockHomes';

interface HomeState {
    currentHome: HomeProfile | null;
    isConnected: boolean;

    // Actions
    connectToHome: (homeCode: string) => boolean;
    setActiveMode: (mode: PrivacyModeType) => void;
    disconnect: () => void;
}

/**
 * Apply privacy mode rules to devices
 */
const applyModeRules = (devices: Device[], mode: PrivacyModeType, homeProfile: HomeProfile): Device[] => {
    const selectedMode = homeProfile.availableModes.find(m => m.id === mode);
    if (!selectedMode) return devices;

    return devices.map(device => {
        let newStatus: DeviceStatus = 'active';

        const isInAffectedRoom = selectedMode.rules.affectedRooms
            ? selectedMode.rules.affectedRooms.includes(device.room)
            : true;

        if (isInAffectedRoom) {
            // Apply mode rules
            if (device.type === 'camera' && selectedMode.rules.disableCameras) {
                newStatus = 'masked';
            } else if (device.type === 'speaker' && selectedMode.rules.disableSpeakers) {
                newStatus = 'disabled';
            } else if (device.type === 'sensor' && selectedMode.rules.disableSensors) {
                newStatus = 'disabled';
            }
        }

        return {
            ...device,
            status: newStatus,
        };
    });
};

/**
 * Zustand store for home state management
 */
export const useHomeStore = create<HomeState>((set, get) => ({
    currentHome: null,
    isConnected: false,

    connectToHome: (homeCode: string) => {
        const homeProfile = MOCK_HOMES[homeCode];

        if (homeProfile) {
            set({
                currentHome: homeProfile,
                isConnected: true,
            });
            return true;
        }

        return false;
    },

    setActiveMode: (mode: PrivacyModeType) => {
        const { currentHome } = get();

        if (!currentHome) return;

        const updatedDevices = applyModeRules(
            currentHome.devices,
            mode,
            currentHome
        );

        set({
            currentHome: {
                ...currentHome,
                activeMode: mode,
                devices: updatedDevices,
            },
        });
    },

    disconnect: () => {
        set({
            currentHome: null,
            isConnected: false,
        });
    },
}));
