"use client";

import React, { useState, useEffect, useRef } from 'react';
import CommandView from '@/components/CommandView';
import TypewriterView from '@/components/TypewriterView';
import WalletInterface from '@/components/WalletInterface';
import PackOpening from '@/components/PackOpening';
import HungaCollection from '@/components/HungaCollection';
import { useWallet } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';

export default function Home() {
  const [showTextbox, setShowTextbox] = useState(false);
  const [input, setInput] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [loremText, setLoremText] = useState('');
  const [shake, setShake] = useState(false);
  const [redBlink, setRedBlink] = useState(false);
  const [hasEnteredHunga, setHasEnteredHunga] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({
    ctrl: false,
    shift: false,
    h: false
  });
  const [currentView, setCurrentView] = useState('');
  const [selectedHungaId, setSelectedHungaId] = useState('');
  const [showNFTInterface, setShowNFTInterface] = useState(false);
  const [showPackOpening, setShowPackOpening] = useState(false);
  
  // Wallet and contract hooks
  const { wallet } = useWallet();
  const { contracts, bananeBalance, hunganzBalance, isLoading, contractAddresses } = useContracts();

  const hungaLore = `Deep in the primordial Flow blockchain, where ancient code meets evolutionary magic, dwell the legendary Hunga Apes – mystical creatures born from the fusion of nature's wisdom and digital innovation.

These aren't ordinary apes. Each Hunga possesses unique elemental powers: FireBob burns with volcanic passion, PlantJimmy channels the forest's growth energy, and WaterNolan flows with oceanic wisdom. Through their adventures and battles, they evolve, growing stronger and unlocking new abilities.

The Hunga Apes discovered the sacred Banane tokens – golden fruits of power that fuel their transformations and adventures. When Hungas venture on fetch missions into the digital wilderness, they risk everything for the chance to find rare treasures and evolve into legendary forms.

But beware – the jungle is full of mysteries. Each pack you open, each fetch you send, each evolution you witness is guided by Flow's ancient randomness beacon, ensuring that no two Hunga journeys are ever the same.

Welcome to the Hunganz ecosystem – where ape legends are born, adventures never end, and every Banane token tells a story of courage and evolution.`;

  // Load lorem ipsum text
  useEffect(() => {
    setLoremText(hungaLore);
  }, []);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Update pressed keys state
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        h: event.code === 'KeyH'
      }));

      if (event.ctrlKey && event.shiftKey && event.code === 'KeyH') {
        event.preventDefault();
        setShowTextbox(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Update pressed keys state on key release
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        h: event.code === 'KeyH' ? false : prev.h
      }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = input.toLowerCase().trim();
    console.log('Command entered:', command);
    
    if (command === 'hunga' || command === '/hunga') {
      console.log('Hunga command matched! Setting lore view');
      setHasEnteredHunga(true);
      setCurrentView('lore');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/help') {
      setCurrentView('help');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/connect') {
      setCurrentView('connect');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/wallet') {
      setCurrentView('wallet');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/bnnfi') {
      setCurrentView('bnnfi');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/catch') {
      setCurrentView('catch');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/myhgnz') {
      setCurrentView('myhgnz');
      setShowTypewriter(true);
      setInput('');
    } else if (command.startsWith('/fetch --id ')) {
      const hungaId = command.replace('/fetch --id ', '');
      setCurrentView('fetch');
      setSelectedHungaId(hungaId);
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/oldtiger') {
      setCurrentView('oldtiger');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/trade') {
      setCurrentView('trade');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/bnnfi') {
      setCurrentView('bnnfi');
      setShowTypewriter(true);
      setInput('');
    } else if (command === '/roadmap') {
      setCurrentView('roadmap');
      setShowTypewriter(true);
      setInput('');
    } else {
      setShake(true);
      setRedBlink(true);
      setTimeout(() => {
        setShake(false);
        setRedBlink(false);
      }, 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const resetInterface = () => {
    setShowTextbox(false);
    setShowTypewriter(false);
    setHasEnteredHunga(false);
    setCurrentView('');
    setSelectedHungaId('');
    setInput('');
  };

  const closeNFTInterface = () => {
    setShowNFTInterface(false);
  };

  const renderCommandView = () => {
    switch (currentView) {
      case 'help':
        return (
          <div className="space-y-4">
            <p className="text-green-400 mb-2">📋 Available Commands:</p>
            <div className="space-y-1 text-sm">
              <p><span className="text-amber-300">/hunga</span> - Enter the Hunganz world</p>
              <p><span className="text-amber-300">/help</span> - Show this help menu</p>
              <p><span className="text-amber-300">/connect</span> - Connect to Flow blockchain</p>
              <p><span className="text-amber-300">/wallet</span> - Open MetaMask wallet interface</p>
              <p><span className="text-amber-300">/bnnfi</span> - Check your Banane token balance</p>
              <p><span className="text-amber-300">/catch</span> - View available Hungas to catch</p>
              <p><span className="text-amber-300">/myhgnz</span> - View your Hunga collection</p>
              <p><span className="text-amber-300">/fetch --id [ID]</span> - Send Hunga on fetch mission</p>
              <p><span className="text-amber-300">/roadmap</span> - View development roadmap</p>
            </div>
            <div className="mt-4 p-4 bg-green-900 bg-opacity-50 rounded border border-green-600">
              <p className="text-green-200 text-sm">
                <strong>🚀 Live on Flow Mainnet!</strong><br/>
                Your Hunganz NFTs are deployed and ready for gaming.
              </p>
            </div>
          </div>
        );
      
      case 'connect':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🔗 Connect Wallet</h3>
            <p className="text-amber-100">Connect your MetaMask wallet to access the Hunganz ecosystem on Flow mainnet.</p>
            <div className="p-4 bg-blue-900 bg-opacity-50 rounded border border-blue-600">
              <p className="text-blue-200 text-sm">
                <strong>Network:</strong> Flow EVM Mainnet<br/>
                <strong>Chain ID:</strong> 747<br/>
                <strong>RPC:</strong> https://mainnet.evm.nodes.onflow.org
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
              <WalletInterface />
            </div>
          </div>
        );
      
      case 'catch':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🎒 Catch a Hunga</h3>
            <p className="text-amber-100">Acquire a new random Hunga pack using the commit-reveal mechanism powered by Flow's randomness beacon.</p>
            {!wallet.isConnected ? (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-red-300 mb-4">Please connect your wallet to catch Hungas.</p>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <WalletInterface />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-purple-900 bg-opacity-50 rounded border border-purple-600">
                  <p className="text-purple-200 text-sm">
                    <strong>Pack Cost:</strong> 100 BANANE tokens<br/>
                    <strong>Contains:</strong> 1 Random Hunga Ape<br/>
                    <strong>Rarities:</strong> Common, Rare, Epic, Legendary<br/>
                    <strong>Your Balance:</strong> {bananeBalance} BANANE
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-green-300 text-sm font-bold">FireBob</div>
                    <div className="text-green-400 text-xs">Fire Element</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🌱</div>
                    <div className="text-green-300 text-sm font-bold">PlantJimmy</div>
                    <div className="text-green-400 text-xs">Plant Element</div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="text-blue-300 text-sm font-bold">WaterNolan</div>
                    <div className="text-blue-400 text-xs">Water Element</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Show pack opening animation
                    setShowPackOpening(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg w-full"
                  disabled={parseFloat(bananeBalance) < 100}
                >
                  {parseFloat(bananeBalance) < 100 ? 'Insufficient BANANE' : 'Open Hunga Pack (100 BANANE)'}
                </button>
              </div>
            )}
          </div>
        );
      
      case 'myhgnz':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🦍 My Hunganz</h3>
            <p className="text-amber-100">View and manage your Hunga Ape collection.</p>
            {!wallet.isConnected ? (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-red-300 mb-4">Please connect your wallet to view your Hunganz collection.</p>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <WalletInterface />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-green-300 font-bold">Your Collection</h4>
                    <div className="text-green-400 text-sm">
                      {hunganzBalance} NFTs owned
                    </div>
                  </div>
                  
                  {parseInt(hunganzBalance) === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">😭</div>
                      <p className="text-slate-400 mb-4">No Hungas in your collection yet!</p>
                      <p className="text-slate-500 text-sm">Use /catch to mint your first Hunga Ape</p>
                    </div>
                  ) : (
                    <HungaCollection 
                      wallet={wallet} 
                      contracts={contracts} 
                      hunganzBalance={hunganzBalance}
                      contractAddresses={contractAddresses}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'fetch':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🏃‍♂️ Fetch Mission</h3>
            <p className="text-amber-100">Send Hunga #{selectedHungaId} on a fetch mission to find treasures and gain experience.</p>
            <div className="p-4 bg-orange-900 bg-opacity-50 rounded border border-orange-600">
              <p className="text-orange-200 text-sm">
                <strong>Mission Duration:</strong> 24 hours<br/>
                <strong>Rewards:</strong> Experience, Banane tokens, rare items<br/>
                <strong>Risk:</strong> Low to Medium
              </p>
            </div>
            <button
              onClick={() => alert(`Fetch mission for Hunga #${selectedHungaId} coming soon!`)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
            >
              Start Fetch Mission
            </button>
          </div>
        );
      
      case 'oldtiger':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🐅 Old Tiger's Tales</h3>
            <p className="text-amber-100">Listen to the wise Old Tiger share the highlights of the day in the Hunganz jungle.</p>
            <div className="p-4 bg-yellow-900 bg-opacity-50 rounded border border-yellow-600">
              <p className="text-yellow-200 text-sm">
                <strong>🚧 Coming Soon!</strong><br/>
                The Old Tiger is preparing his daily wisdom. Check back soon for jungle insights and community highlights.
              </p>
            </div>
          </div>
        );
      
      case 'trade':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🏪 Hunga Marketplace</h3>
            <p className="text-amber-100">Trade your Hunganz with other players in the decentralized marketplace.</p>
            <div className="p-4 bg-indigo-900 bg-opacity-50 rounded border border-indigo-600">
              <p className="text-indigo-200 text-sm">
                <strong>🚧 Coming Soon!</strong><br/>
                The marketplace is under construction. Soon you'll be able to trade, sell, and auction your Hunganz.
              </p>
            </div>
          </div>
        );
      

      
      case 'roadmap':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🗺️ Hunganz Roadmap</h3>
            <div className="space-y-3 text-amber-100">
              <div className="p-3 bg-green-900 bg-opacity-50 rounded border border-green-600">
                <h4 className="text-green-300 font-bold">✅ Phase 1: Genesis (COMPLETED)</h4>
                <p className="text-sm">Smart contracts deployed on Flow mainnet, NFT minting system, basic gameplay mechanics</p>
              </div>
              <div className="p-3 bg-blue-900 bg-opacity-50 rounded border border-blue-600">
                <h4 className="text-blue-300 font-bold">🔄 Phase 2: Evolution (IN PROGRESS)</h4>
                <p className="text-sm">Advanced evolution system, fetch missions, experience and leveling</p>
              </div>
              <div className="p-3 bg-purple-900 bg-opacity-50 rounded border border-purple-600">
                <h4 className="text-purple-300 font-bold">🔮 Phase 3: Community (COMING)</h4>
                <p className="text-sm">Marketplace, trading, guilds, tournaments, Old Tiger's daily wisdom</p>
              </div>
              <div className="p-3 bg-orange-900 bg-opacity-50 rounded border border-orange-600">
                <h4 className="text-orange-300 font-bold">🚀 Phase 4: Expansion (FUTURE)</h4>
                <p className="text-sm">Cross-chain integration, mobile app, AR features, metaverse integration</p>
              </div>
            </div>
          </div>
        );
      
      case 'bnnfi':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🍌 Banane Finance</h3>
            {!wallet.isConnected ? (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-red-300 mb-4">Please connect your wallet to view your Banane balance.</p>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <WalletInterface />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-300 mb-2">
                      {isLoading ? '...' : bananeBalance} BANANE
                    </div>
                    <div className="text-amber-200 text-sm mb-4">
                      Your Banane Token Balance
                    </div>
                    <div className="text-xs text-amber-400">
                      Contract: {contractAddresses?.BANANE_V1 || 'Not available'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-green-300 font-bold mb-2">🍌 What are Banane Tokens?</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Banane tokens are the primary currency of the Hunganz ecosystem. Use them for:
                  </p>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Evolving your Hunga Apes to higher levels</li>
                    <li>• Sending Hungas on fetch missions for rewards</li>
                    <li>• Purchasing special abilities and upgrades</li>
                    <li>• Trading in the Hunganz marketplace</li>
                  </ul>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-bold mb-2">🏆 Your NFT Collection</h4>
                  <p className="text-blue-200 text-sm">
                    You own <span className="font-bold text-blue-300">{hunganzBalance}</span> Hunga NFTs
                  </p>
                  <p className="text-blue-400 text-xs mt-1">
                    Use /myhgnz to view your collection
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'wallet':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">💰 Wallet Interface</h3>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
              <WalletInterface />
            </div>
          </div>
        );
      
      case 'lore':
        return (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-xl font-bold mb-4">🦍 The Legend of Hunganz</h3>
            <TypewriterView text={loremText} speed={5} />
          </div>
        );
      
      default:
        return (
          <TypewriterView text={loremText} speed={5} />
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Animated Forest Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/forest.gif")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        
        <div className={showTextbox ? "opacity-0 pointer-events-none transition-opacity duration-1000" : "opacity-100 transition-opacity duration-1000"}>
          {/* Keyboard Keys */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.ctrl ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-1'}`}>
              ctrl
            </div>
            <span className="text-amber-100 text-2xl">+</span>
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.shift ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-2'}`}>
              shift
            </div>
            <span className="text-amber-100 text-2xl">+</span>
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.h ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-3'}`}>
              H
            </div>
          </div>
        </div>

        {/* Command View Overlay */}
        <div className={showTextbox ? "opacity-100 transition-opacity duration-1000" : "opacity-0 pointer-events-none transition-opacity duration-1000"}>
          <CommandView
            showTextbox={showTextbox}
            showTypewriter={showTypewriter}
            input={input}
            shake={shake}
            redBlink={redBlink}
            hasEnteredHunga={hasEnteredHunga}
            onInputChange={handleInputChange}
            onInputSubmit={handleInputSubmit}
            onClose={resetInterface}
          >
            {showTypewriter && renderCommandView()}
          </CommandView>
        </div>
      </div>
      
      {/* Pack Opening Modal */}
      <PackOpening 
        isOpen={showPackOpening}
        onClose={() => setShowPackOpening(false)}
        onPackOpened={(result) => {
          console.log('Pack opened! Revealed:', result);
          // Here you could integrate with your contract to actually mint the NFT
          // For now, just log the result
        }}
      />
    </div>
  );
}