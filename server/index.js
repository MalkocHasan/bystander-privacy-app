const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3001;

// Enable CORS so the React app (localhost:4000) can talk to this server
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clientHomes = new Map();

const broadcastHomeUpdate = (homeCode) => {
    const home = db[homeCode];
    if (!home) return;

    const payload = JSON.stringify({ type: 'home:update', payload: home });
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && clientHomes.get(client) === homeCode) {
            client.send(payload);
        }
    });
};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'subscribe' && data.homeCode) {
                clientHomes.set(ws, data.homeCode);
                broadcastHomeUpdate(data.homeCode);
            }
        } catch (error) {
            console.warn('[WS] Invalid message', error);
        }
    });

    ws.on('close', () => {
        clientHomes.delete(ws);
    });
});

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
        auditLogs: [],
        scenes: [
            { id: 'scene-movie', name: 'Movie Night' },
            { id: 'scene-quiet', name: 'Quiet Hours' },
            { id: 'scene-away', name: 'Away Mode' },
        ],
        devices: [
            { id: 1, name: 'Living Room Cam', type: 'camera', status: 'active', room: 'Living Room', sceneIds: ['scene-movie', 'scene-away'] },
            { id: 2, name: 'Alexa Echo', type: 'speaker', status: 'active', room: 'Living Room', sceneIds: ['scene-movie', 'scene-quiet'] },
            { id: 5, name: 'Motion Detector', type: 'sensor', status: 'active', room: 'Living Room', sceneIds: ['scene-away'] },
            { id: 4, name: 'Kitchen Nest Hub', type: 'camera', status: 'active', room: 'Kitchen', sceneIds: ['scene-away'] },
            { id: 7, name: 'Smart Fridge Cam', type: 'camera', status: 'active', room: 'Kitchen', sceneIds: ['scene-away'] },
            { id: 3, name: 'Front Door Lock', type: 'lock', status: 'active', room: 'Entrance', sceneIds: ['scene-away'] },
            { id: 8, name: 'Video Doorbell', type: 'camera', status: 'active', room: 'Entrance', sceneIds: ['scene-away'] },
            { id: 9, name: 'Baby Monitor', type: 'camera', status: 'active', room: 'Bedroom', sceneIds: ['scene-quiet'] },
            { id: 10, name: 'Bedroom Speaker', type: 'speaker', status: 'active', room: 'Bedroom', sceneIds: ['scene-quiet'] },
            { id: 11, name: 'Office Webcam', type: 'camera', status: 'active', room: 'Office', sceneIds: ['scene-away'] },
            { id: 12, name: 'Work Assistant', type: 'speaker', status: 'active', room: 'Office', sceneIds: ['scene-quiet'] },
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
            { id: 101, name: 'Main Camera', type: 'camera', status: 'active', room: 'Living Room', sceneIds: ['scene-party', 'scene-away'] },
            { id: 102, name: 'Google Home', type: 'speaker', status: 'active', room: 'Living Room', sceneIds: ['scene-party'] },
            { id: 103, name: 'Smart Lock', type: 'lock', status: 'active', room: 'Entrance', sceneIds: ['scene-away'] },
            { id: 104, name: 'Bedroom Cam', type: 'camera', status: 'active', room: 'Bedroom', sceneIds: ['scene-away'] }
        ],
        scenes: [
            { id: 'scene-party', name: 'Party' },
            { id: 'scene-away', name: 'Away Mode' }
        ],
        auditLogs: [],
        requests: []
    }
};

const MAX_AUDIT_LOGS = 100;

const addAuditLog = (home, entry) => {
    if (!home.auditLogs) home.auditLogs = [];
    const normalized = {
        id: entry.id || Math.random().toString(36).substr(2, 9),
        type: entry.type || 'device',
        message: entry.message || 'Activity recorded',
        timestamp: entry.timestamp || Date.now(),
        actorRole: entry.actorRole,
        deviceId: entry.deviceId,
        deviceName: entry.deviceName,
        modeId: entry.modeId
    };
    home.auditLogs.unshift(normalized);
    home.auditLogs = home.auditLogs.slice(0, MAX_AUDIT_LOGS);
    return normalized;
};

const normalizeSceneIds = (sceneIds) => {
    if (!sceneIds) return [];
    if (Array.isArray(sceneIds)) return sceneIds.filter(Boolean);
    if (typeof sceneIds === 'string') {
        return sceneIds.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
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

app.get('/api/homes/:code/audit-logs', (req, res) => {
    const home = db[req.params.code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    res.json({ logs: home.auditLogs || [] });
});

app.post('/api/homes/:code/audit-logs', (req, res) => {
    const home = db[req.params.code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const entry = addAuditLog(home, req.body || {});
    broadcastHomeUpdate(req.params.code);
    res.json({ success: true, entry });
});

app.post('/api/homes/:code/mode', (req, res) => {
    const { code } = req.params;
    const { mode } = req.body;

    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    console.log(`[HUB] Applying Mode: ${mode} to Home ${code}`);
    home.activeMode = mode;

    // Apply Rules to Devices
    const modeConfig = home.availableModes.find(m => m.id === mode);
    if (modeConfig && modeConfig.rules) {
        const rules = modeConfig.rules;
        let updateCount = 0;

        home.devices.forEach(device => {
            // Check if device is in affected room
            const isAffectedRoom = !rules.affectedRooms || rules.affectedRooms.includes(device.room);

            if (isAffectedRoom) {
                let newStatus = device.status;

                if (device.type === 'camera') {
                    if (rules.cameraStatus) newStatus = rules.cameraStatus;
                    else if (rules.disableCameras) newStatus = 'masked';
                } else if (device.type === 'speaker') {
                    if (rules.speakerStatus) newStatus = rules.speakerStatus;
                } else if (device.type === 'sensor') {
                    if (rules.sensorStatus) newStatus = rules.sensorStatus;
                }

                // Apply update if changed
                if (newStatus && newStatus !== device.status) {
                    device.status = newStatus;
                    updateCount++;
                }
            }
            // Optional: If switching back to Security (Active), might want to restore? 
            // The current logic works if the 'active' mode has rules that say 'active'.
            // In Mock Data, Security Mode rules often default to active.
        });
        console.log(`[HUB] Auto-updated ${updateCount} devices based on ${mode} rules.`);
    }

    res.json({ success: true, activeMode: home.activeMode });
    broadcastHomeUpdate(code);
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
        broadcastHomeUpdate(homeCode || '1234');
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
    broadcastHomeUpdate(homeCode);
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
    broadcastHomeUpdate(homeCode);
});

// --- Device CRUD Endpoints ---

// 6. Create Device
app.post('/api/homes/:code/devices', (req, res) => {
    const { code } = req.params;
    const { name, type, room, sceneIds } = req.body;

    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const newDevice = {
        id: Math.floor(Math.random() * 100000), // Simple ID generation
        name,
        type,
        room,
        status: 'active', // Default status
        sceneIds: normalizeSceneIds(sceneIds)
    };

    home.devices.push(newDevice);
    console.log(`[CRUD] Created Device: ${name} in ${room}`);
    res.json({ success: true, device: newDevice });
    broadcastHomeUpdate(code);
});

// 7. Update Device
app.put('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, room, homeCode, sceneIds } = req.body; // sending homeCode context helps simple DB search

    const home = db[homeCode];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const device = home.devices.find(d => d.id == id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Update fields
    if (name) device.name = name;
    if (type) device.type = type;
    if (room) device.room = room;
    if (sceneIds !== undefined) device.sceneIds = normalizeSceneIds(sceneIds);

    console.log(`[CRUD] Updated Device ${id}: ${device.name}`);
    res.json({ success: true, device });
    broadcastHomeUpdate(homeCode);
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
        broadcastHomeUpdate(homeCode || '1234');
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 BYSTANDER HUB SERVER RUNNING ON PORT ${PORT}`);
    console.log(`   - Local Address: http://localhost:${PORT}`);
    console.log(`   - Network Simulation: ON (Latency: 200-500ms)\n`);
});
