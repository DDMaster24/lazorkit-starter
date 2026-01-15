'use client';

/**
 * PasskeyLogin Component
 * 
 * A premium login card that demonstrates LazorKit's passkey authentication.
 * Uses the device's biometric capabilities (FaceID, TouchID, Windows Hello)
 * to authenticate users without seed phrases or browser extensions.
 * 
 * Features:
 * - Animated mesh gradient background with floating orbs
 * - Shimmer button effect
 * - Toast notifications for success/error
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
        <div className="flex min-h-screen items-center justify-center mesh-gradient-bg p-4 overflow-hidden">
            {/* Floating Orbs */}
            <div className="floating-orb floating-orb-1" />
            <div className="floating-orb floating-orb-2" />
            <div className="floating-orb floating-orb-3" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 grid-pattern pointer-events-none" />

            {/* Radial Fade Overlay */}
            <div className="absolute h-full w-full bg-black/40 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="z-10"
            >
                <Card className="w-full max-w-md gradient-border glass-card hover-glow">
                    <CardHeader className="text-center space-y-4 pb-4">
                        {/* Animated logo with pulse */}
                        <motion.div
                            className="mx-auto bg-gradient-to-tr from-purple-500 via-blue-500 to-green-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center logo-pulse"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Fingerprint className="text-white h-10 w-10" />
                        </motion.div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold text-gradient">
                                LazorKit Starter
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-base">
                                Secure, gasless, and seedless.<br />
                                The future of Solana wallets.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Login Button with Shimmer */}
                        <Button
                            size="lg"
                            className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300 font-bold h-14 text-lg btn-shimmer shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
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

                        {/* Feature pills with glass effect */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <motion.div
                                className="flex items-center gap-1.5 text-xs text-gray-400 glass-card px-3 py-1.5 rounded-full"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <Shield className="h-3.5 w-3.5 text-green-400" />
                                No Seed Phrase
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1.5 text-xs text-gray-400 glass-card px-3 py-1.5 rounded-full"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                                Gasless
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1.5 text-xs text-gray-400 glass-card px-3 py-1.5 rounded-full"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                                Biometric
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-center text-gray-500 pt-2">
                            Powered by <span className="text-purple-400">LazorKit</span> & <span className="text-green-400">Solana</span>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
