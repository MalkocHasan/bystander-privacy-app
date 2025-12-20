# Git Setup Guide

## ⚠️ Git Not Installed

Git is not currently installed on your system. Here's how to set it up:

## 📥 Option 1: Install Git for Windows (Recommended)

1. **Download Git**
   - Visit: https://git-scm.com/download/win
   - Download the latest version for Windows

2. **Install Git**
   - Run the installer
   - Use default settings (recommended)
   - Important: Check "Git from the command line and also from 3rd-party software"

3. **Verify Installation**
   ```bash
   git --version
   ```

## 📥 Option 2: Install via Package Manager

### Using Chocolatey:
```bash
choco install git
```

### Using Winget:
```bash
winget install --id Git.Git -e --source winget
```

---

## 🚀 After Installing Git

Once Git is installed, run these commands in your project:

### 1. Initialize Repository
```bash
git init
```

### 2. Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Add All Files
```bash
git add .
```

### 4. Create Initial Commit
```bash
git commit -m "Initial commit: Bystander Privacy PWA

- Implemented React + TypeScript + Vite setup
- Added Tailwind CSS v4 with custom theme
- Created 3 privacy modes (Security, Social, Private)
- Built ModeSelector, DeviceList, and Dashboard components
- Implemented Zustand store with smart rule engine
- Added mock data for demo (home codes 1234 and 5678)
- Configured React Router for navigation
- Integrated Lucide React icons
- Created comprehensive documentation"
```

---

## 📂 Your Project is Ready for Git

The `.gitignore` file is already configured to exclude:
- ✓ `node_modules/`
- ✓ `dist/` (build output)
- ✓ Environment files (`.env`)
- ✓ Editor files (`.vscode`, `.idea`)
- ✓ Logs and cache files

---

## 🌐 Optional: Connect to GitHub

### Create a New Repository on GitHub

1. Go to https://github.com/new
2. Name: `bystander-privacy-app`
3. Description: `Mobile-first PWA for smart home privacy negotiation`
4. Keep it Public or Private (your choice)
5. **Don't** initialize with README (we already have one)

### Link Your Local Repo to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/bystander-privacy-app.git
git branch -M main
git push -u origin main
```

---

## 📊 Recommended Git Workflow

### Daily Development
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: add new privacy mode"

# Push to remote
git push
```

### Commit Message Conventions
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 🛠️ Useful Git Commands

```bash
# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-mode

# Switch branches
git checkout main

# Merge branch
git merge feature/new-mode

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

---

## 🎯 Next Steps

1. ✅ `.gitignore` is already configured
2. ⏳ Install Git from git-scm.com
3. ⏳ Initialize repository with `git init`
4. ⏳ Make initial commit
5. ⏳ (Optional) Push to GitHub

Once Git is installed, your project is ready to be version-controlled!
