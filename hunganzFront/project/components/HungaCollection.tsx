'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Heart, Clock, Trophy, Star } from 'lucide-react';

interface HungaCollectionProps {
  wallet: any;
  contracts: any;
  hunganzBalance: string;
  contractAddresses: any;
}

interface HungaData {
  tokenId: number;
  typeId: number;
  level: number;
  evolution: number;
  experience: number;
  fetchCount: number;
  nextHarvestAmount: number;
  isFetching: boolean;
  isDead: boolean;
  ipfsUri: string;
  imageUrl?: string;
  name: string;
  element: string;
  rarity: string;
}

export default function HungaCollection({ wallet, contracts, hunganzBalance, contractAddresses }: HungaCollectionProps) {
  const [hungas, setHungas] = useState<HungaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (contracts?.hunganz && wallet?.address) {
      loadUserHungas();
    }
  }, [contracts?.hunganz, wallet?.address]);

  const loadUserHungas = async () => {
    if (!contracts?.hunganz || !wallet?.address) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading user Hungas using token ID approach...');
      
      // Query directly using token IDs - more reliable than events
      console.log(`User has ${hunganzBalance} NFTs, checking token ownership...`);
      console.log('Contract address:', contracts.hunganz.address);
      console.log('User wallet address:', wallet.address);
      
      // First, let's specifically check token ID 0 since user says they own it
      try {
        console.log('=== DEBUGGING TOKEN ID 0 ===');
        const owner0 = await contracts.hunganz.ownerOf(0);
        console.log('Token 0 owner:', owner0);
        console.log('User address:', wallet.address);
        console.log('Addresses match:', owner0.toLowerCase() === wallet.address.toLowerCase());
        
        if (owner0.toLowerCase() === wallet.address.toLowerCase()) {
          console.log('✅ User DOES own token 0 - getting info...');
          try {
            const info0 = await contracts.hunganz.getHungaInfo(0);
            console.log('Token 0 info:', info0);
          } catch (infoError) {
            console.error('Error getting token 0 info:', infoError);
          }
        } else {
          console.log('❌ User does NOT own token 0');
          console.log('Expected owner:', wallet.address);
          console.log('Actual owner:', owner0);
        }
      } catch (error) {
        console.error('Error checking token 0:', error);
      }
      console.log('=== END TOKEN 0 DEBUG ===');
      
      // Check a reasonable range of token IDs to find owned tokens (starting from 0)
      const maxTokensToCheck = Math.max(50, parseInt(hunganzBalance) * 5); // Check at least 50, or 5x the balance
      const possibleTokenIds = [];
      for (let i = 0; i <= maxTokensToCheck; i++) {
        possibleTokenIds.push(i);
      }
      
      console.log(`Checking token IDs 0-${maxTokensToCheck} for ownership...`);
      
      const directHungaPromises = possibleTokenIds.map(async (tokenId) => {
        try {
          // Check if this token belongs to the user
          const owner = await contracts.hunganz.ownerOf(tokenId);
          if (owner.toLowerCase() === wallet.address.toLowerCase()) {
            console.log(`Found owned token: ${tokenId}`);
            
            // Get Hunga info from contract
            const hungaInfo = await contracts.hunganz.getHungaInfo(tokenId);
            
            // Parse the Hunga data
            const typeId = Number(hungaInfo.typeId);
            const level = Number(hungaInfo.level);
            const evolution = Number(hungaInfo.evolution);
            const experience = Number(hungaInfo.experience);
            const fetchCount = Number(hungaInfo.fetchCount);
            const nextHarvestAmount = Number(hungaInfo.nextHarvestAmount);
            const isFetching = hungaInfo.isFetching;
            const isDead = hungaInfo.isDead;
            const ipfsUri = hungaInfo.ipfsUri;
            
            // Determine character type and element
            let name = '';
            let element = '';
            let rarity = '';
            
            if (typeId === 0) {
              name = 'FireBob';
              element = 'Fire';
              rarity = evolution === 0 ? 'Common' : evolution === 1 ? 'Uncommon' : evolution === 2 ? 'Rare' : 'Legendary';
            } else if (typeId === 1) {
              name = 'PlantJimmy';
              element = 'Plant';
              rarity = evolution === 0 ? 'Common' : evolution === 1 ? 'Uncommon' : evolution === 2 ? 'Rare' : 'Legendary';
            } else if (typeId === 2) {
              name = 'WaterNolan';
              element = 'Water';
              rarity = evolution === 0 ? 'Common' : evolution === 1 ? 'Uncommon' : evolution === 2 ? 'Rare' : 'Legendary';
            }
            
            // Convert IPFS URI to HTTP URL
            let imageUrl = '';
            console.log(`Token ${tokenId} IPFS URI:`, ipfsUri);
            if (ipfsUri && ipfsUri.startsWith('ipfs://')) {
              imageUrl = `https://ipfs.io/ipfs/${ipfsUri.replace('ipfs://', '')}`;
              console.log(`Token ${tokenId} converted image URL:`, imageUrl);
            } else if (ipfsUri) {
              console.log(`Token ${tokenId} has non-IPFS URI:`, ipfsUri);
              // Try to use it as-is if it's already an HTTP URL
              if (ipfsUri.startsWith('http')) {
                imageUrl = ipfsUri;
              }
            } else {
              console.log(`Token ${tokenId} has no IPFS URI`);
            }
            
            return {
              tokenId: Number(tokenId),
              typeId,
              level,
              evolution,
              experience,
              fetchCount,
              nextHarvestAmount,
              isFetching,
              isDead,
              ipfsUri,
              imageUrl,
              name,
              element,
              rarity
            };
          }
          return null;
        } catch (error) {
          // Token doesn't exist or not owned by user - this is normal
          return null;
        }
      });
      
      const loadedHungas = (await Promise.all(directHungaPromises)).filter(Boolean) as HungaData[];
      console.log(`Found ${loadedHungas.length} owned Hungas via token ID query`);
      console.log('Loaded Hungas:', loadedHungas);
      
      // Debug: If no Hungas found but balance shows NFTs, log more info
      if (loadedHungas.length === 0 && parseInt(hunganzBalance) > 0) {
        console.warn(`MISMATCH: Balance shows ${hunganzBalance} NFTs but token scan found 0`);
        console.warn(`Scanned token IDs 0-${maxTokensToCheck}`);
        console.warn('This might indicate the NFT has a token ID higher than our scan range');
        
        // Try checking a few higher token IDs
        console.log('Trying higher token ID range...');
        const higherTokenIds = [];
        for (let i = maxTokensToCheck + 1; i <= maxTokensToCheck + 50; i++) {
          higherTokenIds.push(i);
        }
        
        const higherPromises = higherTokenIds.map(async (tokenId) => {
          try {
            const owner = await contracts.hunganz.ownerOf(tokenId);
            if (owner.toLowerCase() === wallet.address.toLowerCase()) {
              console.log(`FOUND OWNED TOKEN IN HIGHER RANGE: ${tokenId}`);
              return tokenId;
            }
            return null;
          } catch (error) {
            return null;
          }
        });
        
        const foundHigherTokens = (await Promise.all(higherPromises)).filter(Boolean);
        if (foundHigherTokens.length > 0) {
          console.log('Found tokens in higher range:', foundHigherTokens);
        }
      }
      
      // Sort by token ID (newest first)
      loadedHungas.sort((a, b) => b.tokenId - a.tokenId);
      
      setHungas(loadedHungas);
    } catch (error: any) {
      console.error('Error loading Hungas:', error);
      setError(error.message || 'Failed to load Hungas');
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'from-red-500 to-orange-500';
      case 'Plant': return 'from-green-500 to-emerald-500';
      case 'Water': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400/30';
      case 'Uncommon': return 'text-green-400 border-green-400/30';
      case 'Rare': return 'text-blue-400 border-blue-400/30';
      case 'Legendary': return 'text-purple-400 border-purple-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getEvolutionStars = (evolution: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < evolution ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
          <p className="text-amber-300 text-sm">
            🎉 You own {hunganzBalance} Hunga NFTs!
          </p>
          <p className="text-amber-400 text-xs mt-1">
            Contract: {contractAddresses?.HUNGANZ_V1 || 'Not available'}
          </p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-amber-300">Loading your Hunga collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
          <p className="text-amber-300 text-sm">
            🎉 You own {hunganzBalance} Hunga NFTs!
          </p>
          <p className="text-amber-400 text-xs mt-1">
            Contract: {contractAddresses?.HUNGANZ_V1 || 'Not available'}
          </p>
        </div>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-300">Error loading collection: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Collection Summary */}
      <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
        <p className="text-amber-300 text-sm">
          🎉 You own {hunganzBalance} Hunga NFTs!
        </p>
        <p className="text-amber-400 text-xs mt-1">
          Contract: {contractAddresses?.HUNGANZ_V1 || 'Not available'}
        </p>
      </div>

      {/* Hungas Grid */}
      {hungas.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">😭</div>
          <p className="text-slate-400 mb-2">No Hungas found</p>
          <p className="text-slate-500 text-sm">Your collection appears to be empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {hungas.map((hunga) => (
            <div
              key={hunga.tokenId}
              className={`relative bg-black/40 rounded-xl border-2 ${getRarityColor(hunga.rarity)} overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
            >
              {/* Hunga Image - Full Artwork */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900">
                {hunga.imageUrl ? (
                  <Image
                    src={hunga.imageUrl}
                    alt={`${hunga.name} #${hunga.tokenId}`}
                    width={200}
                    height={200}
                    className="w-full h-auto"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      // Fallback to emoji if IPFS image fails
                      console.log(`Image failed to load for ${hunga.name} #${hunga.tokenId}:`, hunga.imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(`Image loaded successfully for ${hunga.name} #${hunga.tokenId}:`, hunga.imageUrl);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-6xl">
                      {hunga.element === 'Fire' ? '🔥' : hunga.element === 'Plant' ? '🌱' : '💧'}
                    </div>
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {hunga.isFetching && (
                    <div className="bg-orange-500/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                      🏃‍♂️ Fetching
                    </div>
                  )}
                  {hunga.isDead && (
                    <div className="bg-red-500/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                      💀 Dead
                    </div>
                  )}
                </div>

                {/* Element Badge */}
                <div className={`absolute top-2 right-2 bg-gradient-to-r ${getElementColor(hunga.element)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                  {hunga.element}
                </div>
              </div>

              {/* Hunga Info */}
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-lg">{hunga.name} #{hunga.tokenId}</h4>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getRarityColor(hunga.rarity)} bg-black/20`}>
                    {hunga.rarity}
                  </div>
                </div>

                {/* Evolution Stars */}
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm mr-2">Evolution:</span>
                  {getEvolutionStars(hunga.evolution)}
                  <span className="text-purple-400 font-bold ml-2">{hunga.evolution}/4</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Level {hunga.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">{hunga.experience.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-300">{hunga.fetchCount} fetches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{hunga.nextHarvestAmount} BANANE</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
