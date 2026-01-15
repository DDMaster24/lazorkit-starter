'use client';

/**
 * TransactionHistory Component
 * 
 * Displays recent transactions for the connected smart wallet.
 * This component fetches transaction signatures from the Solana
 * network and displays them with links to the explorer.
 * 
 * Features:
 * - Auto-refresh every 30 seconds
 * - Manual refresh button
 * - Links to Solana Explorer
 * - Transaction type detection
 */

import { useWallet } from '@lazorkit/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';
import { Connection, PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';
import { History, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { LAZORKIT_CONFIG } from '@/lib/config';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
    signature: string;
    slot: number;
    blockTime: number | null;
    err: any;
}

export function TransactionHistory() {
    const { wallet, isConnected } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Fetches the last 5 transaction signatures for the wallet
     */
    const fetchTransactions = useCallback(async () => {
        if (!wallet?.smartWallet) return;

        setLoading(true);
        try {
            const connection = new Connection(LAZORKIT_CONFIG.rpcUrl);
            const pubkey = new PublicKey(wallet.smartWallet);

            const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 5 });

            setTransactions(signatures.map((sig: ConfirmedSignatureInfo) => ({
                signature: sig.signature,
                slot: sig.slot,
                blockTime: sig.blockTime ?? null,
                err: sig.err,
            })));
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [wallet?.smartWallet]);

    useEffect(() => {
        if (isConnected && wallet?.smartWallet) {
            fetchTransactions();

            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchTransactions, 30000);
            return () => clearInterval(interval);
        }
    }, [isConnected, wallet?.smartWallet, fetchTransactions]);

    /**
     * Formats a Unix timestamp to a relative time string
     */
    const formatTime = (blockTime: number | null): string => {
        if (!blockTime) return 'Pending...';

        const now = Date.now() / 1000;
        const diff = now - blockTime;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    /**
     * Opens the transaction in Solana Explorer
     */
    const openExplorer = (signature: string) => {
        window.open(
            `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            '_blank'
        );
    };

    if (!isConnected) return null;

    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-md col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <History className="h-5 w-5 text-blue-400" />
                        </div>
                        Recent Transactions
                    </CardTitle>
                    <CardDescription className="mt-1">
                        Last 5 transactions on your smart wallet
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                    onClick={fetchTransactions}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>

            <CardContent>
                {loading && transactions.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <History className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No transactions yet</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Send a gasless transfer to see it here!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={tx.signature}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors group cursor-pointer"
                                    onClick={() => openExplorer(tx.signature)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${tx.err ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <div>
                                            <p className="text-sm font-mono text-gray-300">
                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {tx.err ? 'Failed' : 'Success'} • {formatTime(tx.blockTime)}
                                            </p>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
