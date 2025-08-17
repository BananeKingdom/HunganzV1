'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

interface WalletContextType {
  // Wallet state
  wallet: WalletState;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Wallet functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  requestAccountSelection: () => Promise<void>;
  
  // Utility functions
  isMetaMaskInstalled: () => boolean;
  getNetworkName: (chainId: number) => string;
  formatAddress: (address: string) => string;
  copyAddress: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = (): boolean => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Get network name from chain ID
  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      747: 'Flow Mainnet',
      545: 'Flow Testnet',
      1337: 'Localhost',
      31337: 'Hardhat Network',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async (): Promise<void> => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        toast.success('Address copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy address');
      }
    }
  };

  // Switch network
  const switchNetwork = async (chainId: number): Promise<void> => {
    if (!isMetaMaskInstalled() || !window.ethereum) {
      toast.error('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        try {
          const networkConfigs: { [key: number]: any } = {
            747: {
              chainId: '0x2EB',
              chainName: 'Flow Mainnet',
              nativeCurrency: {
                name: 'Flow',
                symbol: 'FLOW',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.evm.nodes.onflow.org'],
              blockExplorerUrls: ['https://evm.flowscan.org'],
            },
            545: {
              chainId: '0x221',
              chainName: 'Flow Testnet',
              nativeCurrency: {
                name: 'Flow',
                symbol: 'FLOW',
                decimals: 18,
              },
              rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
              blockExplorerUrls: ['https://evm-testnet.flowscan.org'],
            },
          };

          if (networkConfigs[chainId]) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfigs[chainId]],
            });
          }
        } catch (addError) {
          toast.error('Failed to add network');
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  // Force account selection (useful for switching accounts)
  const requestAccountSelection = async (): Promise<void> => {
    if (!isMetaMaskInstalled() || !window.ethereum) {
      toast.error('MetaMask is not installed.');
      return;
    }

    try {
      // This will force MetaMask to show account selection
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      
      // Then connect with the selected account
      await connectWallet();
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Account selection cancelled');
      } else {
        toast.error('Failed to request account selection: ' + error.message);
      }
    }
  };

  // Connect to MetaMask
  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
      const walletSigner = await browserProvider.getSigner();
      
      setProvider(browserProvider);
      setSigner(walletSigner);

      const network = await browserProvider.getNetwork();
      const balance = await browserProvider.getBalance(accounts[0]);
      const formattedBalance = ethers.formatEther(balance);

      setWallet({
        address: accounts[0],
        balance: parseFloat(formattedBalance).toFixed(4),
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet: ' + error.message);
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = (): void => {
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
    });
    setProvider(null);
    setSigner(null);
    toast.info('Wallet disconnected');
  };

  // Listen for account and network changes
  useEffect(() => {
    if (isMetaMaskInstalled() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== wallet.address) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Update chain ID and reload provider
        const newChainId = parseInt(chainId, 16);
        setWallet(prev => ({ ...prev, chainId: newChainId }));
        
        // Reconnect to update provider with new network
        if (wallet.isConnected) {
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [wallet.address, wallet.isConnected]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const contextValue: WalletContextType = {
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
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Export types for use in other components
export type { WalletState, WalletContextType };
