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
        rules: {
            // Security implies everything is ON and potentially recording
            cameraStatus: 'active',
            sensorStatus: 'active',
            affectedRooms: ['Living Room', 'Kitchen', 'Entrance', 'Office', 'Bedroom']
        },
    },
    {
        id: 'social',
        name: 'Social / Guest Mode',
        description: 'Cameras masked, speakers active for music.',
        icon: 'Users',
        color: 'social',
        rules: {
            disableCameras: true, // Legacy flag
            cameraStatus: 'masked', // Mask cameras (don't disable fully)
            speakerStatus: 'active', // Enable smart speakers
            affectedRooms: ['Living Room', 'Kitchen', 'Entrance', 'Dining Room'],
        },
    },
    {
        id: 'private',
        name: 'Private / Prayer Mode',
        description: 'Maximum privacy. All recording devices off.',
        icon: 'Moon',
        color: 'private',
        rules: {
            cameraStatus: 'disabled', // Fully OFF
            speakerStatus: 'disabled', // Mute/Off
            sensorStatus: 'disabled',  // No tracking
            affectedRooms: ['Living Room', 'Bedroom', 'Office', 'Kitchen'],
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
        scenes: [
            { id: 'scene-movie', name: 'Movie Night' },
            { id: 'scene-quiet', name: 'Quiet Hours' },
            { id: 'scene-away', name: 'Away Mode' },
        ],
        devices: [
            // Living Room
            { id: 1, name: 'Living Room Cam', type: 'camera', status: 'active', room: 'Living Room', sceneIds: ['scene-movie', 'scene-away'] },
            { id: 2, name: 'Alexa Echo', type: 'speaker', status: 'active', room: 'Living Room', sceneIds: ['scene-movie', 'scene-quiet'] },
            { id: 5, name: 'Motion Detector', type: 'sensor', status: 'active', room: 'Living Room', sceneIds: ['scene-away'] },

            // Kitchen
            { id: 4, name: 'Kitchen Nest Hub', type: 'camera', status: 'active', room: 'Kitchen', sceneIds: ['scene-away'] },
            { id: 7, name: 'Smart Fridge Cam', type: 'camera', status: 'active', room: 'Kitchen', sceneIds: ['scene-away'] },

            // Entrance
            { id: 3, name: 'Front Door Lock', type: 'lock', status: 'active', room: 'Entrance', sceneIds: ['scene-away'] },
            { id: 8, name: 'Video Doorbell', type: 'camera', status: 'active', room: 'Entrance', sceneIds: ['scene-away'] },

            // Bedroom
            { id: 9, name: 'Baby Monitor', type: 'camera', status: 'active', room: 'Bedroom', sceneIds: ['scene-quiet'] },
            { id: 10, name: 'Bedroom Speaker', type: 'speaker', status: 'active', room: 'Bedroom', sceneIds: ['scene-quiet'] },

            // Office
            { id: 11, name: 'Office Webcam', type: 'camera', status: 'active', room: 'Office', sceneIds: ['scene-away'] },
            { id: 12, name: 'Work Assistant', type: 'speaker', status: 'active', room: 'Office', sceneIds: ['scene-quiet'] },
        ],
    },
    '5678': {
        homeCode: '5678',
        homeName: 'Modern Loft',
        ownerName: 'Sarah Johnson',
        activeMode: 'security',
        availableModes: PRIVACY_MODES,
        scenes: [
            { id: 'scene-party', name: 'Party' },
            { id: 'scene-away', name: 'Away Mode' },
        ],
        devices: [
            {
                id: 1,
                name: 'Main Camera',
                type: 'camera',
                status: 'active',
                room: 'Living Room',
                sceneIds: ['scene-party', 'scene-away'],
            },
            {
                id: 2,
                name: 'Google Home',
                type: 'speaker',
                status: 'active',
                room: 'Living Room',
                sceneIds: ['scene-party'],
            },
        ],
    },
};
