import { create } from 'zustand';
import type { HomeProfile, PrivacyModeType, Device, DeviceStatus, UserRole, AccessRequest, RequestType } from '../types';

import { MOCK_HOMES } from '../data/mockHomes';

interface HomeState {
    currentHome: HomeProfile | null;
    isConnected: boolean;

    // Negotiation State
    currentUserRole: UserRole;
    pendingRequests: AccessRequest[];

    // Actions
    connectToHome: (homeCode: string) => boolean;
    setActiveMode: (mode: PrivacyModeType) => void;
    disconnect: () => void;

    // Negotiation Actions
    setUserRole: (role: UserRole) => void;
    addRequest: (deviceId: number, requestType: RequestType) => void;
    approveRequest: (requestId: string) => void;
    denyRequest: (requestId: string) => void;
    updateDeviceStatus: (deviceId: number, status: DeviceStatus) => void;
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
    currentUserRole: 'guest',
    pendingRequests: [],

    connectToHome: (homeCode: string) => {
        const homeProfile = MOCK_HOMES[homeCode];

        if (homeProfile) {
            set({
                currentHome: homeProfile,
                isConnected: true,
                pendingRequests: [], // Reset requests on new connection
                currentUserRole: 'guest'
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
            pendingRequests: [],
        });
    },

    // --- Negotiation Actions ---

    setUserRole: (role: UserRole) => {
        set({ currentUserRole: role });
    },

    addRequest: (deviceId: number, requestType: RequestType) => {
        const { currentHome } = get();
        if (!currentHome) return;

        const device = currentHome.devices.find(d => d.id === deviceId);
        if (!device) return;

        const newRequest: AccessRequest = {
            id: Math.random().toString(36).substr(2, 9),
            deviceId,
            deviceName: device.name,
            requestType,
            status: 'pending',
            timestamp: Date.now(),
        };

        set(state => ({
            pendingRequests: [...state.pendingRequests, newRequest]
        }));
    },

    approveRequest: (requestId: string) => {
        const { pendingRequests, currentHome } = get();
        if (!currentHome) return;

        const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const request = pendingRequests[requestIndex];

        // Update Request Status
        const updatedRequests = [...pendingRequests];
        updatedRequests[requestIndex] = { ...request, status: 'approved' };

        // Update Device Status based on request type
        // Prayer -> Disabled (Max Privacy), Comfort -> Masked (Soft Privacy)
        const targetStatus: DeviceStatus = request.requestType === 'prayer' ? 'disabled' : 'masked';

        const updatedDevices = currentHome.devices.map(d =>
            d.id === request.deviceId ? { ...d, status: targetStatus } : d
        );

        set({
            pendingRequests: updatedRequests,
            currentHome: {
                ...currentHome,
                devices: updatedDevices
            }
        });
    },

    denyRequest: (requestId: string) => {
        const { pendingRequests } = get();
        const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const updatedRequests = [...pendingRequests];
        updatedRequests[requestIndex] = { ...updatedRequests[requestIndex], status: 'rejected' };

        set({ pendingRequests: updatedRequests });
    },

    updateDeviceStatus: (deviceId: number, status: DeviceStatus) => {
        const { currentHome } = get();
        if (!currentHome) return;

        const updatedDevices = currentHome.devices.map(d =>
            d.id === deviceId ? { ...d, status } : d
        );

        set({
            currentHome: {
                ...currentHome,
                devices: updatedDevices
            }
        });
    }
}));
