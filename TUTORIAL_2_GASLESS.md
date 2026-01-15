# Tutorial: Sending Gasless Transactions ⛽

Learn how to use LazorKit's Paymaster to sponsor transaction fees, enabling users to transact without holding any SOL for gas.

## Table of Contents
- [Overview](#overview)
- [How the Paymaster Works](#how-the-paymaster-works)
- [Step 1: Configure the Provider](#step-1-configure-the-provider)
- [Step 2: Build the Transaction](#step-2-build-the-transaction)
- [Step 3: Send with Paymaster](#step-3-send-with-paymaster)
- [Advanced: Fee Token Options](#advanced-fee-token-options)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

In traditional Solana apps, users need SOL to pay for transaction fees. This creates a **massive onboarding friction**:

```
❌ Traditional Flow:
   User signs up → Needs to buy SOL → Find an exchange → 
   KYC → Wait for verification → Transfer SOL → Finally use app
```

With **Gasless Transactions**, the Paymaster sponsors the fees:

```
✅ LazorKit Gasless Flow:
   User signs up with Passkey → Use app immediately → Done!
```

---

## How the Paymaster Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │  Paymaster   │     │   Solana     │
│  (Passkey)   │     │   Service    │     │   Network    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Sign Transaction│                    │
       │───────────────────▶│                    │
       │   (with passkey)   │                    │
       │                    │                    │
       │                    │ 2. Add fee payment │
       │                    │───────────────────▶│
       │                    │   (Paymaster SOL)  │
       │                    │                    │
       │                    │ 3. Transaction     │
       │◀─────────────────────── Confirmed ──────│
       │                    │                    │
```

**The Paymaster:**
- Validates your transaction
- Adds fee payment instructions
- Pays the SOL gas fee from its own account
- Optionally charges users in USDC or other tokens

---

## Step 1: Configure the Provider

Ensure your `LazorkitProvider` has the paymaster configuration:

```tsx
// src/components/providers/LazorTxProvider.tsx
<LazorkitProvider
    rpcUrl="https://api.devnet.solana.com"
    portalUrl="https://portal.lazor.sh"
    paymasterConfig={{
        // LazorKit's devnet paymaster - sponsors all transactions
        paymasterUrl: 'https://kora.devnet.lazorkit.com'
    }}
>
    {children}
</LazorkitProvider>
```

**Configuration Options:**

| Option | Description | Required |
|--------|-------------|----------|
| `paymasterUrl` | URL of the Paymaster service | ✅ Yes |
| `policy` | Sponsorship rules (see Advanced) | No |
| `feeToken` | Default token for fees (e.g., 'USDC') | No |

---

## Step 2: Build the Transaction

Create your transaction instruction using `@solana/web3.js`:

```tsx
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';

function TransferComponent() {
    const { smartWalletPubkey, signAndSendTransaction } = useWallet();

    const sendSol = async (recipient: string, amount: number) => {
        // Create a standard Solana transfer instruction
        const instruction = SystemProgram.transfer({
            fromPubkey: smartWalletPubkey,      // Your smart wallet
            toPubkey: new PublicKey(recipient), // Destination address
            lamports: amount * LAMPORTS_PER_SOL // Amount in lamports
        });

        // The instruction is ready to be sent!
        return instruction;
    };
}
```

---

## Step 3: Send with Paymaster

Use `signAndSendTransaction` to send the transaction with paymaster sponsorship:

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState } from 'react';

export function GaslessTransfer() {
    const { signAndSendTransaction, smartWalletPubkey } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        if (!smartWalletPubkey) return;

        setLoading(true);
        try {
            // 1. Create the instruction
            const instruction = SystemProgram.transfer({
                fromPubkey: smartWalletPubkey,
                toPubkey: new PublicKey('RECIPIENT_ADDRESS_HERE'),
                lamports: 0.001 * LAMPORTS_PER_SOL
            });

            // 2. Send with gasless options
            const signature = await signAndSendTransaction({
                instructions: [instruction],
                transactionOptions: {
                    // This tells the Paymaster to sponsor the fee
                    // or charge the user in USDC instead of SOL
                    feeToken: 'USDC'
                }
            });

            console.log('Transaction signature:', signature);
            
            // 3. View on explorer
            const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
            console.log('View on explorer:', explorerUrl);

        } catch (error) {
            console.error('Transaction failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleTransfer} disabled={loading}>
            {loading ? 'Sending...' : 'Send 0.001 SOL (Gasless)'}
        </button>
    );
}
```

**What happens behind the scenes:**
1. User clicks "Send"
2. Browser prompts for biometric authentication
3. Transaction is signed with the passkey
4. LazorKit sends tx to the Paymaster
5. Paymaster validates and adds fee payment
6. Transaction is submitted to Solana
7. Signature is returned to your app

---

## Advanced: Fee Token Options

The Paymaster supports different fee payment methods:

### Option 1: Fully Sponsored (App Pays)
```tsx
// The Paymaster covers all fees - user pays nothing
await signAndSendTransaction({
    instructions: [instruction],
    // No transactionOptions = use default paymaster policy
});
```

### Option 2: Pay Fees in USDC
```tsx
// User pays fees in USDC instead of SOL
await signAndSendTransaction({
    instructions: [instruction],
    transactionOptions: {
        feeToken: 'USDC'  // Deducts USDC from user's wallet
    }
});
```

### Option 3: Pay Fees in SPL Token
```tsx
// User pays fees in custom SPL token
await signAndSendTransaction({
    instructions: [instruction],
    transactionOptions: {
        feeToken: 'BONK'  // Or any supported token
    }
});
```

---

## Production Checklist

Before going to mainnet, ensure:

### 1. ✅ Fund Your Paymaster
```bash
# Check paymaster balance
solana balance <PAYMASTER_ADDRESS> --url mainnet-beta

# Fund if needed (from your treasury)
solana transfer <PAYMASTER_ADDRESS> 10 --url mainnet-beta
```

### 2. ✅ Configure Sponsorship Policy
Contact LazorKit team to set up your policy:
- **Allow all**: Sponsor every transaction
- **Whitelist**: Only sponsor specific programs
- **Rate limit**: Max transactions per user per day
- **Amount limit**: Max SOL sponsored per transaction

### 3. ✅ Set Up Monitoring
Track your paymaster usage to avoid running out:
```tsx
// Example: Fetch paymaster stats
const response = await fetch('https://your-paymaster.com/stats');
const { balance, dailyUsage, userCount } = await response.json();
```

### 4. ✅ Handle Fallbacks
What happens if paymaster is unavailable?
```tsx
try {
    // Try gasless first
    await signAndSendTransaction({ instructions, transactionOptions: { feeToken: 'USDC' } });
} catch (error) {
    if (error.message.includes('paymaster')) {
        // Fallback: User pays in SOL
        await signAndSendTransaction({ instructions });
    }
}
```

---

## Troubleshooting

### ❌ "Simulation Error"

**Causes:**
- User doesn't have enough funds for the transfer amount
- Invalid instruction or account
- Program error

**Solution:**
```tsx
// Add simulation before sending
const instruction = SystemProgram.transfer({ /* ... */ });

// Check if user has enough balance
const balance = await connection.getBalance(smartWalletPubkey);
if (balance < transferAmount) {
    throw new Error('Insufficient balance');
}
```

### ❌ "Invalid Paymaster"

**Causes:**
- Wrong `paymasterUrl` in config
- Paymaster service is down
- Network mismatch (using devnet paymaster on mainnet)

**Solution:**
Check your config:
```tsx
// Devnet
paymasterUrl: 'https://kora.devnet.lazorkit.com'

// Mainnet (when available)
paymasterUrl: 'https://kora.lazorkit.com'
```

### ❌ "User rejected the request"

**Cause:** User cancelled the biometric prompt

**Solution:** This is expected! Handle it gracefully:
```tsx
try {
    await signAndSendTransaction({ instructions });
} catch (error) {
    if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        toast.info('Transaction cancelled');
        return; // Don't show error
    }
    toast.error('Transaction failed: ' + error.message);
}
```

### ❌ "Paymaster refused to sponsor"

**Causes:**
- Transaction doesn't match paymaster policy
- Daily limit exceeded
- Paymaster out of funds

**Solution:** Check with your paymaster configuration or contact LazorKit support.

---

## Complete Example

Here's a full, production-ready gasless transfer component:

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { useState } from 'react';

export function GaslessTransfer() {
    const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [txSignature, setTxSignature] = useState<string | null>(null);

    const handleTransfer = async () => {
        // Validation
        if (!smartWalletPubkey || !recipient || !amount) return;

        setLoading(true);
        setTxSignature(null);

        try {
            // Validate recipient address
            const destination = new PublicKey(recipient);
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            // Create instruction
            const instruction = SystemProgram.transfer({
                fromPubkey: smartWalletPubkey,
                toPubkey: destination,
                lamports,
            });

            // Send with paymaster
            const signature = await signAndSendTransaction({
                instructions: [instruction],
                transactionOptions: { feeToken: 'USDC' }
            });

            setTxSignature(signature);
            setRecipient('');
            setAmount('');

        } catch (error: any) {
            console.error('Transfer failed:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) return null;

    return (
        <div>
            <h2>Send SOL (Gasless)</h2>
            
            <input
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            
            <input
                type="number"
                placeholder="Amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            
            <button onClick={handleTransfer} disabled={loading}>
                {loading ? 'Processing...' : 'Send'}
            </button>

            {txSignature && (
                <p>
                    Success!{' '}
                    <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View on Explorer
                    </a>
                </p>
            )}
        </div>
    );
}
```

---

## Next Steps

- [Tutorial 1: Passkey Authentication](./TUTORIAL_1_PASSKEYS.md) - Set up biometric login
- [Tutorial 3: Session Persistence](./TUTORIAL_3_SESSION.md) - Keep users logged in

---

*Need help? Join the [LazorKit Telegram](https://t.me/lazorkit) community!*
