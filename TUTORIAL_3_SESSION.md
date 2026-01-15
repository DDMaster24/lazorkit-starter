# Tutorial: Session Persistence Across Devices 🔄

Learn how LazorKit automatically manages session persistence, allowing users to stay logged in across visits and even sync their wallets across devices.

## Table of Contents
- [Overview](#overview)
- [How Session Persistence Works](#how-session-persistence-works)
- [Auto-Reconnect Feature](#auto-reconnect-feature)
- [Cross-Device Sync](#cross-device-sync)
- [Implementing Session Management](#implementing-session-management)
- [Best Practices](#best-practices)
- [Security Considerations](#security-considerations)

---

## Overview

Traditional crypto wallets lose session state when users:
- Close their browser tab
- Restart their device
- Switch to a different device

LazorKit solves this with **automatic session persistence**:

```
Session Persistence Flow:
═══════════════════════════════════════════════════════════════

First Visit:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ User    │───▶│ Passkey │───▶│ Session │
│ Arrives │    │ Login   │    │ Created │
└─────────┘    └─────────┘    └─────────┘

Return Visit:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ User    │───▶│ Session │───▶│ Already │
│ Returns │    │ Detected│    │ Logged! │
└─────────┘    └─────────┘    └─────────┘

═══════════════════════════════════════════════════════════════
```

---

## How Session Persistence Works

When a user authenticates with LazorKit:

1. **Authentication**: User completes passkey login
2. **Session Creation**: SDK creates a session reference
3. **Local Storage**: Session metadata is stored securely in browser
4. **Auto-Reconnect**: On return visits, session is automatically restored

```typescript
// This is handled automatically by LazorkitProvider!
// You don't need to write this code - it's for illustration

interface SessionData {
    smartWallet: string;      // The user's wallet address
    credential: string;       // Reference to the passkey credential
    expiresAt: number;        // Session expiration timestamp
    lastActive: number;       // Last activity timestamp
}
```

**Storage Locations:**
- **Session metadata**: `localStorage` (wallet address, timestamps)
- **Passkey credential**: Device Secure Enclave (never exposed to JavaScript)
- **Private keys**: Device hardware (never leaves the device)

---

## Auto-Reconnect Feature

LazorKit's auto-reconnect is **built into the provider**. Here's what happens:

```tsx
// src/app/layout.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

export default function RootLayout({ children }) {
    return (
        <LazorkitProvider
            rpcUrl="https://api.devnet.solana.com"
            portalUrl="https://portal.lazor.sh"
            // Auto-reconnect is enabled by default!
        >
            {children}
        </LazorkitProvider>
    );
}
```

### Detecting Auto-Reconnect in Your Components

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { useEffect, useState } from 'react';

export function AppShell() {
    const { isConnected, isConnecting, wallet } = useWallet();
    const [isReconnecting, setIsReconnecting] = useState(true);

    useEffect(() => {
        // Give the SDK a moment to check for existing session
        const timer = setTimeout(() => {
            setIsReconnecting(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Show loading while checking for existing session
    if (isReconnecting || isConnecting) {
        return (
            <div className="loading-screen">
                <span>Checking session...</span>
            </div>
        );
    }

    // User has active session
    if (isConnected) {
        return <Dashboard wallet={wallet} />;
    }

    // No session - show login
    return <PasskeyLogin />;
}
```

---

## Cross-Device Sync

One of the most powerful features of passkeys is **cross-device synchronization**:

### How It Works

| Platform | Sync Method | Supported |
|----------|-------------|-----------|
| Apple (iOS/macOS) | iCloud Keychain | ✅ Yes |
| Android | Google Password Manager | ✅ Yes |
| Windows | Microsoft Account | ✅ Yes |
| Chrome | Google Account | ✅ Yes |

```
Cross-Device Sync:
═══════════════════════════════════════════════════════════════

        ┌────────────────────────────────────────┐
        │         Cloud Keychain                 │
        │     (iCloud/Google/Microsoft)          │
        └─────────────────┬──────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
      ┌─────────┐   ┌─────────┐   ┌─────────┐
      │ iPhone  │   │ MacBook │   │  iPad   │
      │ FaceID  │   │ TouchID │   │ FaceID  │
      └─────────┘   └─────────┘   └─────────┘

Same passkey = Same wallet on all devices!

═══════════════════════════════════════════════════════════════
```

### User Experience

**Scenario: User logs in on iPhone, opens app on MacBook**

1. User visits your app on MacBook
2. LazorKit detects no local session
3. Shows "Login with Passkey" button
4. User clicks → MacBook prompts TouchID
5. iCloud provides the synced passkey
6. User is logged in with **same wallet address**!

```tsx
// No special code needed! Just use the normal flow:
const { connect } = useWallet();

// This will use the synced passkey if available
await connect();
```

---

## Implementing Session Management

### Checking Session on App Load

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { useEffect } from 'react';

export function SessionManager({ children }) {
    const { isConnected, wallet } = useWallet();

    useEffect(() => {
        if (isConnected && wallet) {
            // User has an active session
            console.log('Session restored for:', wallet.smartWallet);
            
            // Optional: Track session restoration analytics
            analytics.track('session_restored', {
                wallet: wallet.smartWallet,
            });
        }
    }, [isConnected, wallet]);

    return children;
}
```

### Handling Session Expiration

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { useEffect } from 'react';

export function SessionExpirationHandler() {
    const { isConnected, disconnect } = useWallet();

    useEffect(() => {
        // Check session validity periodically
        const interval = setInterval(() => {
            // If you have session expiration logic
            if (isSessionExpired()) {
                disconnect();
                toast.info('Session expired. Please log in again.');
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [disconnect]);

    return null;
}

function isSessionExpired(): boolean {
    // Implement your session expiration logic
    // LazorKit sessions don't expire by default
    return false;
}
```

### Manual Session Clearing

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';

export function LogoutButton() {
    const { disconnect, isConnected } = useWallet();

    const handleLogout = async () => {
        // This clears the local session
        disconnect();
        
        // Optionally redirect to home
        window.location.href = '/';
    };

    if (!isConnected) return null;

    return (
        <button onClick={handleLogout}>
            Sign Out
        </button>
    );
}
```

---

## Best Practices

### 1. Show Loading States During Reconnect

```tsx
export function App() {
    const { isConnected } = useWallet();
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Wait for SDK to check existing sessions
        const timer = setTimeout(() => setIsInitializing(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isInitializing) {
        return <SplashScreen />;
    }

    return isConnected ? <Dashboard /> : <LoginPage />;
}
```

### 2. Handle Hydration Mismatches (Next.js)

```tsx
export function AppShell() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return <LoadingSpinner />;
    }

    return <MainContent />;
}
```

### 3. Persist UI State Alongside Session

```tsx
import { useWallet } from '@lazorkit/wallet';
import { useEffect } from 'react';

export function Dashboard() {
    const { wallet } = useWallet();

    useEffect(() => {
        if (wallet?.smartWallet) {
            // Save user preferences keyed by wallet
            const savedTheme = localStorage.getItem(
                `theme_${wallet.smartWallet}`
            );
            if (savedTheme) {
                applyTheme(savedTheme);
            }
        }
    }, [wallet]);

    // ...
}
```

---

## Security Considerations

### What's Stored Locally

| Data | Storage | Sensitivity |
|------|---------|-------------|
| Wallet address | localStorage | Public (safe) |
| Session ID | localStorage | Low (useless without passkey) |
| Passkey credential | Secure Enclave | Protected by hardware |
| Private key | Secure Enclave | Never exposed |

### What's NOT Stored

- ❌ Private keys (always in Secure Enclave)
- ❌ Seed phrases (don't exist with passkeys)
- ❌ Passwords (biometric only)
- ❌ Session tokens that can be stolen

### Clearing Data on Logout

```tsx
const handleSecureLogout = () => {
    // LazorKit's disconnect clears session
    disconnect();
    
    // Optional: Clear any app-specific cached data
    localStorage.removeItem('user-preferences');
    sessionStorage.clear();
};
```

### Handling Stolen Device Scenario

Even if someone steals the device:
1. They cannot use the passkey without biometric authentication
2. User can revoke access via iCloud/Google account
3. No seed phrase means no funds at risk from backups

---

## Common Patterns

### Pattern 1: Remember Last Visited Page

```tsx
export function SessionAwareRouter() {
    const { isConnected, wallet } = useWallet();

    useEffect(() => {
        if (isConnected && wallet) {
            const lastPath = localStorage.getItem(
                `lastPath_${wallet.smartWallet}`
            );
            if (lastPath && lastPath !== window.location.pathname) {
                router.push(lastPath);
            }
        }
    }, [isConnected, wallet]);

    // Save current path on navigation
    useEffect(() => {
        if (wallet) {
            localStorage.setItem(
                `lastPath_${wallet.smartWallet}`,
                window.location.pathname
            );
        }
    }, [window.location.pathname, wallet]);
}
```

### Pattern 2: Session Activity Tracker

```tsx
export function ActivityTracker() {
    const { wallet, isConnected } = useWallet();

    useEffect(() => {
        if (!isConnected) return;

        const updateActivity = () => {
            localStorage.setItem(
                `lastActive_${wallet?.smartWallet}`,
                Date.now().toString()
            );
        };

        // Track user activity
        window.addEventListener('click', updateActivity);
        window.addEventListener('keypress', updateActivity);

        return () => {
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('keypress', updateActivity);
        };
    }, [isConnected, wallet]);

    return null;
}
```

---

## Summary

LazorKit's session persistence provides:

| Feature | Benefit |
|---------|---------|
| Auto-reconnect | Users don't re-login every visit |
| Cross-device sync | Same wallet on all devices |
| Secure storage | Private keys never leave hardware |
| Zero configuration | Works out of the box |

The best part? **You get all of this for free** just by using the `LazorkitProvider`!

---

## Next Steps

- [Tutorial 1: Passkey Authentication](./TUTORIAL_1_PASSKEYS.md) - Set up biometric login
- [Tutorial 2: Gasless Transactions](./TUTORIAL_2_GASLESS.md) - Sponsor user fees

---

*Need help? Join the [LazorKit Telegram](https://t.me/lazorkit) community!*
