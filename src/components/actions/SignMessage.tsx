'use client';

/**
 * SignMessage Component
 * 
 * Demonstrates the `signMessage` method from the LazorKit SDK.
 * This allows users to cryptographically sign arbitrary messages
 * using their passkey, proving wallet ownership without sending
 * a transaction on-chain.
 * 
 * Use Cases:
 * - Verify wallet ownership for airdrops
 * - Sign terms of service
 * - Authenticate with off-chain services
 * - Create verifiable attestations
 */

import { useWallet } from '@lazorkit/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { PenTool, Copy, Check, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SignMessage() {
    const { signMessage, isConnected, smartWalletPubkey } = useWallet();
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    /**
     * Handles the message signing flow.
     * Uses the WebAuthn passkey to create a cryptographic signature.
     */
    const handleSign = async () => {
        if (!message.trim()) {
            toast.error('Please enter a message to sign');
            return;
        }

        setLoading(true);
        setSignature(null);

        try {
            // The signMessage function triggers the device's biometric prompt
            // (FaceID, TouchID, or Windows Hello) and returns a signature
            const result = await signMessage(message);
            // Handle both string and object return types
            const sig = typeof result === 'string' ? result : result.signature;
            setSignature(sig);

            toast.success('Message signed successfully!', {
                description: 'Signature verified with your passkey.',
            });
        } catch (error: any) {
            console.error('Sign message failed:', error);
            toast.error('Signing failed', {
                description: error.message || 'User cancelled or passkey error.',
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Copies the signature to clipboard
     */
    const copySignature = async () => {
        if (!signature) return;

        await navigator.clipboard.writeText(signature);
        setCopied(true);
        toast.success('Signature copied to clipboard');

        setTimeout(() => setCopied(false), 2000);
    };

    /**
     * Generates a verification message with timestamp
     */
    const generateVerificationMessage = () => {
        const timestamp = new Date().toISOString();
        const walletShort = smartWalletPubkey?.toString().slice(0, 8) || 'wallet';
        setMessage(`I verify ownership of ${walletShort}... at ${timestamp}`);
    };

    if (!isConnected) return null;

    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <PenTool className="h-5 w-5 text-purple-400" />
                    </div>
                    Sign Message
                </CardTitle>
                <CardDescription>
                    Prove wallet ownership by signing a message with your passkey.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Message Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message" className="text-gray-300">
                            Message to Sign
                        </Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-400 hover:text-purple-300 h-auto py-1"
                            onClick={generateVerificationMessage}
                        >
                            <Shield className="h-3 w-3 mr-1" />
                            Generate Verification
                        </Button>
                    </div>
                    <Input
                        id="message"
                        placeholder="Enter any message to sign..."
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* Sign Button */}
                <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold transition-all duration-300"
                    onClick={handleSign}
                    disabled={loading || !message.trim()}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Awaiting Biometric...
                        </>
                    ) : (
                        <>
                            <PenTool className="mr-2 h-4 w-4" />
                            Sign with Passkey
                        </>
                    )}
                </Button>

                {/* Signature Output */}
                <AnimatePresence>
                    {signature && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <Label className="text-gray-300 text-sm">Signature</Label>
                            <div className="relative group">
                                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                    <p className="text-xs font-mono text-green-400 break-all pr-8">
                                        {signature}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={copySignature}
                                >
                                    {copied ? (
                                        <Check className="h-3 w-3" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                ✓ This signature proves you own this wallet without any on-chain transaction.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
