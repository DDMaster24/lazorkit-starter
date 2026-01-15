/**
 * LazorKit Configuration
 * 
 * Central configuration for the LazorKit SDK.
 * These values can be overridden via environment variables.
 * 
 * @property rpcUrl - Solana RPC endpoint (default: devnet)
 * @property portalUrl - LazorKit portal for passkey management
 * @property paymasterConfig.paymasterUrl - Paymaster service for gasless transactions
 */
export const LAZORKIT_CONFIG = {
  /** Solana RPC endpoint - use devnet for testing */
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',

  /** LazorKit portal URL for passkey credential management */
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.lazor.sh',

  /** Paymaster configuration for gasless transactions */
  paymasterConfig: {
    /** Paymaster service URL - sponsors transaction fees */
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com'
  }
};
