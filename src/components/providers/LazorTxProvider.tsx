'use client';

/**
 * LazorTxProvider Component
 * 
 * The root provider that configures the LazorKit SDK for your application.
 * This component must wrap your entire app to enable passkey authentication,
 * smart wallet functionality, and gasless transactions.
 * 
 * Configuration:
 * - rpcUrl: Solana RPC endpoint (devnet/mainnet)
 * - portalUrl: LazorKit portal for passkey management
 * - paymasterConfig: Settings for gasless transaction sponsorship
 * 
 * @example
 * ```tsx
 * // In your layout.tsx
 * <LazorTxProvider>
 *   <App />
 * </LazorTxProvider>
 * ```
 */

import { LazorkitProvider } from '@lazorkit/wallet';
import { ReactNode } from 'react';
import { LAZORKIT_CONFIG } from '@/lib/config';

// Polyfill for Buffer in browser environment
// Required by @solana/web3.js for transaction serialization
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer;
}

/**
 * LazorTxProvider wraps child components with the LazorkitProvider,
 * enabling access to the useWallet hook throughout the application.
 * 
 * @param children - React children to wrap with the provider
 */
export function LazorTxProvider({ children }: { children: ReactNode }) {
    return (
        <LazorkitProvider
            rpcUrl={LAZORKIT_CONFIG.rpcUrl}
            portalUrl={LAZORKIT_CONFIG.portalUrl}
            paymasterConfig={LAZORKIT_CONFIG.paymasterConfig}
        >
            {children}
        </LazorkitProvider>
    );
}
