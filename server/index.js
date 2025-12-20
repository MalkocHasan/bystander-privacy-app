const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS so the React app (localhost:4000) can talk to this server
app.use(cors());
app.use(express.json());

// --- Mock Data Definitions ---

const PRIVACY_MODES = [
    {
        id: 'security',
        name: 'Security Mode',
        description: 'All sensors active for maximum home security',
        icon: 'Shield',
        color: 'security',
        rules: {
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
            disableCameras: true,
            cameraStatus: 'masked',
            speakerStatus: 'active',
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
            cameraStatus: 'disabled',
            speakerStatus: 'disabled',
            sensorStatus: 'disabled',
            affectedRooms: ['Living Room', 'Bedroom', 'Office', 'Kitchen'],
        },
    },
];

// --- Mock Database (In-Memory) ---
const db = {
    '1234': {
        homeCode: '1234',
        homeName: 'The Smith Residence',
        ownerName: 'John Smith',
        activeMode: 'security',
        availableModes: PRIVACY_MODES, // <--- CRITICAL FIX
        devices: [
            { id: 1, name: 'Living Room Cam', type: 'camera', status: 'active', room: 'Living Room' },
            { id: 2, name: 'Alexa Echo', type: 'speaker', status: 'active', room: 'Living Room' },
            { id: 5, name: 'Motion Detector', type: 'sensor', status: 'active', room: 'Living Room' },
            { id: 4, name: 'Kitchen Nest Hub', type: 'camera', status: 'active', room: 'Kitchen' },
            { id: 7, name: 'Smart Fridge Cam', type: 'camera', status: 'active', room: 'Kitchen' },
            { id: 3, name: 'Front Door Lock', type: 'lock', status: 'active', room: 'Entrance' },
            { id: 8, name: 'Video Doorbell', type: 'camera', status: 'active', room: 'Entrance' },
            { id: 9, name: 'Baby Monitor', type: 'camera', status: 'active', room: 'Bedroom' },
            { id: 10, name: 'Bedroom Speaker', type: 'speaker', status: 'active', room: 'Bedroom' },
            { id: 11, name: 'Office Webcam', type: 'camera', status: 'active', room: 'Office' },
            { id: 12, name: 'Work Assistant', type: 'speaker', status: 'active', room: 'Office' },
        ],
        requests: []
    },
    '5678': {
        homeCode: '5678',
        homeName: 'Modern Loft',
        ownerName: 'Sarah Johnson',
        activeMode: 'security',
        availableModes: PRIVACY_MODES,
        devices: [
            { id: 101, name: 'Main Camera', type: 'camera', status: 'active', room: 'Living Room' },
            { id: 102, name: 'Google Home', type: 'speaker', status: 'active', room: 'Living Room' },
            { id: 103, name: 'Smart Lock', type: 'lock', status: 'active', room: 'Entrance' },
            { id: 104, name: 'Bedroom Cam', type: 'camera', status: 'active', room: 'Bedroom' }
        ],
        requests: []
    }
};

// --- Middleware ---

app.use((req, res, next) => {
    // Only log important actions (POST), ignore frequent polling (GET)
    if (req.method === 'POST') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        console.log('Payload:', req.body);
    }
    next();
});

app.use((req, res, next) => {
    const delay = Math.floor(Math.random() * 300) + 200;
    setTimeout(next, delay);
});

// --- API Endpoints ---

app.get('/api/homes/:code', (req, res) => {
    const home = db[req.params.code];
    if (home) {
        res.json(home);
    } else {
        res.status(404).json({ error: 'Home not found' });
    }
});

app.post('/api/homes/:code/mode', (req, res) => {
    const { code } = req.params;
    const { mode } = req.body;

    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    console.log(`[HUB] Applying Mode: ${mode} to Home ${code}`);
    home.activeMode = mode;
    res.json({ success: true, activeMode: home.activeMode });
});

app.post('/api/devices/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, homeCode } = req.body;

    const home = db[homeCode || '1234'];
    const device = home.devices.find(d => d.id == id);

    if (device) {
        const oldStatus = device.status;
        device.status = status;
        console.log(`[DEVICE] ID ${id} (${device.name}) changed state: ${oldStatus} -> ${status}`);
        res.json({ success: true, device });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

app.post('/api/negotiation/request', (req, res) => {
    const { homeCode, deviceId, requestType } = req.body;
    const home = db[homeCode];

    if (!home) return res.status(404).json({ error: 'Home not found' });

    const newRequest = {
        id: Math.random().toString(36).substr(2, 9),
        deviceId,
        requestType,
        status: 'pending',
        timestamp: Date.now()
    };

    home.requests.push(newRequest);
    console.log(`[NEGOTIATION] New Request from Guest: ${requestType} on Device ${deviceId}`);

    res.json(newRequest);
});

// 5. Respond to Negotiation Request (Approve/Deny)
app.post('/api/negotiation/respond', (req, res) => {
    const { homeCode, requestId, status } = req.body; // status: 'approved' | 'rejected'

    const home = db[homeCode];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const request = home.requests.find(r => r.id === requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Update Request Status
    request.status = status;
    console.log(`[NEGOTIATION] Request ${requestId} was ${status.toUpperCase()}`);

    // If Approved, Execute the Device Change on Server Side
    if (status === 'approved') {
        const device = home.devices.find(d => d.id === request.deviceId);
        if (device) {
            // Determine target status based on request type
            console.log(`[DEBUG] Processing Request Type: ${request.requestType}`);
            let targetStatus = 'masked';

            if (request.requestType === 'restore') {
                targetStatus = 'active';
            } else if (request.requestType === 'prayer') {
                targetStatus = 'disabled';
            } else if (request.requestType === 'comfort') {
                targetStatus = 'masked';
            } else {
                console.warn(`[WARN] Unknown Request Type: ${request.requestType} - Defaulting to masked`);
            }
            console.log(`[AUTO-ACTION] Updating Device ${device.name} to ${targetStatus}`);
            device.status = targetStatus;
        }
    }



    res.json({ success: true, request });
});

// --- Device CRUD Endpoints ---

// 6. Create Device
app.post('/api/homes/:code/devices', (req, res) => {
    const { code } = req.params;
    const { name, type, room } = req.body;

    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const newDevice = {
        id: Math.floor(Math.random() * 100000), // Simple ID generation
        name,
        type,
        room,
        status: 'active' // Default status
    };

    home.devices.push(newDevice);
    console.log(`[CRUD] Created Device: ${name} in ${room}`);
    res.json({ success: true, device: newDevice });
});

// 7. Update Device
app.put('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, room, homeCode } = req.body; // sending homeCode context helps simple DB search

    const home = db[homeCode];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const device = home.devices.find(d => d.id == id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Update fields
    if (name) device.name = name;
    if (type) device.type = type;
    if (room) device.room = room;

    console.log(`[CRUD] Updated Device ${id}: ${device.name}`);
    res.json({ success: true, device });
});

// 8. Delete Device
app.delete('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    // We need homeCode to find the array, typically passed in check or body, 
    // but for DELETE we often put it in query ?homeCode=1234
    const homeCode = req.query.homeCode;

    const home = db[homeCode || '1234']; // Fallback for demo simplicity
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const initialLength = home.devices.length;
    home.devices = home.devices.filter(d => d.id != id);

    if (home.devices.length < initialLength) {
        console.log(`[CRUD] Deleted Device ${id}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 BYSTANDER HUB SERVER RUNNING ON PORT ${PORT}`);
    console.log(`   - Local Address: http://localhost:${PORT}`);
    console.log(`   - Network Simulation: ON (Latency: 200-500ms)\n`);
});
