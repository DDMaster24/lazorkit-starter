'use client';

/**
 * GaslessTransfer Component
 * 
 * Demonstrates LazorKit's gasless transaction feature using the Paymaster.
 * Users can send SOL without paying transaction fees themselves - the
 * Paymaster sponsors the fees (or charges in USDC instead of SOL).
 * 
 * Features:
 * - Toggle between gasless and normal mode
 * - Address validation
 * - Transaction confirmation with explorer links
 * - Loading states and error handling
 * 
 * @example
 * ```tsx
 * <GaslessTransfer />
 * ```
 */

import { useWallet } from '@lazorkit/wallet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { Loader2, Zap, Send } from 'lucide-react';

/**
 * GaslessTransfer provides a form for sending SOL with optional
 * Paymaster sponsorship for transaction fees.
 */
export function GaslessTransfer() {
    const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [gasless, setGasless] = useState(true);

    /**
     * Handles the SOL transfer transaction.
     * Creates a SystemProgram transfer instruction and sends it
     * via the LazorKit SDK with optional Paymaster sponsorship.
     */

    const handleTransfer = async () => {
        if (!smartWalletPubkey) return;
        if (!recipient || !amount) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const destination = new PublicKey(recipient);
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            const instruction = SystemProgram.transfer({
                fromPubkey: smartWalletPubkey,
                toPubkey: destination,
                lamports: lamports,
            });

            const txOptions = gasless ? {
                feeToken: 'USDC' // Request Paymaster sponsorship (simulated for devnet usually involves getting paymaster approval)
                // Lazorkit devnet paymaster might sponsor automatically if configured.
                // The logic: passing feeToken usually implies paying with that token, or passing specific paymaster options.
                // For true gasless, often 'feeToken' is omitted but paymasterConfig in provider handles it?
                // Re-reading docs: "Pay gas in USDC" example used feeToken: 'USDC'.
                // "Paymaster service enables gas sponsorship". 
                // I'll stick to the example: providing transactionOptions.
            } : undefined;

            console.log('Sending transaction...', { gasless, instruction });

            const signature = await signAndSendTransaction({
                instructions: [instruction],
                transactionOptions: txOptions
            });

            console.log('Signature:', signature);
            toast.success('Transaction sent successfully!', {
                description: `Signature: ${signature.slice(0, 8)}...`,
                action: {
                    label: 'View',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank')
                }
            });
            setAmount('');
        } catch (error: any) {
            console.error('Transfer failed:', error);
            toast.error('Transfer failed', {
                description: error.message || 'Unknown error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="gradient-border glass-card hover-glow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
                        <Send className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-gradient">Transfer SOL</span>
                </CardTitle>
                <CardDescription>
                    Send SOL to any Solana address.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-gray-300">Recipient Address</Label>
                    <Input
                        id="recipient"
                        placeholder="Solana Address..."
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-gray-300">Amount (SOL)</Label>
                    <div className="relative">
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.0"
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500 pr-12"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500 text-sm">
                            SOL
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${gasless ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            <Zap className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Gasless Mode</div>
                            <div className="text-xs text-gray-400">{gasless ? 'Paymaster covers fees' : 'You pay SOL for gas'}</div>
                        </div>
                    </div>
                    <Button
                        variant={gasless ? "default" : "outline"}
                        size="sm"
                        className={gasless ? "bg-green-600 hover:bg-green-700 text-white" : "border-white/10 text-gray-400"}
                        onClick={() => setGasless(!gasless)}
                    >
                        {gasless ? 'Active' : 'Off'}
                    </Button>
                </div>

            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-white text-black hover:bg-gray-100 font-bold btn-shimmer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
                    onClick={handleTransfer}
                    disabled={loading || !smartWalletPubkey}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {loading ? 'Processing...' : 'Send Transaction'}
                </Button>
            </CardFooter>
        </Card>
    );
}
