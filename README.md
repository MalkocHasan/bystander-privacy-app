# Bystander Privacy PWA 

A mobile-first Progressive Web Application for **smart home privacy negotiation**, implementing findings from "Co-Designing a Mobile App for Bystander Privacy Protection."

This app bridges the gap between **Homeowners (Hosts)** and **Guests (Bystanders)**, allowing them to negotiate privacy settings in real-time without complex configuration or router access.

## Overview

Smart homes often ignore the privacy of guests. This application solves that by providing a **Policy Engine** and **Negotiation Interface**:
1.  **Hosts** define the baseline rules (e.g., "Social Mode" masks the camera).
2.  **Guests** can view active devices and request privacy (e.g., "Request Comfort Mode" for the Living Room).
3.  **Real-Time Negotiation** ensures both parties agree on the device state.

##  Key Features

### 1. **Negotiation Protocol** (The Core Innovation)
- **Role-Based Views**: Separate dashboards for Guests and Hosts.
- **Asynchronous Requests**: Guests can discreetly request:
  - ** Comfort Request**: Masks the camera (recording off, presence on).
  - ** Prayer / Modesty Request**: Completely powers down devices in the room.
- **Host Arbitration**: Hosts receive "Action Required" notifications to **Approve** or **Deny** requests in real-time.

### 2. **Dynamic Privacy Modes**
Three large, selectable mode cards with distinct behaviors:
- ** Security Mode** (Blue/Amber)
  - All sensors active.
  - Live recording enabled.
- ** Social / Guest Mode** (Green/Blue)
  - **Cameras Masked**: Context-aware privacy for gatherings.
  - **Audio Active**: Smart speakers remain on for music.
- ** Private Mode** (Purple/Teal)
  - **Strict Privacy**: Disables all recording devices (Cameras, Mics, Sensors).

### 3. **Admin Power Tools** (Host Only)
- ** Configurable Rules**: Hosts can edit what each mode does (e.g., "Does Social Mode disable the mic?").
- ** Live Feed Simulation**: 
  - View live feeds from cameras and sensors.
  - **Privacy-Aware**: Feeds are automatically blurred or blocked if the current privacy mode dictates it.
- **Admin View Toggle**: Switch between Guest and Host views instantly for testing.

### 4. **Enhanced UI / UX**
- ** Dark Mode**: Fully supported "Dark Soft UI" with a dedicated toggle.
- **Room Filtering**: Tab-based navigation to filter devices by room (Living Room, Office, etc.).
- **Live Visuals**:
  - Animated graphs for sensors.
  - Realistic camera mockups with "REC" indicators.
  - Status badges ("Live", "Masked", "Off").

##  Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4 (Alpha) - Using next-gen CSS engine.
- **State Management:** Zustand (Centralized Policy Engine).
- **Icons:** Lucide React.
- **Routing:** React Router DOM.
- **Architecture:** Feature-first modular structure.

##  Project Structure

```
src/
├── features/
│   ├── negotiation/
│   │   ├── Dashboard.tsx        # Main interface (Host & Guest views)
│   │   ├── ModeSelector.tsx     # Privacy Cards + Config Modal
│   │   ├── DeviceList.tsx       # Device Grid + View Feed Button
│   │   ├── AdminNotification.tsx# Host Request Inbox
│   │   ├── RequestModal.tsx     # Guest Request/Restore UI
│   │   └── LiveFeedModal.tsx    # Admin Camera/Sensor View
├── store/
│   └── useHomeStore.ts          # The "Brain" (Policy Engine + State)
├── data/
│   └── mockHomes.ts             # Default configuration & Mock Data
└── ...
```

##  Getting Started

### Installation & Simulation Setup

This project includes a **Local Simulation Server** to verify network traffic and real-time state synchronization between Host and Guest.

#### 1. Start the Simulation Hub (Backend)
This Node.js server mimics the smart home hub, handling latency (200-500ms) and state persistence.

```bash
cd server
npm install
npm start
```

#### 2. Run the Client (Frontend)
Open a new terminal window:

```bash
# Install frontend dependencies (if first time)
npm install

# Run development server
npm run dev
```

### 🧪 Live Demo Scenarios

#### Scenario A: Real-Time Sync (Host vs Guest)
1. Open **Browser Tab A** (Host View) -> Log in with code `1234`.
2. Open **Browser Tab B** (Guest View) -> Log in with code `1234` (Use Incognito/Private window).
3. In Tab A (Host), toggle a camera or change the Privacy Mode.
4. Watch **Tab B (Guest) automatically update** the device status after a few seconds.

#### Scenario B: Network Traffic Analysis
1. Open Chrome DevTools (`F12`) -> **Network** tab.
2. Toggle a device status in the app.
3. Observe the real `POST` request sent to `http://localhost:3001` with the simulated latency. This proves the app sends actual commands over the network!

### Authentication (Simulated)

Use these codes to log in:
- **1234** - The Smith Residence (Extensive setup: Cameras, Locks, Sensors)
- **5678** - Modern Loft (Simple setup)

##  Design Philosophy: "Soft Privacy"

- **Calm Computing**: The UI uses soft shadows, rounded corners, and pastel colors to reduce the anxiety of surveillance.
- **Physical Assurance**: Toggle actions and status changes provide immediate visual feedback, mimicking physical switches.
- **Transparency**: Every device shows exactly what it is doing (Recording vs. Masked), building trust with the user.

##  Privacy Logic

The system distinguishes between three states:
1.  **Active**: Fully operational, recording.
2.  **Masked**: Device is On, but recording/streaming is blocked (Privacy Preserve).
3.  **Disabled**: Device is completely powered down (Power Cut).

--
