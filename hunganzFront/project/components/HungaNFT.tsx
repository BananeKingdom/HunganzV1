'use client';

import React from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWallet } from '../contexts/WalletContext';
import NFTImage from './NFTImage';

interface HungaNFTProps {
  onClose: () => void;
}

export default function HungaNFT({ onClose }: HungaNFTProps) {
  const { wallet, connectWallet } = useWallet();
  const { 
    userNFTs, 
    bananeBalance, 
    isLoading,
    fetchUserNFTs
  } = useContracts();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900 to-green-900 p-8 rounded-lg border border-amber-600 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300">🦍 Hunganz NFT Collection</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-amber-100 text-2xl"
          >
            ×
          </button>
        </div>

        {!wallet.isConnected ? (
          <div className="text-center">
            <p className="text-amber-100 mb-4">Connect your wallet to access your Hunganz</p>
            <button
              onClick={connectWallet}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-black bg-opacity-50 rounded-lg">
              <p className="text-amber-300">Connected: {wallet.address}</p>
              <p className="text-amber-300">Banane Balance: {bananeBalance} BNN</p>
              <p className="text-amber-300">NFTs Found: {userNFTs.length}</p>
              <button
                onClick={fetchUserNFTs}
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh NFTs'}
              </button>
              <button
                onClick={() => console.log('Current NFTs:', userNFTs)}
                className="mt-2 ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Debug NFTs
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-300 mx-auto mb-4"></div>
                <p className="text-amber-100">Loading your Hunganz...</p>
              </div>
            ) : userNFTs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-amber-100 mb-4">No Hunganz found. Acquire some packs to get started!</p>
                <p className="text-amber-300 text-sm">Your NFTs will appear here once you own some.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNFTs.map((nft) => (
                  <div key={nft.tokenId} className="bg-black bg-opacity-50 rounded-lg border border-amber-600 overflow-hidden hover:border-amber-400 transition-colors">
                    {/* NFT Image */}
                    <div className="aspect-square">
                      <NFTImage
                        uri={nft.uri}
                        name={nft.name}
                        evolution={nft.evolution}
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* NFT Details */}
                    <div className="p-4">
                      <h3 className="text-amber-300 font-bold text-lg mb-2">{nft.name}</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-amber-100">
                          <span className="text-amber-300">Level:</span> {nft.level}
                        </div>
                        <div className="text-amber-100">
                          <span className="text-amber-300">Evolution:</span> {nft.evolution}
                        </div>
                        <div className="text-amber-100">
                          <span className="text-amber-300">Experience:</span> {nft.experience}
                        </div>
                        <div className="text-amber-100">
                          <span className="text-amber-300">Rarity:</span> {nft.rarity}
                        </div>
                      </div>
                      
                      {nft.isDead && (
                        <div className="mt-2 bg-red-900 bg-opacity-50 text-red-300 px-2 py-1 rounded text-xs text-center">
                          💀 RIP
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-amber-400">
                        Token ID: #{nft.tokenId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
