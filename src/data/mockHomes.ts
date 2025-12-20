import type { HomeProfile, PrivacyMode } from '../types';


/**
 * Mock privacy modes available in the system
 */
export const PRIVACY_MODES: PrivacyMode[] = [
    {
        id: 'security',
        name: 'Security Mode',
        description: 'All sensors active for maximum home security',
        icon: 'Shield',
        color: 'security',
        rules: {},
    },
    {
        id: 'social',
        name: 'Social / Guest Mode',
        description: 'Cameras disabled, speakers active for music and conversation',
        icon: 'Users',
        color: 'social',
        rules: {
            disableCameras: true,
            affectedRooms: ['Living Room', 'Kitchen', 'Dining Room'],
        },
    },
    {
        id: 'private',
        name: 'Private / Prayer Mode',
        description: 'All sensors disabled in specific room for complete privacy',
        icon: 'Moon',
        color: 'private',
        rules: {
            disableCameras: true,
            disableSpeakers: true,
            disableSensors: true,
            affectedRooms: ['Living Room'],
        },
    },
];

/**
 * Mock home profiles accessible via home codes
 */
export const MOCK_HOMES: Record<string, HomeProfile> = {
    '1234': {
        homeCode: '1234',
        homeName: 'The Smith Residence',
        ownerName: 'John Smith',
        activeMode: 'security',
        availableModes: PRIVACY_MODES,
        devices: [
            {
                id: 1,
                name: 'Living Room Camera',
                type: 'camera',
                status: 'active',
                room: 'Living Room',
            },
            {
                id: 2,
                name: 'Alexa Echo',
                type: 'speaker',
                status: 'active',
                room: 'Living Room',
            },
            {
                id: 3,
                name: 'Front Door Lock',
                type: 'lock',
                status: 'active',
                room: 'Entrance',
            },
            {
                id: 4,
                name: 'Kitchen Camera',
                type: 'camera',
                status: 'active',
                room: 'Kitchen',
            },
            {
                id: 5,
                name: 'Motion Sensor',
                type: 'sensor',
                status: 'active',
                room: 'Living Room',
            },
            {
                id: 6,
                name: 'Smart Lights',
                type: 'light',
                status: 'active',
                room: 'Living Room',
            },
        ],
    },
    '5678': {
        homeCode: '5678',
        homeName: 'Modern Loft',
        ownerName: 'Sarah Johnson',
        activeMode: 'security',
        availableModes: PRIVACY_MODES,
        devices: [
            {
                id: 1,
                name: 'Main Camera',
                type: 'camera',
                status: 'active',
                room: 'Living Room',
            },
            {
                id: 2,
                name: 'Google Home',
                type: 'speaker',
                status: 'active',
                room: 'Living Room',
            },
        ],
    },
};
