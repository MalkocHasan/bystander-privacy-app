const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const aedes = require('aedes')();
const net = require('net');

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

const broadcastDeviceStream = (homeCode, deviceId, data) => {
    const payload = JSON.stringify({
        type: 'device:stream',
        deviceId,
        data
    });
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

// --- MQTT Broker Setup ---
const mqttServer = net.createServer(aedes.handle);
const MQTT_PORT = 1883;
mqttServer.listen(MQTT_PORT, () => {
    console.log(`[MQTT] Broker running on port ${MQTT_PORT}`);
});

aedes.on('client', (client) => {
    console.log(`[MQTT] Client Connected: ${client ? client.id : client}`);
});

aedes.on('clientDisconnect', (client) => {
    console.log(`[MQTT] Client Disconnected: ${client ? client.id : client}`);
});

aedes.on('publish', (packet, client) => {
    if (client) {
        const topic = packet.topic;
        // e.g., home/1234/device/101/stream
        if (topic.endsWith('/stream')) {
            const parts = topic.split('/');
            const homeCode = parts[1];
            const deviceId = parseInt(parts[3], 10);
            
            try {
                const data = JSON.parse(packet.payload.toString());
                broadcastDeviceStream(homeCode, deviceId, data.payload);
            } catch (e) {
                console.warn('[MQTT] Error parsing stream data', e);
            }
        }
    }
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
        requests: [],
        pairingCodes: {}
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
        requests: [],
        pairingCodes: {},
        isAiAutoHostEnabled: false
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

                    // Publish to MQTT
                    aedes.publish({
                        topic: `home/${code}/device/${device.id}/status`,
                        payload: JSON.stringify({ command: 'setStatus', status: newStatus }),
                        qos: 0,
                        retain: false
                    });
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

// --- AI Auto Host Toggle ---
app.post('/api/homes/:code/ai-host', (req, res) => {
    const { code } = req.params;
    const { enabled } = req.body;
    
    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    home.isAiAutoHostEnabled = !!enabled;
    console.log(`[AI] Auto-Host for home ${code} is now ${home.isAiAutoHostEnabled ? 'ON' : 'OFF'}`);
    
    res.json({ success: true, isAiAutoHostEnabled: home.isAiAutoHostEnabled });
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
        
        // Publish to MQTT
        aedes.publish({
            topic: `home/${homeCode || '1234'}/device/${device.id}/status`,
            payload: JSON.stringify({ command: 'setStatus', status: status }),
            qos: 0,
            retain: false
        });

        res.json({ success: true, device });
        broadcastHomeUpdate(homeCode || '1234');
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

app.post('/api/negotiation/request', async (req, res) => {
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

    // AI AUTO-HOST INTERCEPT
    if (home.isAiAutoHostEnabled) {
        console.log(`[AI] Auto-Host is ON. Evaluating request...`);
        const device = home.devices.find(d => d.id === deviceId);
        
        try {
            // Ask Local Ollama (e.g. llama3)
            // Note: If you have a specific model installed, replace 'llama3' with it. 'llama3' or 'mistral' are common.
            const prompt = `
                You are the AI Auto-Host for a Smart Home. Your absolute highest priority is respecting Guest Privacy.
                A guest just requested to change the ${device.type} named "${device.name}" in the "${device.room}" to "${requestType}" mode.
                The current active home mode is "${home.activeMode}".
                
                Rules for decision making:
                1. You must almost always APPROVE "prayer" and "comfort" requests to respect the guest's personal boundaries, even if the home is in "security" mode.
                2. Only REJECT if the request seems highly dangerous or nonsensical.
                
                Should you approve or reject this privacy request?
                Respond strictly with a raw JSON object in this exact format: {"status": "approved" | "rejected", "reason": "short explanation"}
                Do not wrap the response in markdown blocks or backticks. Return ONLY the JSON object.
            `;

            const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3', // Adjust based on user's installed model
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                })
            });

            if (ollamaRes.ok) {
                const aiData = await ollamaRes.json();
                const decision = JSON.parse(aiData.response);
                
                // Normalize status to lowercase to avoid "APPROVED" !== "approved" bug
                const normalizedStatus = (decision.status || 'rejected').toLowerCase();
                console.log(`[AI] Decision: ${normalizedStatus.toUpperCase()} - ${decision.reason}`);
                
                // Process the decision automatically
                newRequest.status = normalizedStatus;
                
                if (normalizedStatus === 'approved') {
                    let targetStatus = 'masked';
                    if (requestType === 'restore') targetStatus = 'active';
                    else if (requestType === 'prayer') targetStatus = 'disabled';
                    else if (requestType === 'comfort') targetStatus = 'masked';
                    
                    device.status = targetStatus;
                    console.log(`[AUTO-ACTION] Updating Device ${device.name} to ${targetStatus}`);
                    
                    aedes.publish({
                        topic: `home/${homeCode}/device/${device.id}/status`,
                        payload: JSON.stringify({ command: 'setStatus', status: targetStatus }),
                        qos: 0,
                        retain: false
                    });
                }
                
                // Add an audit log to show the AI did this
                addAuditLog(home, {
                    type: 'request',
                    message: `AI Auto-Host ${decision.status} ${requestType} for ${device.name}. Reason: ${decision.reason}`,
                    actorRole: 'ai-host',
                    deviceId,
                    deviceName: device.name
                });
            } else {
                console.warn(`[AI] Failed to reach Ollama at 127.0.0.1:11434. Check if Ollama is running.`);
            }
        } catch (err) {
            console.error(`[AI] Error communicating with local AI model:`, err.message);
        }
    }

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

            // Publish to MQTT
            aedes.publish({
                topic: `home/${homeCode}/device/${device.id}/status`,
                payload: JSON.stringify({ command: 'setStatus', status: targetStatus }),
                qos: 0,
                retain: false
            });
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

// --- Secure Pairing Endpoints ---

// 9. Generate Pairing Code
app.post('/api/homes/:code/pairing', (req, res) => {
    const { code } = req.params;
    const home = db[code];
    if (!home) return res.status(404).json({ error: 'Home not found' });

    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    home.pairingCodes[pairingCode] = {
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };

    console.log(`[PAIRING] Generated code ${pairingCode} for home ${code}`);
    res.json({ success: true, pairingCode, expiresAt: home.pairingCodes[pairingCode].expiresAt });
});

// 10. Claim Device with Code
app.post('/api/pairing/claim', (req, res) => {
    const { pairingCode, name, type, room } = req.body;

    let targetHomeCode = null;
    let targetHome = null;

    // Find the home that has this pairing code
    for (const [hCode, home] of Object.entries(db)) {
        if (home.pairingCodes && home.pairingCodes[pairingCode]) {
            const pCodeData = home.pairingCodes[pairingCode];
            if (Date.now() < pCodeData.expiresAt) {
                targetHomeCode = hCode;
                targetHome = home;
                break;
            } else {
                delete home.pairingCodes[pairingCode]; // Expired
            }
        }
    }

    if (!targetHome) {
        return res.status(400).json({ error: 'Invalid or expired pairing code' });
    }

    // Claim successful, remove the code
    delete targetHome.pairingCodes[pairingCode];

    // Create the device
    const newDevice = {
        id: Math.floor(Math.random() * 100000),
        name: name || 'New Device',
        type: type || 'sensor',
        room: room || 'Unassigned',
        status: 'active',
        sceneIds: []
    };

    targetHome.devices.push(newDevice);
    console.log(`[PAIRING] Device ${newDevice.id} paired to home ${targetHomeCode} successfully!`);
    
    broadcastHomeUpdate(targetHomeCode);
    
    res.json({
        success: true,
        homeCode: targetHomeCode,
        deviceId: newDevice.id,
        device: newDevice
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 BYSTANDER HUB SERVER RUNNING ON PORT ${PORT}`);
    console.log(`   - Local Address: http://localhost:${PORT}`);
    console.log(`   - Network Simulation: ON (Latency: 200-500ms)\n`);
});
