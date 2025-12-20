/**
 * Core TypeScript interfaces for the Bystander Privacy App
 */

export type DeviceType = 'camera' | 'speaker' | 'sensor' | 'lock' | 'light';

export type DeviceStatus = 'active' | 'masked' | 'disabled';

export type PrivacyModeType = 'security' | 'social' | 'private';

export interface Device {
    id: number;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    room: string;
}

export interface PrivacyMode {
    id: PrivacyModeType;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color class
    rules: {
        disableCameras?: boolean;
        disableSpeakers?: boolean;
        disableSensors?: boolean;
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
}
