'use client';

/**
 * PasskeyLogin Component
 * 
 * A premium login card that demonstrates LazorKit's passkey authentication.
 * Uses the device's biometric capabilities (FaceID, TouchID, Windows Hello)
 * to authenticate users without seed phrases or browser extensions.
 * 
 * Features:
 * - Animated loading states
 * - Toast notifications for success/error
 * - Responsive design
 * - Premium glassmorphism UI
 * 
 * @example
 * ```tsx
 * <PasskeyLogin />
 * ```
 */

import { useWallet } from '@lazorkit/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Fingerprint, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PasskeyLogin renders the authentication card shown to unauthenticated users.
 * When the user clicks "Login with Passkey", it triggers the device's native
 * WebAuthn dialog for biometric authentication.
 */
export function PasskeyLogin() {
    const { connect, isConnecting } = useWallet();

    /**
     * Handles the passkey authentication flow.
     * Triggers the browser's native WebAuthn dialog and creates/loads
     * the user's smart wallet upon successful authentication.
     */
    const handleLogin = async () => {
        try {
            await connect();
            toast.success('Successfully authenticated with Passkey!', {
                description: 'Your smart wallet is ready to use.',
            });
        } catch (error: any) {
            console.error('Authentication failed:', error);
            toast.error('Authentication failed', {
                description: error.message || 'User cancelled or passkey error.',
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black p-4">
            {/* Animated background grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            <div className="absolute h-full w-full bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <Card className="z-10 w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl shadow-purple-900/20">
                    <CardHeader className="text-center space-y-4">
                        {/* Animated logo */}
                        <motion.div
                            className="mx-auto bg-gradient-to-tr from-purple-500 to-green-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-green-900/30"
                            animate={{
                                boxShadow: [
                                    '0 10px 40px rgba(34, 197, 94, 0.2)',
                                    '0 10px 60px rgba(168, 85, 247, 0.3)',
                                    '0 10px 40px rgba(34, 197, 94, 0.2)',
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Fingerprint className="text-white h-10 w-10" />
                        </motion.div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                LazorKit Starter
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-base">
                                Secure, gasless, and seedless.<br />
                                The future of Solana wallets.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Login Button */}
                        <Button
                            size="lg"
                            className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300 font-bold h-14 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                            onClick={handleLogin}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Fingerprint className="mr-2 h-5 w-5" />
                                    Login with Passkey
                                </>
                            )}
                        </Button>

                        {/* Feature pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <motion.div
                                className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Shield className="h-3 w-3 text-green-500" />
                                No Seed Phrase
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Zap className="h-3 w-3 text-yellow-500" />
                                Gasless
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Fingerprint className="h-3 w-3 text-purple-500" />
                                Biometric
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-center text-gray-600 pt-2">
                            Powered by LazorKit & Solana
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
