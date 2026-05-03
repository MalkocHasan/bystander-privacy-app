import { create } from 'zustand';
import type {
    HomeProfile,
    PrivacyModeType,
    Device,
    DeviceStatus,
    UserRole,
    AccessRequest,
    RequestType,
    PrivacyMode,
    DeviceHealth,
    AuditLogEntry,
    AuditLogType
} from '../types';

const API_URL = 'http://localhost:3001/api';

interface HomeState {
    currentHome: HomeProfile | null;
    isConnected: boolean;
    telemetryId: any; // To track simulated device health updates
    socket: WebSocket | null;

    deviceTelemetry: Record<number, { lastSeen: number; health: DeviceHealth }>;
    deviceStreams: Record<number, number[]>;

    // Negotiation State
    currentUserRole: UserRole;
    pendingRequests: AccessRequest[];

    // Audit Log
    auditLog: AuditLogEntry[];
    addAuditLog: (entry: AuditLogEntry) => void;

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
    // CRUD Actions
    addDevice: (device: Omit<Device, 'id' | 'status'>) => void;
    editDevice: (deviceId: number, updates: Partial<Omit<Device, 'id'>>) => void;
    removeDevice: (deviceId: number) => void;
    generatePairingCode: () => Promise<string | null>;

    // Admin Config Action
    updateModeRules: (modeId: PrivacyModeType, rules: Partial<PrivacyMode['rules']>) => void;

    // Theme
    isDarkMode: boolean;
    toggleDarkMode: () => void;

    // AI Auto Host
    isAiAutoHostEnabled: boolean;
    toggleAiAutoHost: () => void;
}

const HEALTH_THRESHOLDS_MS = {
    healthy: 10000,
    degraded: 20000,
};

const MAX_AUDIT_ENTRIES = 50;

const deriveHealth = (lastSeen: number, now: number): DeviceHealth => {
    const age = now - lastSeen;
    if (age <= HEALTH_THRESHOLDS_MS.healthy) return 'healthy';
    if (age <= HEALTH_THRESHOLDS_MS.degraded) return 'degraded';
    return 'offline';
};

const reconcileTelemetry = (
    devices: Device[],
    existing: Record<number, { lastSeen: number; health: DeviceHealth }> = {},
    now: number = Date.now()
) => {
    const next: Record<number, { lastSeen: number; health: DeviceHealth }> = {};
    devices.forEach((device) => {
        const previous = existing[device.id];
        const lastSeen = previous?.lastSeen ?? now - Math.floor(Math.random() * 15000);
        next[device.id] = {
            lastSeen,
            health: deriveHealth(lastSeen, now),
        };
    });
    return next;
};

const hydrateRequests = (requests: AccessRequest[], devices: Device[]) => (
    requests.map((request) => {
        const device = devices.find((d) => d.id === request.deviceId);
        return {
            ...request,
            deviceName: request.deviceName || device?.name || 'Unknown device'
        };
    })
);

const createAuditEntry = (
    type: AuditLogType,
    message: string,
    extras: Partial<AuditLogEntry> = {}
): AuditLogEntry => ({
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    timestamp: Date.now(),
    ...extras
});

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
    isAiAutoHostEnabled: false,
    toggleAiAutoHost: () => {
        set(state => {
            const newState = !state.isAiAutoHostEnabled;
            // Tell the backend about this change if needed, or backend can just read from a request param,
            // but for simplicity, we can just send it when making negotiation requests, or have a separate API.
            // Let's call an API to sync state with backend
            const { currentHome } = state;
            if (currentHome) {
                fetch(`${API_URL}/homes/${currentHome.homeCode}/ai-host`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: newState })
                }).catch(err => console.error(err));
            }
            return { isAiAutoHostEnabled: newState };
        });
    },

    deviceTelemetry: {},
    deviceStreams: {},
    auditLog: [],
    addAuditLog: (entry) => {
        set(state => ({
            auditLog: [entry, ...state.auditLog].slice(0, MAX_AUDIT_ENTRIES)
        }));

        const { currentHome } = get();
        if (!currentHome) return;

        fetch(`${API_URL}/homes/${currentHome.homeCode}/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        }).catch(err => console.error('Audit log sync failed:', err));
    },

    // Polling Interval ID
    telemetryId: null,
    socket: null,

    connectToHome: async (homeCode: string) => {
        try {
            const response = await fetch(`${API_URL}/homes/${homeCode}`);
            if (!response.ok) return false;

            const homeProfile = await response.json();

            // Clear any existing socket or telemetry
            const { socket, telemetryId } = get();
            if (socket) socket.close();
            if (telemetryId) clearInterval(telemetryId);

            const newSocket = new WebSocket('ws://localhost:3001');
            newSocket.addEventListener('open', () => {
                newSocket.send(JSON.stringify({ type: 'subscribe', homeCode }));
            });
            newSocket.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'home:update' && data.payload) {
                        const updatedData = data.payload as HomeProfile;
                        set(state => ({
                            currentHome: updatedData,
                            pendingRequests: hydrateRequests(updatedData.requests || [], updatedData.devices || []),
                            deviceTelemetry: reconcileTelemetry(updatedData.devices, state.deviceTelemetry),
                            auditLog: (updatedData.auditLogs || state.auditLog).slice(0, MAX_AUDIT_ENTRIES)
                        }));
                    } else if (data.type === 'device:stream') {
                        set(state => ({
                            deviceStreams: {
                                ...state.deviceStreams,
                                [data.deviceId]: data.data
                            }
                        }));
                    }
                } catch (error) {
                    console.error('WebSocket message parse failed', error);
                }
            });

            const newTelemetryId = setInterval(() => {
                const { currentHome, deviceTelemetry } = get();
                if (!currentHome) return;

                const now = Date.now();
                const updatedTelemetry: Record<number, { lastSeen: number; health: DeviceHealth }> = { ...deviceTelemetry };

                currentHome.devices.forEach((device) => {
                    const previous = updatedTelemetry[device.id];
                    const shouldPing = Math.random() < 0.75;
                    const lastSeen = shouldPing ? now : previous?.lastSeen ?? now;
                    updatedTelemetry[device.id] = {
                        lastSeen,
                        health: deriveHealth(lastSeen, now)
                    };
                });

                set({ deviceTelemetry: updatedTelemetry });
            }, 5000);

            set({
                currentHome: homeProfile,
                isConnected: true,
                pendingRequests: hydrateRequests(homeProfile.requests || [], homeProfile.devices || []),
                currentUserRole: 'guest',
                telemetryId: newTelemetryId,
                deviceTelemetry: reconcileTelemetry(homeProfile.devices),
                auditLog: (homeProfile.auditLogs || []).slice(0, MAX_AUDIT_ENTRIES),
                socket: newSocket
            });

            get().addAuditLog(
                createAuditEntry(
                    'connection',
                    `Connected to ${homeProfile.homeName}`,
                    { actorRole: 'guest' }
                )
            );
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

        get().addAuditLog(
            createAuditEntry(
                'mode',
                `Mode set to ${mode}`,
                { actorRole: get().currentUserRole, modeId: mode }
            )
        );

        // 2. Send Command to Hub API
        fetch(`${API_URL}/homes/${currentHome.homeCode}/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        }).catch(err => console.error("Simulated Network Error:", err));
    },

    disconnect: () => {
        const { telemetryId, socket } = get();
        if (telemetryId) clearInterval(telemetryId);
        if (socket) socket.close();

        set({
            currentHome: null,
            isConnected: false,
            pendingRequests: [],
            telemetryId: null,
            deviceTelemetry: {},
            deviceStreams: {},
            auditLog: [],
            socket: null
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

        get().addAuditLog(
            createAuditEntry(
                'request',
                `Requested ${requestType} for ${device.name}`,
                { actorRole: get().currentUserRole, deviceId, deviceName: device.name }
            )
        );
    },

    approveRequest: (requestId: string) => {
        const { pendingRequests, currentHome } = get();
        if (!currentHome) return;

        const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const request = pendingRequests[requestIndex];
        const device = currentHome.devices.find(d => d.id === request.deviceId);
        const deviceName = request.deviceName || device?.name || 'Unknown device';

        // Optimistic UI Update: Request Status
        const updatedRequests = [...pendingRequests];
        updatedRequests[requestIndex] = { ...request, status: 'approved', deviceName };

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

        get().addAuditLog(
            createAuditEntry(
                'request',
                `Approved ${request.requestType} for ${deviceName}`,
                { actorRole: get().currentUserRole, deviceId: request.deviceId, deviceName }
            )
        );

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
        const device = currentHome.devices.find(d => d.id === updatedRequests[requestIndex].deviceId);
        const deviceName = updatedRequests[requestIndex].deviceName || device?.name || 'Unknown device';
        updatedRequests[requestIndex] = { ...updatedRequests[requestIndex], status: 'rejected', deviceName };

        set({ pendingRequests: updatedRequests });

        get().addAuditLog(
            createAuditEntry(
                'request',
                `Denied ${updatedRequests[requestIndex].requestType} for ${deviceName}`,
                { actorRole: get().currentUserRole, deviceId: updatedRequests[requestIndex].deviceId, deviceName }
            )
        );

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

        const device = currentHome.devices.find(d => d.id === deviceId);
        get().addAuditLog(
            createAuditEntry(
                'device',
                `Set ${device?.name || 'device'} to ${status}`,
                { actorRole: get().currentUserRole, deviceId, deviceName: device?.name }
            )
        );
    },

    // --- CRUD Actions ---

    addDevice: (deviceData) => {
        const { currentHome } = get();
        if (!currentHome) return;

        // Optimistic Update (Temp ID)
        const newDevice: Device = {
            id: Date.now(),
            status: 'active',
            ...deviceData
        };

        set((state) => ({
            currentHome: {
                ...currentHome,
                devices: [...currentHome.devices, newDevice]
            },
            deviceTelemetry: {
                ...state.deviceTelemetry,
                [newDevice.id]: { lastSeen: Date.now(), health: 'healthy' }
            }
        }));

        get().addAuditLog(
            createAuditEntry(
                'device',
                `Added ${newDevice.name}`,
                { actorRole: get().currentUserRole, deviceId: newDevice.id, deviceName: newDevice.name }
            )
        );

        // Network Call
        fetch(`${API_URL}/homes/${currentHome.homeCode}/devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deviceData)
        }).then(res => res.json()).then(data => {
            if (data.success && data.device) {
                // Correct ID from server
                const { currentHome } = get();
                if (!currentHome) return;
                const fixedDevices = currentHome.devices.map(d =>
                    d.id === newDevice.id ? data.device : d
                );
                set((state) => {
                    const updatedTelemetry = { ...state.deviceTelemetry };
                    const previous = updatedTelemetry[newDevice.id];
                    delete updatedTelemetry[newDevice.id];
                    updatedTelemetry[data.device.id] = previous || { lastSeen: Date.now(), health: 'healthy' };
                    return {
                        currentHome: { ...currentHome, devices: fixedDevices },
                        deviceTelemetry: updatedTelemetry
                    };
                });
            }
        });
    },

    editDevice: (deviceId, updates) => {
        const { currentHome } = get();
        if (!currentHome) return;

        const updatedDevices = currentHome.devices.map(d =>
            d.id === deviceId ? { ...d, ...updates } : d
        );

        set({
            currentHome: {
                ...currentHome,
                devices: updatedDevices
            }
        });

        const device = currentHome.devices.find(d => d.id === deviceId);
        get().addAuditLog(
            createAuditEntry(
                'device',
                `Updated ${device?.name || 'device'}`,
                { actorRole: get().currentUserRole, deviceId, deviceName: device?.name }
            )
        );

        fetch(`${API_URL}/devices/${deviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updates, homeCode: currentHome.homeCode })
        });
    },

    removeDevice: (deviceId) => {
        const { currentHome } = get();
        if (!currentHome) return;

        const device = currentHome.devices.find(d => d.id === deviceId);

        const updatedDevices = currentHome.devices.filter(d => d.id !== deviceId);

        set((state) => {
            const updatedTelemetry = { ...state.deviceTelemetry };
            delete updatedTelemetry[deviceId];
            return {
                currentHome: {
                    ...currentHome,
                    devices: updatedDevices
                },
                deviceTelemetry: updatedTelemetry
            };
        });

        get().addAuditLog(
            createAuditEntry(
                'device',
                `Removed ${device?.name || 'device'}`,
                { actorRole: get().currentUserRole, deviceId, deviceName: device?.name }
            )
        );

        fetch(`${API_URL}/devices/${deviceId}?homeCode=${currentHome.homeCode}`, {
            method: 'DELETE'
        });
    },

    generatePairingCode: async () => {
        const { currentHome } = get();
        if (!currentHome) return null;
        try {
            const res = await fetch(`${API_URL}/homes/${currentHome.homeCode}/pairing`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                return data.pairingCode;
            }
            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
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

        get().addAuditLog(
            createAuditEntry(
                'admin',
                `Updated rules for ${modeId} mode`,
                { actorRole: get().currentUserRole, modeId }
            )
        );
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
