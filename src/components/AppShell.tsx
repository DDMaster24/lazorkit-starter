'use client';

/**
 * AppShell Component
 * 
 * The main application shell that handles authentication state and
 * renders either the login screen or the dashboard based on connection status.
 * 
 * Features:
 * - Automatic session persistence detection
 * - Loading state during hydration
 * - Responsive dashboard layout
 * - All LazorKit SDK features demonstrated
 */

import { useWallet } from '@lazorkit/wallet';
import { PasskeyLogin } from '@/components/auth/PasskeyLogin';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Github, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WalletOverview } from '@/components/dashboard/WalletOverview';
import { GaslessTransfer } from '@/components/actions/GaslessTransfer';
import { SignMessage } from '@/components/actions/SignMessage';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import { motion } from 'framer-motion';

/**
 * Main application shell component
 * Manages authentication state and renders appropriate UI
 */
export function AppShell() {
    const { isConnected, wallet, disconnect } = useWallet();
    const [mounted, setMounted] = useState(false);

    // Handle hydration mismatch by waiting for client mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading spinner during hydration
    if (!mounted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-sm text-gray-500">Loading LazorKit...</p>
                </motion.div>
            </div>
        )
    }

    // Show login screen if not connected
    if (!isConnected) {
        return <PasskeyLogin />;
    }

    // Render authenticated dashboard
    return (
        <div className="min-h-screen mesh-gradient-bg text-white p-4 sm:p-8 font-sans overflow-hidden relative">
            {/* Floating Orbs for dashboard */}
            <div className="floating-orb floating-orb-1 opacity-50" />
            <div className="floating-orb floating-orb-2 opacity-50" />
            <div className="floating-orb floating-orb-3 opacity-50" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 grid-pattern pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-6xl space-y-8 relative z-10"
            >
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-tr from-purple-500 to-green-500 rounded-xl shadow-lg shadow-purple-500/20" />
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                LazorKit Starter
                            </h1>
                            <p className="text-xs text-gray-500">Passkey-native Solana wallet</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 font-mono hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            {wallet?.smartWallet.slice(0, 4)}...{wallet?.smartWallet.slice(-4)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnect()}
                            className="border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-all duration-300"
                        >
                            Disconnect
                        </Button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Wallet Overview - Full width on mobile, 1 col on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <WalletOverview />
                    </motion.div>

                    {/* Gasless Transfer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <GaslessTransfer />
                    </motion.div>

                    {/* Sign Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        <SignMessage />
                    </motion.div>

                    {/* Transaction History - Full width */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-1 md:col-span-2 lg:col-span-3"
                    >
                        <TransactionHistory />
                    </motion.div>
                </main>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center text-2xl">
                            🚀
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">LazorKit Integration Complete</h3>
                            <p className="text-xs text-gray-400">
                                Passkey Auth • Gasless Transactions • Message Signing • Smart Wallets
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-white"
                            onClick={() => window.open('https://docs.lazorkit.com', '_blank')}
                        >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Docs
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-white"
                            onClick={() => window.open('https://github.com/lazor-kit/lazor-kit', '_blank')}
                        >
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
