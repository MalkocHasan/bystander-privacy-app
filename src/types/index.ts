/**
 * Core TypeScript interfaces for the Bystander Privacy App
 */

export type DeviceType = 'camera' | 'speaker' | 'sensor' | 'lock' | 'light';

export type DeviceStatus = 'active' | 'masked' | 'disabled';

export type DeviceHealth = 'healthy' | 'degraded' | 'offline';

export type PrivacyModeType = 'security' | 'social' | 'private';

export interface Scene {
    id: string;
    name: string;
}

export interface Device {
    id: number;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    room: string;
    sceneIds?: string[];
}

export interface PrivacyMode {
    id: PrivacyModeType;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color class
    rules: {
        disableCameras?: boolean; // Deprecated in favor of cameraStatus? Keeping for backward compat or easy toggle.
        disableSpeakers?: boolean;
        disableSensors?: boolean;

        // Granular Status Overrides
        cameraStatus?: DeviceStatus;  // e.g. 'masked' vs 'disabled'
        speakerStatus?: DeviceStatus; // e.g. 'disabled'
        sensorStatus?: DeviceStatus;

        affectedRooms?: string[];
    };
}

export interface HomeProfile {
    homeCode: string;
    homeName: string;
    ownerName: string;
    activeMode: PrivacyModeType;
    devices: Device[];
    availableModes: PrivacyMode[];
    scenes: Scene[];
    auditLogs?: AuditLogEntry[];
}

// User Roles & Negotiation
export type UserRole = 'host' | 'guest';
export type RequestType = 'prayer' | 'comfort' | 'restore';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type AuditLogType = 'connection' | 'mode' | 'request' | 'device' | 'admin';

export interface AccessRequest {
    id: string;
    deviceId: number;
    requestType: RequestType;
    status: RequestStatus;
    timestamp: number;
    deviceName: string;
}

export interface AuditLogEntry {
    id: string;
    type: AuditLogType;
    message: string;
    timestamp: number;
    actorRole?: UserRole;
    deviceId?: number;
    deviceName?: string;
    modeId?: PrivacyModeType;
}
