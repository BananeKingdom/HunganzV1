'use client';

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Wallet, Copy, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export default function WalletInterface() {
  const {
    wallet,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    requestAccountSelection,
    isMetaMaskInstalled,
    getNetworkName,
    formatAddress,
    copyAddress,
  } = useWallet();

  // Quick actions for Flow networks
  const switchToFlowMainnet = () => switchNetwork(747);
  const switchToFlowTestnet = () => switchNetwork(545);

  if (!isMetaMaskInstalled()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            MetaMask Required
          </CardTitle>
          <CardDescription>
            Please install MetaMask to connect your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with Hunganz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallet.isConnected ? (
          <Button
            onClick={connectWallet}
            disabled={wallet.isConnecting}
            className="w-full"
            size="lg"
          >
            {wallet.isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                  {formatAddress(wallet.address!)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="shrink-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Balance</label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {wallet.balance} ETH
              </div>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex-1 justify-center">
                  {wallet.chainId ? getNetworkName(wallet.chainId) : 'Unknown'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="shrink-0"
                  title="Refresh connection"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Quick Network Switch */}
            {wallet.chainId && wallet.chainId !== 747 && wallet.chainId !== 545 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Switch to Flow</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToFlowMainnet}
                    className="flex-1"
                  >
                    Flow Mainnet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToFlowTestnet}
                    className="flex-1"
                  >
                    Flow Testnet
                  </Button>
                </div>
              </div>
            )}

            {/* Account Management Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={requestAccountSelection}
                variant="outline"
                className="flex-1"
                title="Switch to a different MetaMask account"
              >
                Switch Account
              </Button>
              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Additional wallet info component for debugging
export function WalletDebugInfo() {
  const { wallet, provider, signer } = useWallet();
  
  if (!wallet.isConnected) return null;
  
  return (
    <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-xs space-y-1">
      <div className="text-slate-400">Debug Info:</div>
      <div>Provider: {provider ? '✅ Connected' : '❌ Not connected'}</div>
      <div>Signer: {signer ? '✅ Available' : '❌ Not available'}</div>
      <div>Chain ID: {wallet.chainId}</div>
    </div>
  );
}
