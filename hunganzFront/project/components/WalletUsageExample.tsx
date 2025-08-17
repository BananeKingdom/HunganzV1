'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Coins, Send, FileText, Zap } from 'lucide-react';

export default function WalletUsageExample() {
  const { wallet, provider, signer, getNetworkName } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Example: Sign a message
  const signMessage = async () => {
    if (!signer) {
      toast.error('Signer not available');
      return;
    }

    setIsLoading(true);
    try {
      const message = `Welcome to Hunganz! 
Timestamp: ${new Date().toISOString()}
Address: ${wallet.address}`;
      
      const signature = await signer.signMessage(message);
      toast.success('Message signed successfully!');
      console.log('Signature:', signature);
    } catch (error: any) {
      toast.error('Failed to sign message: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Send a transaction (small amount for testing)
  const sendTestTransaction = async () => {
    if (!signer || !wallet.address) {
      toast.error('Signer not available');
      return;
    }

    setIsLoading(true);
    try {
      // Send a very small amount to self (0.001 ETH)
      const tx = await signer.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther('0.001'),
      });

      toast.success('Transaction sent! Hash: ' + tx.hash.slice(0, 10) + '...');
      console.log('Transaction:', tx);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      toast.success('Transaction confirmed!');
      console.log('Receipt:', receipt);
    } catch (error: any) {
      toast.error('Transaction failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Interact with your deployed contracts
  const interactWithHunganzContract = async () => {
    if (!signer) {
      toast.error('Signer not available');
      return;
    }

    setIsLoading(true);
    try {
      // Example contract addresses from your memory
      const HUNGANZ_CONTRACT = '0x56B89B4e4e586289c0286e9Cfd622E6deDb55334'; // Flow Mainnet
      const BANANE_CONTRACT = '0x4064f2816a55aF45e8E2C777a36d5710AC46b907'; // Flow Mainnet

      // Simple contract ABI for demonstration
      const hunganzABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function totalSupply() view returns (uint256)',
      ];

      const contract = new ethers.Contract(HUNGANZ_CONTRACT, hunganzABI, signer);
      
      // Call read-only functions
      const name = await contract.name();
      const symbol = await contract.symbol();
      
      toast.success(`Contract: ${name} (${symbol})`);
      console.log('Contract info:', { name, symbol });
    } catch (error: any) {
      toast.error('Contract interaction failed: ' + error.message);
      console.error('Contract error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>🔗 Wallet Required</CardTitle>
          <CardDescription>
            Connect your wallet to see usage examples
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Wallet & Signer Usage Examples
          </CardTitle>
          <CardDescription>
            Demonstrating how to use wallet and signer throughout your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <div className="font-medium">Wallet Connected</div>
              <div className="text-sm text-muted-foreground">
                {wallet.address && `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
              </div>
            </div>
            <Badge variant="secondary">
              {wallet.chainId && getNetworkName(wallet.chainId)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={signMessage}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Sign Welcome Message
            </Button>

            <Button
              onClick={sendTestTransaction}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Transaction (0.001 ETH)
            </Button>

            <Button
              onClick={interactWithHunganzContract}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <Coins className="h-4 w-4 mr-2" />
              Read Hunganz Contract Info
            </Button>
          </div>

          {/* Developer Info */}
          <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
            <div className="font-medium mb-2">🛠️ For Developers:</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Provider: {provider ? '✅ Available' : '❌ Not available'}</div>
              <div>• Signer: {signer ? '✅ Available' : '❌ Not available'}</div>
              <div>• Network: {wallet.chainId || 'Unknown'}</div>
              <div>• Balance: {wallet.balance} ETH</div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-4 p-3 bg-slate-900 text-green-400 rounded-lg text-xs font-mono">
            <div className="text-white mb-2">Usage in any component:</div>
            <div>{`const { wallet, signer, provider } = useWallet();`}</div>
            <div>{`const tx = await signer.sendTransaction({...});`}</div>
            <div>{`const contract = new ethers.Contract(addr, abi, signer);`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
