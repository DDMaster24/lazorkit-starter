# LazorKit Starter Template 🛸

> **Build Passkey-native Solana apps in minutes.** No seed phrases. No browser extensions. Just biometrics.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana)](https://solana.com/)
[![LazorKit](https://img.shields.io/badge/LazorKit-SDK-00D395?style=flat-square)](https://docs.lazorkit.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)

## 🎥 Live Demo

**[➡️ Try the Live Demo](https://lazorkit-starter.vercel.app)** 

*Deployed on Solana Devnet with working Passkey authentication and gasless transactions.*

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Passkey Authentication** | Login with FaceID, TouchID, or Windows Hello |
| ⛽ **Gasless Transactions** | Users transact without holding SOL for fees |
| ✍️ **Message Signing** | Prove wallet ownership without on-chain tx |
| 📜 **Transaction History** | View recent transactions with explorer links |
| 🔄 **Session Persistence** | Stay logged in across visits and devices |
| 🎨 **Premium Dark UI** | Built with Shadcn UI, Tailwind, and Framer Motion |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ PasskeyLogin│  │GaslessTransfer│ │ SignMessage │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    LazorkitProvider                        │  │
│  │  • Wallet State    • RPC Connection    • Session Mgmt     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   WebAuthn  │ │  Paymaster  │ │   Solana    │
    │  (Passkeys) │ │  (Gasless)  │ │   Network   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn
- A browser with WebAuthn support (Chrome, Safari, Edge)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/lazorkit-starter.git
cd lazorkit-starter
npm install
```

### 2. Configure Environment (Optional)

```bash
cp .env.example .env.local
```

> **Note:** This starter works out-of-the-box with LazorKit's public devnet endpoints. No configuration needed for development!

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your passkey!

---

## 📚 Step-by-Step Tutorials

Master LazorKit integration with our comprehensive guides:

| Tutorial | Description | Time |
|----------|-------------|------|
| [**1. Passkey Authentication**](./TUTORIAL_1_PASSKEYS.md) | Replace seed phrases with biometric login | 10 min |
| [**2. Gasless Transactions**](./TUTORIAL_2_GASLESS.md) | Sponsor user fees with the Paymaster | 15 min |
| [**3. Session Persistence**](./TUTORIAL_3_SESSION.md) | Keep users logged in across visits & devices | 10 min |

---

## 🛠️ Project Structure

```
lazorkit-starter/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Entry point
│   │   └── globals.css         # Global styles
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── PasskeyLogin.tsx    # Biometric login card
│   │   │
│   │   ├── dashboard/
│   │   │   ├── WalletOverview.tsx  # Balance & address display
│   │   │   └── TransactionHistory.tsx # Recent transactions
│   │   │
│   │   ├── actions/
│   │   │   ├── GaslessTransfer.tsx # Paymaster transaction demo
│   │   │   └── SignMessage.tsx     # Message signing demo
│   │   │
│   │   ├── providers/
│   │   │   ├── LazorTxProvider.tsx # LazorKit SDK configuration
│   │   │   └── ThemeProvider.tsx   # Dark mode support
│   │   │
│   │   └── ui/                     # Reusable Shadcn components
│   │
│   └── lib/
│       └── config.ts           # RPC & Paymaster configuration
│
├── TUTORIAL_1_PASSKEYS.md      # Passkey auth tutorial
├── TUTORIAL_2_GASLESS.md       # Gasless transactions tutorial
├── TUTORIAL_3_SESSION.md       # Session persistence tutorial
├── .env.example                # Environment variables template
└── package.json
```

---

## 🔧 SDK Integration Reference

### useWallet Hook

```tsx
import { useWallet } from '@lazorkit/wallet';

function MyComponent() {
    const {
        // State
        isConnected,        // boolean - Is user authenticated?
        isConnecting,       // boolean - Is auth in progress?
        wallet,             // object  - Wallet info
        smartWalletPubkey,  // PublicKey - Solana address
        
        // Methods
        connect,            // () => Promise<void> - Trigger passkey login
        disconnect,         // () => void - Clear session
        signMessage,        // (msg) => Promise<string> - Sign arbitrary data
        signAndSendTransaction, // (opts) => Promise<string> - Send tx
    } = useWallet();
}
```

### Example: Complete Transaction Flow

```tsx
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

async function sendSol(recipient: string, amount: number) {
    const { signAndSendTransaction, smartWalletPubkey } = useWallet();
    
    // 1. Create instruction
    const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL
    });
    
    // 2. Send with gasless option
    const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: { feeToken: 'USDC' }
    });
    
    return signature;
}
```

---

## 🐛 Troubleshooting

<details>
<summary><b>Error: "Buffer is not defined"</b></summary>

Add the Buffer polyfill in your provider:

```tsx
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer;
}
```

</details>

<details>
<summary><b>Passkey prompt doesn't appear</b></summary>

WebAuthn requires a secure context:
- Use `localhost` during development
- Use HTTPS in production
- Ensure you're using a supported browser (Chrome, Safari, Edge)

</details>

<details>
<summary><b>Transaction simulation failed</b></summary>

Common causes:
- Insufficient balance for the transfer amount
- Invalid recipient address
- Paymaster rejected the transaction

Check the console for detailed error messages.

</details>

<details>
<summary><b>Hydration mismatch errors (Next.js)</b></summary>

Wrap client-side logic in a mount check:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Loading />;
```

</details>

---

## 🏆 Bounty Compliance Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| ✅ Working Example Repo | Done | Complete Next.js starter |
| ✅ Next.js/Vite/React Native | Done | Next.js 16 |
| ✅ Clean folder structure | Done | See Project Structure |
| ✅ Well-documented code | Done | JSDoc comments throughout |
| ✅ Quick-Start README | Done | This file |
| ✅ 2+ Step-by-Step Tutorials | Done | 3 tutorials included |
| ✅ Passkey login flow | Done | `PasskeyLogin.tsx` |
| ✅ Gasless transactions | Done | `GaslessTransfer.tsx` |
| ✅ Session persistence | Done | Tutorial 3 + auto-reconnect |
| ✅ Live Demo on Devnet | Done | Vercel deployment |
| ✅ Message signing | Done | `SignMessage.tsx` |

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Blockchain:** Solana (Devnet)
- **Wallet SDK:** @lazorkit/wallet
- **Styling:** Tailwind CSS 4
- **Components:** Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © 2025

---

## 🔗 Resources

- [LazorKit Documentation](https://docs.lazorkit.com/)
- [LazorKit GitHub](https://github.com/lazor-kit/lazor-kit)
- [LazorKit Telegram](https://t.me/lazorkit)
- [Solana Documentation](https://docs.solana.com/)

---

<div align="center">
  <p>Built with 💜 for the Solana ecosystem</p>
  <p>
    <a href="https://docs.lazorkit.com">Docs</a> •
    <a href="https://t.me/lazorkit">Telegram</a> •
    <a href="https://twitter.com/lazorkit">Twitter</a>
  </p>
</div>
