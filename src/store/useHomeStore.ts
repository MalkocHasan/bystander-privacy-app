import { create } from 'zustand';
import type { HomeProfile, PrivacyModeType, Device, DeviceStatus, UserRole, AccessRequest, RequestType, PrivacyMode } from '../types';

const API_URL = 'http://localhost:3001/api';

interface HomeState {
    currentHome: HomeProfile | null;
    isConnected: boolean;
    pollingId: any; // To track auto-sync interval

    // Negotiation State
    currentUserRole: UserRole;
    pendingRequests: AccessRequest[];

    // Actions
    connectToHome: (homeCode: string) => Promise<boolean>; // Async now
    setActiveMode: (mode: PrivacyModeType) => void;
    disconnect: () => void;

    // Negotiation Actions
    setUserRole: (role: UserRole) => void;
    addRequest: (deviceId: number, requestType: RequestType) => void;
    approveRequest: (requestId: string) => void;
    denyRequest: (requestId: string) => void;
    updateDeviceStatus: (deviceId: number, status: DeviceStatus) => void;

    // Admin Config Action
    updateModeRules: (modeId: PrivacyModeType, rules: Partial<PrivacyMode['rules']>) => void;

    // Theme
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

/**
 * Apply privacy mode rules to devices (Client-Side Logic for Optimistic Updates)
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
            const rules = selectedMode.rules;
            // Apply mode rules with priority: Specific Status > Boolean Toggle
            if (device.type === 'camera') {
                if (rules.cameraStatus) newStatus = rules.cameraStatus;
                else if (rules.disableCameras) newStatus = 'masked';
            }
            else if (device.type === 'speaker') {
                if (rules.speakerStatus) newStatus = rules.speakerStatus;
                else if (rules.disableSpeakers) newStatus = 'disabled';
            }
            else if (device.type === 'sensor') {
                if (rules.sensorStatus) newStatus = rules.sensorStatus;
                else if (rules.disableSensors) newStatus = 'disabled';
            }
        }

        return {
            ...device,
            status: newStatus,
        };
    });
};

/**
 * Zustand store for home state management (Network Enabled)
 */
export const useHomeStore = create<HomeState>((set, get) => ({
    currentHome: null,
    isConnected: false,
    currentUserRole: 'guest',
    pendingRequests: [],
    isDarkMode: false, // Default to light

    // Polling Interval ID
    pollingId: null,

    connectToHome: async (homeCode: string) => {
        try {
            const response = await fetch(`${API_URL}/homes/${homeCode}`);
            if (!response.ok) return false;

            const homeProfile = await response.json();

            // Clear any existing poll
            const { pollingId } = get();
            if (pollingId) clearInterval(pollingId);

            // Start Polling (Auto-Sync every 2 seconds)
            const newPollingId = setInterval(async () => {
                const { currentHome } = get();
                if (!currentHome) return;

                try {
                    const res = await fetch(`${API_URL}/homes/${homeCode}`);
                    if (res.ok) {
                        const updatedData = await res.json();
                        // Only update if strictly necessary to avoid jitter, 
                        // but for now simple replacement is fine for the demo.
                        // We preserve the local 'currentUserRole'
                        set(state => ({
                            currentHome: updatedData,
                            pendingRequests: updatedData.requests || []
                        }));
                    }
                } catch (e) { console.error("Sync failed", e); }
            }, 5000);

            set({
                currentHome: homeProfile,
                isConnected: true,
                pendingRequests: homeProfile.requests || [],
                currentUserRole: 'guest',
                pollingId: newPollingId
            });
            return true;
        } catch (error) {
            console.error("Failed to connect to Home Hub:", error);
            return false;
        }
    },

    setActiveMode: (mode: PrivacyModeType) => {
        const { currentHome } = get();

        if (!currentHome) return;

        // 1. Optimistic Client-Side Update
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

        // 2. Send Command to Hub API
        fetch(`${API_URL}/homes/${currentHome.homeCode}/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        }).catch(err => console.error("Simulated Network Error:", err));
    },

    disconnect: () => {
        const { pollingId } = get();
        if (pollingId) clearInterval(pollingId);

        set({
            currentHome: null,
            isConnected: false,
            pendingRequests: [],
            pollingId: null
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

        // Network Call
        fetch(`${API_URL}/negotiation/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                homeCode: currentHome.homeCode,
                deviceId,
                requestType
            })
        });

        // Optimistic UI
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

        // Optimistic UI Update: Request Status
        const updatedRequests = [...pendingRequests];
        updatedRequests[requestIndex] = { ...request, status: 'approved' };

        // Optimistic UI Update: Device Status
        let targetStatus: DeviceStatus = 'masked';
        if (request.requestType === 'prayer') targetStatus = 'disabled';
        else if (request.requestType === 'restore') targetStatus = 'active';
        else targetStatus = 'masked';

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

        // Network Call: Respond to Negotiation (Server handles device update too)
        fetch(`${API_URL}/negotiation/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                homeCode: currentHome.homeCode,
                requestId,
                status: 'approved'
            })
        });
    },

    denyRequest: (requestId: string) => {
        const { pendingRequests, currentHome } = get();
        if (!currentHome) return;

        const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const updatedRequests = [...pendingRequests];
        updatedRequests[requestIndex] = { ...updatedRequests[requestIndex], status: 'rejected' };

        set({ pendingRequests: updatedRequests });

        // Network Call
        fetch(`${API_URL}/negotiation/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                homeCode: currentHome.homeCode,
                requestId,
                status: 'rejected'
            })
        });
    },

    updateDeviceStatus: (deviceId: number, status: DeviceStatus) => {
        const { currentHome } = get();
        if (!currentHome) return;

        const updatedDevices = currentHome.devices.map(d =>
            d.id === deviceId ? { ...d, status } : d
        );

        // Network Call
        fetch(`${API_URL}/devices/${deviceId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, homeCode: currentHome.homeCode })
        });

        set({
            currentHome: {
                ...currentHome,
                devices: updatedDevices
            }
        });
    },

    // --- Admin Config ---

    updateModeRules: (modeId, newRules) => {
        const { currentHome } = get();
        if (!currentHome) return;

        // 1. Update the availableModes with new rules
        const updatedModes = currentHome.availableModes.map(m =>
            m.id === modeId ? { ...m, rules: { ...m.rules, ...newRules } } : m
        );

        // 2. Create temp home profile to calculate new device states
        const tempHome = { ...currentHome, availableModes: updatedModes };

        // 3. Re-apply rules IF we are editing the currently active mode
        let updatedDevices = currentHome.devices;
        if (currentHome.activeMode === modeId) {
            updatedDevices = applyModeRules(currentHome.devices, modeId, tempHome);
        }

        set({
            currentHome: {
                ...tempHome,
                devices: updatedDevices
            }
        });
    },

    // --- Theme Actions ---

    toggleDarkMode: () => {
        const { isDarkMode } = get();
        const newMode = !isDarkMode;

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        set({ isDarkMode: newMode });
    }
}));
