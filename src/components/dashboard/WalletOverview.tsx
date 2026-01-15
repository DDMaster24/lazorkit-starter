'use client';

/**
 * WalletOverview Component
 * 
 * Displays the user's smart wallet information including:
 * - Current SOL balance (auto-refreshes every 10 seconds)
 * - Wallet address with copy functionality
 * - Quick actions (refresh balance, view on explorer)
 * 
 * This component demonstrates:
 * - Reading on-chain data using @solana/web3.js
 * - Using the wallet address from LazorKit's useWallet hook
 * - Responsive design with loading states
 * 
 * @example
 * ```tsx
 * <WalletOverview />
 * ```
 */

import { useWallet } from '@lazorkit/wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Wallet, RefreshCw, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { LAZORKIT_CONFIG } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WalletOverview provides a dashboard card showing the user's balance
 * and wallet address with copy and explorer functionality.
 */
export function WalletOverview() {
    const { wallet, isConnected } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    /**
     * Fetches the current SOL balance from the Solana network.
     * Uses the RPC URL configured in LAZORKIT_CONFIG.
     */
    const fetchBalance = useCallback(async () => {
        if (!wallet?.smartWallet) return;

        setLoading(true);
        try {
            const connection = new Connection(LAZORKIT_CONFIG.rpcUrl);
            const pubkey = new PublicKey(wallet.smartWallet);
            const bal = await connection.getBalance(pubkey);
            setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            toast.error('Failed to fetch balance');
        } finally {
            setLoading(false);
        }
    }, [wallet?.smartWallet]);

    // Fetch balance on mount and set up auto-refresh
    useEffect(() => {
        if (isConnected && wallet?.smartWallet) {
            fetchBalance();

            // Auto-refresh every 10 seconds
            const interval = setInterval(fetchBalance, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, wallet?.smartWallet, fetchBalance]);

    /**
     * Copies the wallet address to clipboard and shows feedback.
     */
    const copyAddress = async () => {
        if (!wallet?.smartWallet) return;

        await navigator.clipboard.writeText(wallet.smartWallet);
        setCopied(true);
        toast.success('Address copied to clipboard');

        setTimeout(() => setCopied(false), 2000);
    };

    /**
     * Opens the wallet address in Solana Explorer.
     */
    const openExplorer = () => {
        const url = `https://explorer.solana.com/address/${wallet?.smartWallet}?cluster=devnet`;
        window.open(url, '_blank');
    };

    if (!isConnected) return null;

    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                    Smart Wallet Balance
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/20">
                    <Wallet className="h-4 w-4 text-purple-400" />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Balance Display */}
                <div className="space-y-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={balance ?? 'loading'}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-3xl font-bold text-white"
                        >
                            {loading && balance === null ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <>
                                    {balance?.toFixed(4) ?? '0.0000'}
                                    <span className="text-lg text-gray-400 ml-2">SOL</span>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* USD Estimate (placeholder) */}
                    <p className="text-xs text-gray-500">
                        ≈ ${((balance ?? 0) * 150).toFixed(2)} USD
                    </p>
                </div>

                {/* Wallet Address */}
                <div className="flex items-center gap-2 bg-black/20 p-3 rounded-lg border border-white/5 group">
                    <span className="text-xs font-mono text-gray-500 truncate flex-1">
                        {wallet?.smartWallet}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
                        onClick={copyAddress}
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/10 hover:bg-white/5 text-gray-300"
                        onClick={fetchBalance}
                        disabled={loading}
                    >
                        <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/10 hover:bg-white/5 text-gray-300"
                        onClick={openExplorer}
                    >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Explorer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
