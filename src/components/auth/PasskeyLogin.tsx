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
 * - Enhanced error handling with tips overlay
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
import { useState } from 'react';
import { Loader2, Fingerprint, Shield, Zap, XCircle, RefreshCw, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthError {
    message: string;
    type: 'cancelled' | 'timeout' | 'unsupported' | 'unknown';
}

/**
 * PasskeyLogin renders the authentication card shown to unauthenticated users.
 * When the user clicks "Login with Passkey", it triggers the device's native
 * WebAuthn dialog for biometric authentication.
 */
export function PasskeyLogin() {
    const { connect, isConnecting } = useWallet();
    const [authError, setAuthError] = useState<AuthError | null>(null);

    /**
     * Determines the error type from the error message
     */
    const getErrorType = (error: any): AuthError['type'] => {
        const msg = error?.message?.toLowerCase() || '';
        if (msg.includes('cancel') || msg.includes('abort') || msg.includes('user')) {
            return 'cancelled';
        }
        if (msg.includes('timeout')) {
            return 'timeout';
        }
        if (msg.includes('not supported') || msg.includes('not allowed')) {
            return 'unsupported';
        }
        return 'unknown';
    };

    /**
     * Handles the passkey authentication flow.
     */
    const handleLogin = async () => {
        setAuthError(null);

        try {
            await connect();
            toast.success('Successfully authenticated with Passkey!', {
                description: 'Your smart wallet is ready to use.',
            });
        } catch (error: any) {
            console.error('Authentication failed:', error);
            const errorType = getErrorType(error);
            setAuthError({
                message: error.message || 'Authentication failed',
                type: errorType,
            });
        }
    };

    /**
     * Clears the error state and allows retry
     */
    const dismissError = () => {
        setAuthError(null);
    };

    /**
     * Get error-specific messaging and tips
     */
    const getErrorContent = (type: AuthError['type']) => {
        switch (type) {
            case 'cancelled':
                return {
                    title: 'Authentication Cancelled',
                    description: 'You closed the passkey dialog before completing authentication.',
                    tips: [
                        'Complete the biometric verification when prompted',
                        'Click "Sign in" on the passkey portal',
                        'Try creating a new passkey if you don\'t have one'
                    ]
                };
            case 'timeout':
                return {
                    title: 'Authentication Timed Out',
                    description: 'The authentication request took too long.',
                    tips: [
                        'Check your internet connection',
                        'Make sure your device biometrics are working',
                        'Try again and respond to the prompt quickly'
                    ]
                };
            case 'unsupported':
                return {
                    title: 'Passkeys Not Supported',
                    description: 'Your browser or device doesn\'t support passkeys.',
                    tips: [
                        'Use Chrome, Safari, or Edge browser',
                        'Ensure you\'re on a secure (HTTPS) connection',
                        'Update your browser to the latest version'
                    ]
                };
            default:
                return {
                    title: 'Authentication Failed',
                    description: 'Something went wrong during authentication.',
                    tips: [
                        'Refresh the page and try again',
                        'Check if you have an existing passkey',
                        'Try creating a new account if needed'
                    ]
                };
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

            {/* Error Overlay */}
            <AnimatePresence>
                {authError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={dismissError}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card className="gradient-border glass-card border-red-500/20 overflow-hidden">
                                <CardHeader className="text-center space-y-4 pb-2">
                                    {/* Error Icon */}
                                    <motion.div
                                        className="mx-auto bg-gradient-to-tr from-red-500/20 to-orange-500/20 p-4 rounded-2xl w-20 h-20 flex items-center justify-center border border-red-500/30"
                                        initial={{ rotate: -10 }}
                                        animate={{ rotate: 0 }}
                                        transition={{ type: 'spring', damping: 10 }}
                                    >
                                        <XCircle className="text-red-400 h-10 w-10" />
                                    </motion.div>

                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-bold text-red-400">
                                            {getErrorContent(authError.type).title}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400">
                                            {getErrorContent(authError.type).description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Tips Section */}
                                    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <HelpCircle className="h-4 w-4 text-blue-400" />
                                            <span className="text-sm font-medium text-gray-300">Troubleshooting Tips</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {getErrorContent(authError.type).tips.map((tip, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-start gap-2 text-sm text-gray-400"
                                                >
                                                    <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                                                    {tip}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/10 hover:bg-white/5 text-gray-300"
                                            onClick={dismissError}
                                        >
                                            Dismiss
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold btn-shimmer"
                                            onClick={() => {
                                                dismissError();
                                                setTimeout(handleLogin, 100);
                                            }}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Try Again
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Login Card */}
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
