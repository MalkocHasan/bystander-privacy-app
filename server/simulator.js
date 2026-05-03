const mqtt = require('mqtt');
const readline = require('readline');

const API_URL = 'http://localhost:3001/api';
const MQTT_URL = 'mqtt://localhost:1883';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function start() {
    console.log("=== Bystander Device Simulator ===");
    console.log("1. Wait for Host to generate a Pairing Code in the app.");
    
    const pairingCode = await prompt("Enter Pairing Code: ");
    const name = await prompt("Enter Device Name (e.g., 'Smart Cam'): ");
    const type = await prompt("Enter Device Type (camera/speaker/sensor/lock): ");
    const room = await prompt("Enter Room (e.g., 'Living Room'): ");

    console.log("\nAttempting to pair...");

    try {
        const response = await fetch(`${API_URL}/pairing/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pairingCode, name, type: type || 'sensor', room: room || 'Unassigned' })
        });

        const data = await response.json();

        if (!data.success) {
            console.error("Pairing failed:", data.error);
            rl.close();
            return;
        }

        console.log(`\n✅ Pairing successful!`);
        console.log(`Home Code: ${data.homeCode}`);
        console.log(`Device ID: ${data.deviceId}`);
        
        console.log("\nConnecting to local MQTT broker...");
        
        const client = mqtt.connect(MQTT_URL, {
            clientId: `device_${data.deviceId}`,
            clean: true
        });

        let currentStatus = 'active';

        client.on('connect', () => {
            console.log("✅ Connected to MQTT Broker.");
            
            // Subscribe to status updates from hub
            const statusTopic = `home/${data.homeCode}/device/${data.deviceId}/status`;
            client.subscribe(statusTopic, () => {
                console.log(`Subscribed to ${statusTopic}`);
            });

            // Start sending simulated telemetry (health)
            const telemetryTopic = `home/${data.homeCode}/device/${data.deviceId}/telemetry`;
            setInterval(() => {
                const payload = JSON.stringify({
                    deviceId: data.deviceId,
                    status: currentStatus,
                    health: 'healthy',
                    timestamp: Date.now()
                });
                client.publish(telemetryTopic, payload);
            }, 10000); // Every 10 seconds

            // Start sending simulated sensor data (stream)
            const streamTopic = `home/${data.homeCode}/device/${data.deviceId}/stream`;
            setInterval(() => {
                // Only stream if the device is 'active'
                if (currentStatus === 'active') {
                    // Generate an array of 20 random data points representing a graph
                    const sensorData = Array.from({ length: 20 }, () => Math.floor(20 + Math.random() * 80));
                    client.publish(streamTopic, JSON.stringify({
                        type: 'sensor_data',
                        payload: sensorData
                    }));
                }
            }, 2000); // Publish new data every 2 seconds
        });

        client.on('message', (topic, message) => {
            if (topic.endsWith('/status')) {
                try {
                    const msg = JSON.parse(message.toString());
                    if (msg.command === 'setStatus') {
                        currentStatus = msg.status;
                        console.log(`---> Device status changed to: ${currentStatus}`);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        });

        client.on('error', (err) => {
            console.error('MQTT Error:', err);
        });

    } catch (e) {
        console.error("Error during pairing:", e.message);
        rl.close();
    }
}

start();
