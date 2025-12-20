# Bystander Privacy PWA 🏠

A mobile-first Progressive Web Application for smart home privacy negotiation, implementing findings from "Co-Designing a Mobile App for Bystander Privacy Protection."

## 🎯 Overview

This application allows guests (bystanders) to connect to a smart home and negotiate privacy settings without downloading a native app or accessing the router directly. Users can select from three privacy modes that automatically adjust smart device behaviors.

## ✨ Features

### 1. **Landing & Connection**
- Clean mobile-first landing page
- 4-digit home code authentication (simulates QR scan)
- Smooth animations and transitions

### 2. **Privacy Modes** (Core Feature)
Three large, selectable mode cards with distinct visual identities:

- **🛡️ Security Mode** (Blue)
  - All sensors active for maximum home security
  - Default mode

- **👥 Social / Guest Mode** (Green)
  - Disables interior cameras
  - Keeps smart speakers active for music and conversation
  - Affected rooms: Living Room, Kitchen, Dining Room

- **🌙 Private / Prayer Mode** (Purple)
  - Disables ALL sensors in specific room
  - Complete privacy for meditation/prayer
  - Affected room: Living Room

### 3. **Device Transparency List**
- Grouped by room for easy viewing
- Real-time status indicators (Active/Masked/Disabled)
- Visual icons for device types (cameras, speakers, sensors, etc.)
- Animated pulse indicators for active devices

## 🚀 Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom theme)
- **Icons:** Lucide React
- **State Management:** Zustand
- **Routing:** React Router DOM

## 📁 Project Structure

```
src/
├── features/
│   ├── landing/
│   │   └── Landing.tsx          # Home code entry page
│   ├── negotiation/
│   │   ├── Dashboard.tsx        # Main negotiation interface
│   │   ├── ModeSelector.tsx     # Privacy mode cards
│   │   └── DeviceList.tsx       # Transparent device listing
├── components/
│   └── ui/
│       ├── Card.tsx             # Reusable card component
│       ├── Button.tsx           # Styled button component
│       └── Badge.tsx            # Status badge component
├── store/
│   └── useHomeStore.ts          # Zustand state management
├── types/
│   └── index.ts                 # TypeScript interfaces
├── data/
│   └── mockHomes.ts             # Demo home profiles
├── App.tsx                      # Router configuration
├── main.tsx                     # Application entry
└── index.css                    # Tailwind + global styles
```

## 🏃‍♂️ Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Demo Codes

Try these home codes to access different profiles:

- **1234** - The Smith Residence (6 devices)
- **5678** - Modern Loft (2 devices)

## 🎨 Design Philosophy

### Mobile-First
- Optimized for touch interactions
- Responsive design that scales beautifully
- Smooth animations and micro-interactions

### Visual Excellence
- Custom color palette for each privacy mode
- Gradient backgrounds and glassmorphism effects
- Inter font family for modern typography
- Smooth transitions and hover states

### User Experience
- Clear visual hierarchy
- Instant feedback on interactions
- Accessible color contrasts
- Intuitive iconography

## 🔧 Key TypeScript Interfaces

### HomeProfile
```typescript
interface HomeProfile {
  homeCode: string;
  homeName: string;
  ownerName: string;
  activeMode: PrivacyModeType;
  devices: Device[];
  availableModes: PrivacyMode[];
}
```

### PrivacyMode
```typescript
interface PrivacyMode {
  id: PrivacyModeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  rules: {
    disableCameras?: boolean;
    disableSpeakers?: boolean;
    disableSensors?: boolean;
    affectedRooms?: string[];
  };
}
```

### Device
```typescript
interface Device {
  id: number;
  name: string;
  type: DeviceType; // 'camera' | 'speaker' | 'sensor' | 'lock' | 'light'
  status: DeviceStatus; // 'active' | 'masked' | 'disabled'
  room: string;
}
```

## 🎯 State Management

### Zustand Store (useHomeStore)

The app uses Zustand for lightweight state management:

```typescript
// Connect to a home
connectToHome(homeCode: string): boolean

// Change privacy mode (auto-applies device rules)
setActiveMode(mode: PrivacyModeType): void

// Disconnect from home
disconnect(): void
```

### Smart Rule Engine

When a privacy mode is selected, the store automatically applies rules to devices:
- Checks if device is in affected room
- Applies mode-specific rules (disable/mask)
- Updates device status in real-time

## 🎨 Tailwind Custom Theme

Custom colors for privacy modes:
- `social-*` - Green palette for social mode
- `private-*` - Purple palette for private mode
- `security-*` - Blue palette for security mode

Custom animations:
- `animate-fade-in` - Smooth fade entrance
- `animate-slide-up` - Upward slide animation
- `animate-pulse-soft` - Gentle pulsing effect

## 📱 PWA Features (Future)

Ready for PWA conversion with:
- Mobile-first responsive design
- Optimized touch targets
- Fast load times
- Offline-ready structure

## 🔒 Privacy & Security

- No actual network scanning (simulated with home codes)
- Transparent device listing
- Clear status indicators for all devices
- User control over privacy settings

## 📝 License

This is a proof-of-concept implementation for educational purposes.

## 🙏 Acknowledgments

Based on research from "Co-Designing a Mobile App for Bystander Privacy Protection"

---

**Built with ❤️ for privacy-conscious smart homes**
