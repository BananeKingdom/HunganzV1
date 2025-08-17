'use client';

import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';
import { getContractAddresses, BANANE_V1_ABI, HUNGANZ_V1_ABI, FLOW_RANDOMNESS_ABI } from '@/lib/contracts';
import { toast } from 'sonner';

export function useContracts() {
  const { wallet, provider, signer } = useWallet();
  const [bananeBalance, setBananeBalance] = useState<string>('0');
  const [hunganzBalance, setHunganzBalance] = useState<string>('0');
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get contract addresses for current network
  const contractAddresses = useMemo(() => {
    if (!wallet.chainId) return null;
    return getContractAddresses(wallet.chainId);
  }, [wallet.chainId]);

  // Create contract instances
  const contracts = useMemo(() => {
    if (!provider || !contractAddresses) return null;

    try {
      return {
        banane: new ethers.Contract(contractAddresses.BANANE_V1, BANANE_V1_ABI, provider),
        hunganz: new ethers.Contract(contractAddresses.HUNGANZ_V1, HUNGANZ_V1_ABI, provider),
        randomness: new ethers.Contract(contractAddresses.FLOW_RANDOMNESS, FLOW_RANDOMNESS_ABI, provider),
      };
    } catch (error) {
      console.error('Error creating contract instances:', error);
      return null;
    }
  }, [provider, contractAddresses]);

  // Create contract instances with signer for write operations
  const contractsWithSigner = useMemo(() => {
    if (!signer || !contractAddresses) return null;

    try {
      return {
        banane: new ethers.Contract(contractAddresses.BANANE_V1, BANANE_V1_ABI, signer),
        hunganz: new ethers.Contract(contractAddresses.HUNGANZ_V1, HUNGANZ_V1_ABI, signer),
        randomness: new ethers.Contract(contractAddresses.FLOW_RANDOMNESS, FLOW_RANDOMNESS_ABI, signer),
      };
    } catch (error) {
      console.error('Error creating contract instances with signer:', error);
      return null;
    }
  }, [signer, contractAddresses]);

  // Fetch Banane balance
  const fetchBananeBalance = async () => {
    if (!contracts || !wallet.address) return;

    setIsLoading(true);
    try {
      const balance = await contracts.banane.balanceOf(wallet.address);
      const decimals = await contracts.banane.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setBananeBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (error: any) {
      console.error('Error fetching Banane balance:', error);
      toast.error('Failed to fetch Banane balance: ' + error.message);
      setBananeBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Hunganz balance (NFT count)
  const fetchHunganzBalance = async () => {
    if (!contracts || !wallet.address) return;

    try {
      const balance = await contracts.hunganz.balanceOf(wallet.address);
      setHunganzBalance(balance.toString());
    } catch (error: any) {
      console.error('Error fetching Hunganz balance:', error);
      toast.error('Failed to fetch Hunganz balance: ' + error.message);
      setHunganzBalance('0');
    }
  };

  // Get Hunga info by token ID
  const getHungaInfo = async (tokenId: number) => {
    if (!contracts) return null;

    try {
      const [basicInfo, levelInfo, typeInfo] = await Promise.all([
        contracts.hunganz.getHungaBasicInfo(tokenId),
        contracts.hunganz.getHungaLevelInfo(tokenId),
        contracts.hunganz.getHungaTypeInfo(tokenId)
      ]);
      
      // Get the evolution stage and corresponding URI
      const evolution = levelInfo[2].toString();
      const evolutionIndex = parseInt(evolution) || 0;
      const uriArray = typeInfo[3]; // Array of IPFS URIs for different evolution stages
      
      // Select the URI for the current evolution stage
      let imageUri = '';
      if (Array.isArray(uriArray) && uriArray[evolutionIndex]) {
        imageUri = uriArray[evolutionIndex];
      } else if (Array.isArray(uriArray) && uriArray[0]) {
        imageUri = uriArray[0]; // Fallback to first image
      }
      
      return {
        tokenId,
        owner: basicInfo[0],
        id: basicInfo[1].toString(),
        typeId: basicInfo[2].toString(),
        typeIndex: basicInfo[3].toString(),
        level: levelInfo[0].toString(),
        experience: levelInfo[1].toString(),
        evolution: evolution,
        isDead: levelInfo[3],
        rarity: typeInfo[0].toString(),
        element: typeInfo[1].toString(),
        name: typeInfo[2],
        uri: imageUri
      };
    } catch (error: any) {
      console.error('Error fetching Hunga info:', error);
      toast.error('Failed to fetch Hunga info: ' + error.message);
      return null;
    }
  };

  // Fetch all user NFTs with metadata
  const fetchUserNFTs = async () => {
    if (!contracts || !wallet.address) return;

    setIsLoading(true);
    try {
      const balance = await contracts.hunganz.balanceOf(wallet.address);
      const balanceNum = parseInt(balance.toString());
      
      if (balanceNum === 0) {
        setUserNFTs([]);
        return;
      }

      // Get all token IDs owned by user
      const tokenIds = [];
      for (let i = 0; i < balanceNum; i++) {
        try {
          const tokenId = await contracts.hunganz.tokenOfOwnerByIndex(wallet.address, i);
          tokenIds.push(parseInt(tokenId.toString()));
        } catch (error) {
          // If tokenOfOwnerByIndex is not available, try alternative approach
          console.warn('tokenOfOwnerByIndex not available, using alternative method');
          break;
        }
      }

      // If tokenOfOwnerByIndex failed, try getting token IDs by events or other means
      if (tokenIds.length === 0 && balanceNum > 0) {
        // For now, we'll try common token IDs (this is a fallback)
        for (let i = 1; i <= 100; i++) {
          try {
            const owner = await contracts.hunganz.ownerOf(i);
            if (owner.toLowerCase() === wallet.address.toLowerCase()) {
              tokenIds.push(i);
            }
          } catch (error) {
            // Token doesn't exist or not owned by user
          }
        }
      }

      // Fetch detailed info for each token
      const nftPromises = tokenIds.map(tokenId => getHungaInfo(tokenId));
      const nftResults = await Promise.all(nftPromises);
      
      const validNFTs = nftResults.filter(nft => nft !== null);
      setUserNFTs(validNFTs);
      
    } catch (error: any) {
      console.error('Error fetching user NFTs:', error);
      toast.error('Failed to fetch NFTs: ' + error.message);
      setUserNFTs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mint Hunga (requires signer)
  const mintHunga = async (hungaType: number) => {
    if (!contractsWithSigner || !wallet.address) {
      toast.error('Wallet not connected or signer not available');
      return null;
    }

    setIsLoading(true);
    try {
      const tx = await contractsWithSigner.hunganz.mintHunga(wallet.address, hungaType);
      toast.success('Minting Hunga... Transaction sent!');
      
      const receipt = await tx.wait();
      toast.success('Hunga minted successfully!');
      
      // Refresh balances
      await Promise.all([fetchBananeBalance(), fetchHunganzBalance()]);
      
      return receipt;
    } catch (error: any) {
      console.error('Error minting Hunga:', error);
      toast.error('Failed to mint Hunga: ' + error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send Hunga on fetch mission
  const sendOnFetch = async (tokenId: number) => {
    if (!contractsWithSigner) {
      toast.error('Wallet not connected or signer not available');
      return null;
    }

    setIsLoading(true);
    try {
      const tx = await contractsWithSigner.hunganz.sendOnFetch(tokenId);
      toast.success('Sending Hunga on fetch mission...');
      
      const receipt = await tx.wait();
      toast.success('Fetch mission started!');
      
      return receipt;
    } catch (error: any) {
      console.error('Error sending on fetch:', error);
      toast.error('Failed to send on fetch: ' + error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get contract info (name, symbol, etc.)
  const getContractInfo = async () => {
    if (!contracts) return null;

    try {
      const [bananeName, bananeSymbol, bananeDecimals, bananeTotalSupply, hunganzName, hunganzSymbol] = await Promise.all([
        contracts.banane.name(),
        contracts.banane.symbol(),
        contracts.banane.decimals(),
        contracts.banane.totalSupply(),
        contracts.hunganz.name(),
        contracts.hunganz.symbol(),
      ]);

      return {
        banane: {
          name: bananeName,
          symbol: bananeSymbol,
          decimals: bananeDecimals,
          totalSupply: ethers.formatUnits(bananeTotalSupply, bananeDecimals),
        },
        hunganz: {
          name: hunganzName,
          symbol: hunganzSymbol,
        },
      };
    } catch (error: any) {
      console.error('Error fetching contract info:', error);
      return null;
    }
  };

  // Auto-fetch balances when wallet connects
  useEffect(() => {
    if (wallet.isConnected && contracts) {
      fetchBananeBalance();
      fetchHunganzBalance();
      fetchUserNFTs();
    }
  }, [wallet.isConnected, contracts, wallet.address]);

  return {
    contracts,
    contractsWithSigner,
    contractAddresses,
    bananeBalance,
    hunganzBalance,
    userNFTs,
    isLoading,
    fetchBananeBalance,
    fetchHunganzBalance,
    fetchUserNFTs,
    getHungaInfo,
    mintHunga,
    sendOnFetch,
    getContractInfo,
  };
}
