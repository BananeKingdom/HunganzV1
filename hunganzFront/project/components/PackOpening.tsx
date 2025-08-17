'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { X, Sparkles, Package, Zap } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';

interface PackOpeningProps {
  isOpen: boolean;
  onClose: () => void;
  onPackOpened?: (result: any) => void;
}

type PackStage = 'entering' | 'select-pack' | 'acquiring' | 'acquired' | 'opening' | 'revealing' | 'complete';

export default function PackOpening({ isOpen, onClose, onPackOpened }: PackOpeningProps) {
  const [packStage, setPackStage] = useState<PackStage>('entering');
  const [revealedHunga, setRevealedHunga] = useState<any>(null);
  const [selectedPackType, setSelectedPackType] = useState<number>(0);
  const [isTransacting, setIsTransacting] = useState(false);
  const [userPacks, setUserPacks] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [acquiredPacks, setAcquiredPacks] = useState<{packTypeId: number, commitRound: number, canOpen: boolean}[]>([]);
  
  const { wallet } = useWallet();
  const { contracts, contractsWithSigner, isLoading } = useContracts();

  useEffect(() => {
    if (isOpen) {
      setPackStage('entering');
      setError('');
      // Auto-transition to pack selection after entrance animation
      const timer = setTimeout(() => {
        setPackStage('select-pack');
        // Load any existing acquired packs after entering
        loadUserPacks();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load packs when wallet or contracts change
  useEffect(() => {
    if (contracts?.hunganz && wallet?.address && packStage === 'select-pack') {
      loadUserPacks();
    }
  }, [contracts?.hunganz, wallet?.address, packStage]);

  // Listen for contract events
  useEffect(() => {
    if (!contracts?.hunganz || !wallet?.address) return;

    const handlePackAcquired = (user: string, packTypeId: number, commitRound: number) => {
      if (user.toLowerCase() === wallet.address!.toLowerCase()) {
        console.log('PackAcquired event received:', { packTypeId, commitRound });
        // Event received - this is mainly for logging since we handle state in the transaction handler
        // Only add if not already in acquiring/acquired state to avoid duplicates
        if (packStage === 'select-pack') {
          setAcquiredPacks(prev => [...prev, { packTypeId, commitRound, canOpen: true }]);
          setPackStage('acquired');
          setIsTransacting(false);
        }
      }
    };

    const handleHungaMinted = (user: string, tokenId: number, typeId: number, typeIndex: number) => {
      if (user.toLowerCase() === wallet.address!.toLowerCase()) {
        console.log('Hunga minted!', { tokenId, typeId, typeIndex });
        // Remove the opened pack from acquired packs list
        setAcquiredPacks(prev => prev.slice(1)); // Remove first pack (oldest)
        // Get Hunga info and reveal
        revealMintedHunga(tokenId);
      }
    };

    // Set up event listeners
    contracts.hunganz.on('PackAquired', handlePackAcquired);
    contracts.hunganz.on('HungaMinted', handleHungaMinted);

    return () => {
      contracts.hunganz.off('PackAquired', handlePackAcquired);
      contracts.hunganz.off('HungaMinted', handleHungaMinted);
    };
  }, [contracts?.hunganz, wallet?.address]);

  const loadUserPacks = async () => {
    if (!contracts?.hunganz || !wallet?.address) return;
    try {
      console.log('Loading user packs from blockchain events...');
      
      // Query PackAquired events for this user
      const filter = contracts.hunganz.filters.PackAquired(wallet.address);
      const events = await contracts.hunganz.queryFilter(filter, -10000); // Last 10k blocks
      
      console.log('Found PackAquired events:', events.length);
      
      // Query HungaMinted events to see which packs were already opened
      const mintFilter = contracts.hunganz.filters.HungaMinted(wallet.address);
      const mintEvents = await contracts.hunganz.queryFilter(mintFilter, -10000);
      
      console.log('Found HungaMinted events:', mintEvents.length);
      
      // Calculate unopened packs (acquired - opened)
      const acquiredCount = events.length;
      const openedCount = mintEvents.length;
      const unopenedCount = Math.max(0, acquiredCount - openedCount);
      
      console.log(`Packs: ${acquiredCount} acquired, ${openedCount} opened, ${unopenedCount} remaining`);
      
      // Create pack objects for remaining unopened packs
      const remainingPacks = [];
      for (let i = openedCount; i < acquiredCount; i++) {
        const event = events[i];
        // Type guard to ensure we have an EventLog with args
        if ('args' in event && event.args) {
          remainingPacks.push({
            packTypeId: Number(event.args.packTypeId),
            commitRound: Number(event.args.commitRound),
            canOpen: true
          });
        }
      }
      
      setAcquiredPacks(remainingPacks);
      console.log('Loaded existing packs:', remainingPacks);
      
    } catch (error) {
      console.error('Error loading user packs:', error);
      setAcquiredPacks([]);
    }
  };

  const revealMintedHunga = async (tokenId: number) => {
    if (!contracts?.hunganz) return;
    try {
      console.log('Revealing Hunga with token ID:', tokenId);
      
      // Get complete Hunga information from contract
      const hungaInfo = await contracts.hunganz.getHungaInfo(tokenId);
      console.log('Hunga info from contract:', hungaInfo);
      
      // Element and rarity mappings
      const elements = ['Fire', 'Water', 'Plant', 'Air'];
      const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
      const elementColors: Record<string, string> = {
        'Fire': 'text-red-400',
        'Water': 'text-blue-400', 
        'Plant': 'text-green-400',
        'Air': 'text-purple-400'
      };
      const elementEmojis: Record<string, string> = {
        'Fire': '🔥',
        'Water': '💧',
        'Plant': '🌱', 
        'Air': '💨'
      };
      
      const element = elements[Number(hungaInfo.element)] || 'Unknown';
      const rarity = rarities[Number(hungaInfo.rarity)] || 'Common';
      
      const revealedHunga = {
        tokenId: Number(tokenId),
        name: hungaInfo.name || 'Unknown Hunga',
        element: element,
        rarity: rarity,
        level: Number(hungaInfo.level),
        experience: Number(hungaInfo.experience),
        evolution: Number(hungaInfo.evolution),
        fetchCount: Number(hungaInfo.fetchCount),
        nextHarvestAmount: Number(hungaInfo.nextHarvestAmount),
        isFetching: hungaInfo.isFetching,
        isDead: hungaInfo.isDead,
        ipfsUri: hungaInfo.uri || '',
        emoji: elementEmojis[element] || '❓',
        color: elementColors[element] || 'text-gray-400',
        typeId: Number(hungaInfo.typeId),
        typeIndex: Number(hungaInfo.typeIndex)
      };
      
      console.log('Processed Hunga data:', revealedHunga);
      
      setRevealedHunga(revealedHunga);
      setPackStage('complete');
      setIsTransacting(false);
      
      if (onPackOpened) {
        onPackOpened(revealedHunga);
      }
    } catch (error) {
      console.error('Error revealing Hunga:', error);
      setError('Failed to reveal Hunga');
      setIsTransacting(false);
    }
  };

  const handleAcquirePack = async () => {
    if (!contractsWithSigner?.hunganz || !wallet?.address || isTransacting) return;
    
    setIsTransacting(true);
    setError('');
    setPackStage('acquiring');
    
    try {
      const tx = await contractsWithSigner.hunganz.aquirePack(selectedPackType);
      console.log('Acquiring pack...', tx.hash);
      const receipt = await tx.wait();
      console.log('Pack acquisition transaction confirmed:', receipt.hash);
      
      // Add the pack directly since transaction is confirmed
      setAcquiredPacks(prev => [...prev, { 
        packTypeId: selectedPackType, 
        commitRound: 0, // We don't have the actual commitRound from receipt
        canOpen: true 
      }]);
      
      // Move to acquired state
      setPackStage('acquired');
      setIsTransacting(false);
      
      console.log('Pack successfully acquired and added to list');
    } catch (error: any) {
      console.error('Error acquiring pack:', error);
      setError(error.message || 'Failed to acquire pack');
      setIsTransacting(false);
      setPackStage('select-pack');
    }
  };

  const handleOpenPack = async () => {
    if (!contractsWithSigner?.hunganz || !wallet?.address || isTransacting) return;
    
    setIsTransacting(true);
    setError('');
    setPackStage('opening');
    
    try {
      const tx = await contractsWithSigner.hunganz.openPack();
      console.log('Opening pack...', tx.hash);
      await tx.wait();
      setPackStage('revealing');
    } catch (error: any) {
      console.error('Error opening pack:', error);
      setError(error.message || 'Failed to open pack');
      setIsTransacting(false);
      setPackStage('acquired');
    }
  };

  const handleClose = () => {
    setPackStage('entering');
    setRevealedHunga(null);
    setError('');
    setIsTransacting(false);
    // Don't clear acquired packs as they should persist
    onClose();
  };

  const handleOpenSpecificPack = (packIndex: number) => {
    if (isTransacting) return;
    const pack = acquiredPacks[packIndex];
    if (!pack) return;
    
    setSelectedPackType(pack.packTypeId);
    handleOpenPack();
  };

  if (!isOpen) return null;

  const packTypes = [
    { id: 0, name: 'Basic Pack', description: 'Contains FireBob, PlantJimmy, or WaterNolan', cost: '0 BANANE' },
    { id: 1, name: 'Rare Pack', description: 'Higher chance for evolved forms', cost: '100 BANANE' },
    { id: 2, name: 'Epic Pack', description: 'Guaranteed rare or better', cost: '500 BANANE' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close button */}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="relative flex flex-col items-center max-w-2xl mx-4">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Pack Selection Stage */}
        {packStage === 'select-pack' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-amber-300 mb-6">🎁 Choose Your Pack</h2>
            
            {/* Show acquired packs if any */}
            {acquiredPacks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-green-300 mb-6 text-center">📦 Your Acquired Packs</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                  {acquiredPacks.map((pack, index) => {
                    const packType = packTypes.find(p => p.id === pack.packTypeId);
                    return (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => handleOpenSpecificPack(index)}
                      >
                        <div className="relative overflow-hidden rounded-xl border-2 border-green-400/50 bg-gradient-to-br from-green-900/30 to-emerald-900/30 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/20">
                          {/* Pack Image */}
                          <div className="aspect-square p-4">
                            <Image
                              src="/pack.png"
                              alt={`${packType?.name || 'Mystery'} Pack`}
                              width={150}
                              height={150}
                              className="w-full h-full object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                            />
                          </div>
                          
                          {/* Pack Info Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h4 className="text-white font-bold text-sm mb-1">{packType?.name || 'Mystery Pack'}</h4>
                              <p className="text-green-300 text-xs">Click to open!</p>
                            </div>
                          </div>
                          
                          {/* Sparkle Effect */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                          </div>
                          
                          {/* Glow Effect */}
                          <div className="absolute inset-0 rounded-xl bg-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        </div>
                        
                        {/* Pack Type Badge */}
                        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold border-2 border-green-400">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-600 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-amber-300 mb-4 text-center">Or acquire a new pack:</h3>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 mb-6">
              {packTypes.map((pack) => (
                <div
                  key={pack.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPackType === pack.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-gray-600 bg-gray-800/30 hover:border-amber-600'
                  }`}
                  onClick={() => setSelectedPackType(pack.id)}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{pack.description}</p>
                  <p className="text-amber-400 font-bold">{pack.cost}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAcquirePack}
              disabled={isTransacting || !wallet?.address}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
            >
              <Package className="h-4 w-4 mr-2" />
              {isTransacting ? 'Acquiring...' : 'Acquire Pack'}
            </Button>
          </div>
        )}

        {/* Acquiring Stage */}
        {packStage === 'acquiring' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Acquiring Pack...</h2>
              <p className="text-amber-300">Please confirm the transaction in your wallet</p>
            </div>
          </div>
        )}

        {/* Pack Acquired - Ready to Open */}
        {packStage === 'acquired' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-amber-300 mb-6">🎁 Pack Acquired!</h2>
            <div className="mb-6">
              <Image
                src="/pack.png"
                alt="Hunga Pack"
                width={200}
                height={200}
                className="drop-shadow-2xl mx-auto hover:scale-105 transition-transform cursor-pointer"
                onClick={handleOpenPack}
              />
            </div>
            <p className="text-white text-lg mb-4">Your pack is ready to open!</p>
            <Button
              onClick={handleOpenPack}
              disabled={isTransacting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTransacting ? 'Opening...' : 'Open Pack'}
            </Button>
          </div>
        )}

        {/* Opening Stage */}
        {packStage === 'opening' && (
          <div className="text-center">
            <div className="mb-6 relative">
              <Image
                src="/pack.png"
                alt="Opening Pack"
                width={250}
                height={250}
                className="drop-shadow-2xl mx-auto animate-bounce"
              />
              <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-r from-purple-400/40 to-yellow-400/40 scale-150 animate-pulse"></div>
              {/* Enhanced sparkle effects */}
              <Sparkles className="absolute top-4 left-4 h-8 w-8 text-yellow-400 animate-ping" />
              <Sparkles className="absolute top-2 right-6 h-6 w-6 text-purple-400 animate-ping delay-300" />
              <Sparkles className="absolute bottom-4 right-2 h-7 w-7 text-blue-400 animate-ping delay-500" />
              <Sparkles className="absolute bottom-2 left-6 h-5 w-5 text-green-400 animate-ping delay-700" />
              <Sparkles className="absolute top-1/2 left-2 h-4 w-4 text-pink-400 animate-ping delay-1000" />
              <Sparkles className="absolute top-1/2 right-2 h-6 w-6 text-cyan-400 animate-ping delay-1200" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">Opening Pack...</h2>
            <p className="text-purple-300 text-lg">✨ Waiting for randomness beacon... ✨</p>
          </div>
        )}

        {/* Revealing Stage */}
        {packStage === 'revealing' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Revealing Hunga...</h2>
              <p className="text-purple-300">The pack is opening!</p>
            </div>
          </div>
        )}

        {/* Complete - Show Result */}
        {packStage === 'complete' && revealedHunga && (
          <div className="text-center max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/50 to-amber-900/50 backdrop-blur-sm rounded-3xl p-8 border border-amber-400/30 shadow-2xl">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  🎉 Pack Opened! 🎉
                </h2>
                <p className="text-purple-300 text-lg">You've discovered a new Hunga!</p>
              </div>

              {/* Main Content Grid */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left: IPFS Artwork */}
                <div className="space-y-4">
                  <div className="relative group">
                    {revealedHunga.ipfsUri ? (
                      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-900/20 to-yellow-900/20">
                        <Image
                          src={revealedHunga.ipfsUri}
                          alt={`${revealedHunga.name} Artwork`}
                          width={300}
                          height={300}
                          className="w-full h-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback to emoji if IPFS fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl border-2 border-amber-400/50">
                        <div className="text-8xl animate-bounce">{revealedHunga.emoji}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hunga Name & Element */}
                  <div className="text-center">
                    <h3 className={`text-3xl font-bold mb-2 ${revealedHunga.color}`}>
                      {revealedHunga.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-2xl">{revealedHunga.emoji}</span>
                      <span className="text-amber-300 text-lg font-semibold">{revealedHunga.element} Element</span>
                    </div>
                    
                    {/* Rarity Badge */}
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      revealedHunga.rarity === 'Legendary' ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-400' :
                      revealedHunga.rarity === 'Epic' ? 'bg-purple-600/30 text-purple-300 border border-purple-400' :
                      revealedHunga.rarity === 'Rare' ? 'bg-blue-600/30 text-blue-300 border border-blue-400' :
                      'bg-gray-600/30 text-gray-300 border border-gray-400'
                    }`}>
                      ✨ {revealedHunga.rarity} ✨
                    </div>
                  </div>
                </div>

                {/* Right: Detailed Stats */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-bold text-lg mb-3">📊 Basic Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Token ID:</span>
                        <span className="text-white font-mono">#{revealedHunga.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Type ID:</span>
                        <span className="text-white font-mono">{revealedHunga.typeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Level:</span>
                        <span className="text-green-400 font-bold">{revealedHunga.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Evolution:</span>
                        <span className="text-purple-400 font-bold">{revealedHunga.evolution}/4</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Progress */}
                  <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-bold text-lg mb-3">⚡ Experience & Progress</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Experience:</span>
                        <span className="text-blue-400 font-bold">{revealedHunga.experience.toLocaleString()} XP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Fetch Count:</span>
                        <span className="text-cyan-400 font-bold">{revealedHunga.fetchCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Next Harvest:</span>
                        <span className="text-yellow-400 font-bold">{revealedHunga.nextHarvestAmount} BANANE</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
                    <h4 className="text-amber-300 font-bold text-lg mb-3">🔄 Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Fetching:</span>
                        <span className={revealedHunga.isFetching ? 'text-orange-400' : 'text-green-400'}>
                          {revealedHunga.isFetching ? '🔄 Active' : '✅ Ready'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Health:</span>
                        <span className={revealedHunga.isDead ? 'text-red-400' : 'text-green-400'}>
                          {revealedHunga.isDead ? '💀 Dead' : '❤️ Alive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-8">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-12 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🎒 Add to Collection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Particle effects for revealing */}
        {packStage === 'revealing' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping ${
                  i % 4 === 0 ? 'bg-yellow-400' :
                  i % 4 === 1 ? 'bg-purple-400' :
                  i % 4 === 2 ? 'bg-blue-400' : 'bg-green-400'
                }`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
