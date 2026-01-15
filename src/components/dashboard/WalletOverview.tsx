'use client';

/**
 * WalletOverview Component
 * 
 * Displays the user's smart wallet information including:
 * - Current SOL balance (auto-refreshes every 10 seconds)
 * - USDC SPL token balance
 * - Wallet address with copy functionality
 * - Quick actions (refresh balance, view on explorer)
 * 
 * This component demonstrates:
 * - Reading on-chain data using @solana/web3.js
 * - Using the wallet address from LazorKit's useWallet hook
 * - Premium dashboard card styling
 * 
 * @example
 * ```tsx
 * <WalletOverview />
 * ```
 */

import { useWallet } from '@lazorkit/wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Wallet, RefreshCw, ExternalLink, Check, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { LAZORKIT_CONFIG } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';

// USDC Token Mint on Devnet
const USDC_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

/**
 * WalletOverview provides a dashboard card showing the user's SOL and USDC balances
 * and wallet address with copy and explorer functionality.
 */
export function WalletOverview() {
    const { wallet, isConnected } = useWallet();
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    /**
     * Fetches the current SOL and USDC balance from the Solana network.
     */
    const fetchBalances = useCallback(async () => {
        if (!wallet?.smartWallet) return;

        setLoading(true);
        try {
            const connection = new Connection(LAZORKIT_CONFIG.rpcUrl);
            const pubkey = new PublicKey(wallet.smartWallet);

            // Fetch SOL balance
            const sol = await connection.getBalance(pubkey);
            setSolBalance(sol / LAMPORTS_PER_SOL);

            // Fetch USDC token balance (if any)
            try {
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                    pubkey,
                    { mint: new PublicKey(USDC_MINT) }
                );
                if (tokenAccounts.value.length > 0) {
                    const usdcAmount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                    setUsdcBalance(usdcAmount);
                } else {
                    setUsdcBalance(0);
                }
            } catch {
                setUsdcBalance(0);
            }
        } catch (error) {
            console.error('Failed to fetch balances:', error);
            toast.error('Failed to fetch balances');
        } finally {
            setLoading(false);
        }
    }, [wallet?.smartWallet]);

    useEffect(() => {
        if (isConnected && wallet?.smartWallet) {
            fetchBalances();
            const interval = setInterval(fetchBalances, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, wallet?.smartWallet, fetchBalances]);

    const copyAddress = async () => {
        if (!wallet?.smartWallet) return;
        await navigator.clipboard.writeText(wallet.smartWallet);
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const openExplorer = () => {
        window.open(`https://explorer.solana.com/address/${wallet?.smartWallet}?cluster=devnet`, '_blank');
    };

    if (!isConnected) return null;

    return (
        <Card className="gradient-border glass-card hover-glow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                    Smart Wallet
                </CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                    <Wallet className="h-4 w-4 text-purple-400" />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Balances Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* SOL Balance */}
                    <motion.div
                        className="p-3 rounded-lg bg-black/30 border border-white/5"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-green-400 flex items-center justify-center">
                                <span className="text-[10px] font-bold">◎</span>
                            </div>
                            <span className="text-xs text-gray-500">SOL</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={solBalance ?? 'loading'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-bold text-white"
                            >
                                {loading && solBalance === null ? (
                                    <span className="animate-pulse text-gray-500">...</span>
                                ) : (
                                    solBalance?.toFixed(4) ?? '0.0000'
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <p className="text-[10px] text-gray-500">
                            ≈ ${((solBalance ?? 0) * 150).toFixed(2)}
                        </p>
                    </motion.div>

                    {/* USDC Balance */}
                    <motion.div
                        className="p-3 rounded-lg bg-black/30 border border-white/5"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                <Coins className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs text-gray-500">USDC</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={usdcBalance ?? 'loading-usdc'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-bold text-white"
                            >
                                {loading && usdcBalance === null ? (
                                    <span className="animate-pulse text-gray-500">...</span>
                                ) : (
                                    usdcBalance?.toFixed(2) ?? '0.00'
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <p className="text-[10px] text-gray-500">
                            ≈ ${(usdcBalance ?? 0).toFixed(2)}
                        </p>
                    </motion.div>
                </div>

                {/* Wallet Address */}
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/5 group hover:border-purple-500/30 transition-colors">
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
                            <Check className="h-3.5 w-3.5 text-green-400" />
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
                        className="flex-1 border-white/10 hover:bg-white/5 hover:border-purple-500/30 text-gray-300 transition-all"
                        onClick={fetchBalances}
                        disabled={loading}
                    >
                        <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/10 hover:bg-white/5 hover:border-purple-500/30 text-gray-300 transition-all"
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
