# Bystander Privacy App - User Flow Guide

This document outlines the primary user journeys for both **Hosts** (Homeowners) and **Guests** (Bystanders) within the application.

---

## 1. Onboarding & Authentication
**Goal:** Connect to a specific smart home environment.

1.  **Landing Page:** Users are greeted with a "Connect to Home" screen.
2.  **Home Code Entry:**
    *   User enters a unique 4-digit code (e.g., `1234` or `5678`).
    *   **Backend Check:** The app verifies the code with the local server to fetch the home's configuration.
3.  **Role Assignment:**
    *   By default, all new connections start as **Guests** (read-only/request-only).
    *   **Validation:** "Connected to [Home Name]" toast appears.

---

## 2. Guest Workflow (The Bystander)
**Goal:** Verify privacy and negotiate changes without needing complex admin access.

### A. Viewing Privacy Status
*   **Dashboard:** The Guest sees a simplified dashboard showing the current **Privacy Mode** (e.g., "Social Mode").
*   **Device Transparency:**
    *   **Live:** Red badge (Recording).
    *   **Private:** Grey/icon badge (Masked/Not Recording).
    *   **Off:** Disabled.
*   **Feed Access:** Guests *cannot* see live camera feeds. The play button is hidden.

### B. Negotiating Privacy (Requesting Changes)
1.  **Identify Concern:** Guest sees a "Live" camera in a sensitive room (e.g., Living Room).
2.  **Make Request:**
    *   Click the device.
    *   **Request Modal** appears.
    *   Select preference: **"Comfort Mode"** (Masking) or **"Prayer Mode"** (Disable/Off).
    *   Click **"Send Request"**.
3.  **Feedback:**
    *   The device card shows a **"Pending"** (Yellow Clock) status.
    *   The app polls the server waiting for Host action.
4.  **Resolution:**
    *   Once the Host approves, the device status automatically updates to "Private" or "Off".

### C. Restoring Access
1.  Guest needs to use a device that is currently off (e.g., Smart Speaker is disabled).
2.  Click the disabled device.
3.  **"Restore Access"** prompt appears.
4.  Request is sent to Host to turn it back on.

---

## 3. Host Workflow (The Admin)
**Goal:** Manage home security while respecting guest privacy.

### A. Accessing Admin Tools
1.  Click the "View: Guest" toggle at the bottom right.
2.  **Security Challenge:** Enter the admin password (`admin`).
3.  **Host Dashboard:** The UI unlocks additional controls:
    *   **Mode Selector Pucks** (Security / Social / Private).
    *   **Admin Notification Inbox** (Top of screen).
    *   **Device Controls** (Add/Edit buttons).

### B. Managing Privacy Modes
*   **One-Tap Switching:** Host Taps "Social Mode".
*   **Automated Rules:** The Server automatically updates all devices based on the mode's rules (e.g., Turning off all indoor cameras).
*   **Configuration:** Host can click "Edit Rules" on a mode to define what usually happens (e.g., "Does Social Mode disable the mic?").

### C. Handling Negotiations
1.  **Notification:** Host sees "Action Required" alert at the top of the dashboard.
    *   *"Guest is requesting Privacy for Living Room Cam".*
2.  **Decision:**
    *   **Approve:** Grants the request. The Server updates the device status immediately.
    *   **Deny:** Rejects the request. The Guest's pending status is cleared.

### D. Device Management (CRUD)
*   **Live Feed:** Host can click the "Play" button on cameras to view a simulated live stream (verifying security).
*   **Create:** Host can add new devices (e.g., "Kitchen Light") via the "+" button.
*   **Edit/Delete:** Host can rename or remove devices using the Pencil/Trash icons.

---

## 4. Technical Simulation Flow
1.  **Action:** User clicks "Light On".
2.  **Frontend:** Optimistically updates the UI to "On".
3.  **Network:** Sends `POST` request to local server (`localhost:3001`).
4.  **Server:**
    *   Validates request.
    *   Waits random latency (200-500ms).
    *   Updates in-memory database.
5.  **Synchronization:**
    *   Other clients (Guest's phone) poll the server every 3 seconds.
    *   They receive the new state and update their UI automatically.
