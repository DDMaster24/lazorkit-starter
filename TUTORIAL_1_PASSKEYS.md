# Tutorial: Implementing Passkey Login 🔐

Welcome to the LazorKit Passkey Authentication tutorial! By the end of this guide, you'll have a complete understanding of how to replace traditional seed phrase wallets with biometric authentication.

## Table of Contents
- [Overview](#overview)
- [How Passkeys Work](#how-passkeys-work)
- [Step 1: Install Dependencies](#step-1-install-dependencies)
- [Step 2: Setup the Provider](#step-2-setup-the-provider)
- [Step 3: Create the Login Component](#step-3-create-the-login-component)
- [Step 4: Handle Authentication State](#step-4-handle-authentication-state)
- [Common Pitfalls](#common-pitfalls)
- [Why This Matters](#why-this-matters)

---

## Overview

LazorKit uses **WebAuthn Passkeys** to authenticate users. Instead of asking users to:
1. Install a browser extension (Phantom, Solflare)
2. Write down a 12-24 word seed phrase
3. Remember which wallet they used

...users simply authenticate with **FaceID, TouchID, or Windows Hello** — the same way they unlock their phone or laptop.

---

## How Passkeys Work

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Device   │────▶│    WebAuthn     │────▶│  LazorKit SDK   │
│  (FaceID/Touch) │     │   Credential    │     │  Smart Wallet   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │    1. Biometric      │                       │
        │◀──── Prompt ─────────│                       │
        │                       │                       │
        │    2. Sign with      │                       │
        │──── Device Key ──────▶│                       │
        │                       │                       │
        │                       │    3. Derive PDA     │
        │                       │────── Address ───────▶│
        │                       │                       │
        │                       │    4. Return Smart   │
        │◀─────────────────────────── Wallet ─────────│
        │                       │                       │
```

**Key Concepts:**
- **Passkey**: A cryptographic credential stored in your device's Secure Enclave
- **Smart Wallet**: A Solana Program Derived Address (PDA) controlled by your passkey
- **Secp256r1**: The cryptographic curve used by Passkeys (now supported on Solana!)

---

## Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js
```

Or with other package managers:

```bash
# pnpm
pnpm add @lazorkit/wallet @solana/web3.js

# yarn
yarn add @lazorkit/wallet @solana/web3.js
```

---

## Step 2: Setup the Provider

The `LazorkitProvider` must wrap your entire application. It manages:
- Wallet state
- RPC connection
- Paymaster configuration
- Session persistence

```tsx
// src/components/providers/LazorTxProvider.tsx
'use client';

import { LazorkitProvider } from '@lazorkit/wallet';
import { ReactNode } from 'react';

// Polyfill for Buffer in browser environment
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer;
}

export function LazorTxProvider({ children }: { children: ReactNode }) {
    return (
        <LazorkitProvider
            // Solana RPC endpoint
            rpcUrl="https://api.devnet.solana.com"
            // LazorKit portal for passkey management
            portalUrl="https://portal.lazor.sh"
            // Paymaster for gasless transactions
            paymasterConfig={{
                paymasterUrl: 'https://kora.devnet.lazorkit.com'
            }}
        >
            {children}
        </LazorkitProvider>
    );
}
```

Then wrap your app in `layout.tsx`:

```tsx
// src/app/layout.tsx
import { LazorTxProvider } from "@/components/providers/LazorTxProvider";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <LazorTxProvider>
                    {children}
                </LazorTxProvider>
            </body>
        </html>
    );
}
```

---

## Step 3: Create the Login Component

The `useWallet` hook provides everything you need for authentication:

```tsx
// src/components/auth/PasskeyLogin.tsx
'use client';

import { useWallet } from '@lazorkit/wallet';

export function PasskeyLogin() {
    // Destructure auth methods from the hook
    const { connect, isConnecting } = useWallet();

    const handleLogin = async () => {
        try {
            // This triggers the browser's native WebAuthn dialog
            // The user will see a FaceID/TouchID/Windows Hello prompt
            await connect();
            console.log('Successfully authenticated!');
        } catch (error) {
            // User cancelled or passkey error
            console.error('Authentication failed:', error);
        }
    };

    return (
        <button 
            onClick={handleLogin} 
            disabled={isConnecting}
        >
            {isConnecting ? 'Scanning...' : 'Login with Passkey'}
        </button>
    );
}
```

**What happens when `connect()` is called:**
1. Browser shows native biometric prompt
2. User authenticates with FaceID/TouchID/Windows Hello
3. Device signs a challenge using secure enclave
4. LazorKit derives a smart wallet address from the signature
5. User is now "logged in" with their wallet available

---

## Step 4: Handle Authentication State

Check if users are logged in using `isConnected`:

```tsx
// src/components/AppShell.tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { PasskeyLogin } from './PasskeyLogin';
import { Dashboard } from './Dashboard';

export function AppShell() {
    const { isConnected, wallet, disconnect } = useWallet();

    // Not authenticated - show login
    if (!isConnected) {
        return <PasskeyLogin />;
    }

    // Authenticated - show dashboard
    return (
        <div>
            <h1>Welcome!</h1>
            <p>Your wallet: {wallet?.smartWallet}</p>
            <button onClick={() => disconnect()}>
                Disconnect
            </button>
            <Dashboard />
        </div>
    );
}
```

**Available from `useWallet()`:**

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | Whether user is authenticated |
| `isConnecting` | `boolean` | Loading state during auth |
| `wallet` | `object` | Wallet info (smartWallet address, etc.) |
| `smartWalletPubkey` | `PublicKey` | Solana PublicKey of smart wallet |
| `connect()` | `function` | Trigger passkey authentication |
| `disconnect()` | `function` | Clear session and log out |
| `signMessage()` | `function` | Sign arbitrary messages |
| `signAndSendTransaction()` | `function` | Send on-chain transactions |

---

## Common Pitfalls

### ❌ Error: "Buffer is not defined"
**Solution:** Add the Buffer polyfill shown in Step 2.

### ❌ Error: "navigator.credentials is not defined"
**Cause:** WebAuthn is not supported in the current environment.
**Solution:** Ensure you're testing in a supported browser (Chrome, Safari, Edge) over HTTPS or localhost.

### ❌ Passkey prompt doesn't appear
**Cause:** The page might not be a secure context.
**Solution:** Use `localhost` during development or deploy with HTTPS.

### ❌ Error: "User cancelled the operation"
**Cause:** User dismissed the biometric prompt.
**Solution:** This is expected behavior. Handle the error gracefully.

---

## Why This Matters

| Traditional Wallets | LazorKit Passkeys |
|---------------------|-------------------|
| Install extension | No installation needed |
| Save 24-word phrase | Keys in Secure Enclave |
| Risk of phishing | Hardware-bound credentials |
| One device only | Syncs across devices (iCloud/Google) |
| Confusing UX | Native device UX |

**Security Benefits:**
- ✅ **Phishing Resistant**: Passkeys are domain-bound
- ✅ **Hardware Security**: Keys never leave the Secure Enclave
- ✅ **No Seed Phrase**: Nothing to write down or lose
- ✅ **Biometric Only**: Can't be typed or copied

---

## Next Steps

Now that you've implemented passkey login, check out:
- [Tutorial 2: Gasless Transactions](./TUTORIAL_2_GASLESS.md) - Learn to sponsor user fees
- [Tutorial 3: Session Persistence](./TUTORIAL_3_SESSION.md) - Keep users logged in across visits

---

*Need help? Join the [LazorKit Telegram](https://t.me/lazorkit) community!*
