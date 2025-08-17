'use client';

import React from 'react';
import WalletInterface from '@/components/WalletInterface';
import { Toaster } from 'sonner';

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🦍 Hunganz Wallet Interface
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Connect your MetaMask wallet to interact with the Hunganz gaming NFT ecosystem. 
            Manage your Banane tokens and Hunga NFTs with ease.
          </p>
        </div>

        <div className="flex justify-center">
          <WalletInterface />
        </div>

        <div className="mt-12 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              🎮 What You Can Do With Your Connected Wallet
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-amber-300 font-bold mb-2">🍌 Banane Tokens</h3>
                <p className="text-slate-300 text-sm">
                  Earn and spend Banane tokens for evolution upgrades, fetch missions, and special abilities.
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-green-300 font-bold mb-2">🦍 Hunga NFTs</h3>
                <p className="text-slate-300 text-sm">
                  Mint, evolve, and trade your unique Hunga Apes. Each one has distinct elemental powers and traits.
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-blue-300 font-bold mb-2">🎯 Fetch Missions</h3>
                <p className="text-slate-300 text-sm">
                  Send your Hungas on adventures using Flow's randomness beacon for unpredictable rewards.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-amber-300 font-bold mb-2">⚡ Supported Networks</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-amber-600/20 text-amber-200 px-3 py-1 rounded-full text-sm">
                Flow Mainnet (747)
              </span>
              <span className="bg-amber-600/20 text-amber-200 px-3 py-1 rounded-full text-sm">
                Flow Testnet (545)
              </span>
              <span className="bg-slate-600/20 text-slate-200 px-3 py-1 rounded-full text-sm">
                Ethereum Networks
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
