# 🚀 Quick Start Guide

## Getting Started

Your Bystander Privacy PWA is ready! The dev server is already running at:

**http://localhost:5173/**

## 🎮 How to Use

### Step 1: Enter a Home Code
On the landing page, you'll see a clean interface with a home icon.

**Try these demo codes:**
- `1234` - The Smith Residence (6 devices)
- `5678` - Modern Loft (2 devices)

### Step 2: Select a Privacy Mode
Once connected, you'll see 3 privacy mode cards:

1. **🛡️ Security Mode** (Blue)
   - All sensors active
   - Default setting

2. **👥 Social / Guest Mode** (Green)
   - Cameras masked
   - Speakers stay active
   - Perfect for guests

3. **🌙 Private / Prayer Mode** (Purple)
   - All sensors OFF in living room
   - Complete privacy

### Step 3: View Device Status
Scroll down to see all devices grouped by room with real-time status indicators:
- 🟢 **Active** - Device is on
- 🟡 **Masked** - Camera not recording
- 🔴 **Disabled** - Device turned off

## 🛠️ Development Commands

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new dependencies
npm install <package-name>
```

## 📱 Testing on Mobile

To test on your phone:

1. Find your computer's local IP (run `ipconfig` in terminal)
2. Update vite to expose on network:
   ```bash
   npm run dev -- --host
   ```
3. Access from phone: `http://YOUR_IP:5173`

## 🎨 Customization

### Adding New Home Codes
Edit `src/data/mockHomes.ts`:
```typescript
export const MOCK_HOMES: Record<string, HomeProfile> = {
  '9999': {
    homeCode: '9999',
    homeName: 'Your Home Name',
    // ... add your devices
  }
}
```

### Adding New Devices
In `mockHomes.ts`, add to the `devices` array:
```typescript
{
  id: 7,
  name: 'Kitchen Speaker',
  type: 'speaker',
  status: 'active',
  room: 'Kitchen',
}
```

### Customizing Colors
Edit `src/index.css` in the `@theme` block:
```css
@theme {
  --color-social-600: #YOUR_COLOR;
}
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Kill any process on port 5173
npx kill-port 5173

# Restart
npm run dev
```

### Styles not updating
```bash
# Clear cache
rm -rf node_modules/.vite
npm run dev
```

### TypeScript errors
```bash
# Reinstall dependencies
npm install
```

## 📂 Project Structure at a Glance

```
src/
├── features/
│   ├── landing/Landing.tsx        ← Entry page
│   └── negotiation/
│       ├── Dashboard.tsx          ← Main view
│       ├── ModeSelector.tsx       ← Privacy modes
│       └── DeviceList.tsx         ← Device list
├── components/ui/                 ← Reusable components
├── store/useHomeStore.ts          ← State management
└── data/mockHomes.ts              ← Demo data
```

## 🎯 Key Features to Explore

1. **Smooth Animations**
   - Watch the fade-in on landing
   - See slide-up on dashboard cards

2. **Interactive Modes**
   - Click different modes
   - Watch device status change automatically

3. **Mobile-First Design**
   - Resize browser window
   - Try on actual mobile device

4. **Device Transparency**
   - See all devices always visible
   - Active devices have pulsing green dot
   - Icons change based on status

## 📖 Next Steps

1. **Explore the code** - Start with `src/App.tsx`
2. **Try adding features** - Maybe a new privacy mode?
3. **Customize the theme** - Change colors to match your style
4. **Build for production** - `npm run build` when ready

## 💡 Pro Tips

- **Hot Module Replacement**: Save any file to see instant updates
- **React DevTools**: Install browser extension for debugging
- **VS Code**: Use TypeScript hints (hover over variables)
- **Network Tab**: Inspect Tailwind CSS output

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for architecture details
- Examine component files for inline comments

---

**Happy Coding!** 🎉

Your privacy-first smart home app is ready to go!
