'use client';

import React, { useState, useEffect } from 'react';

interface NFTImageProps {
  uri: string;
  name: string;
  evolution?: string;
  className?: string;
}

export default function NFTImage({ uri, name, evolution = '0', className = '' }: NFTImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [uri]);

  const loadImage = () => {
    if (!uri) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Convert IPFS URI to HTTP URL
    let httpUrl = uri;
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      httpUrl = `https://ipfs.io/ipfs/${hash}`;
    }

    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImageUrl(httpUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Try alternative gateways
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`,
        `https://cloudflare-ipfs.com/ipfs/${uri.replace('ipfs://', '')}`,
        `https://dweb.link/ipfs/${uri.replace('ipfs://', '')}`,
      ];
      
      tryGateways(gateways, 0);
    };
    img.src = httpUrl;
  };

  const tryGateways = (gateways: string[], index: number) => {
    if (index >= gateways.length) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageUrl(gateways[index]);
      setIsLoading(false);
    };
    img.onerror = () => {
      tryGateways(gateways, index + 1);
    };
    img.src = gateways[index];
  };

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gray-800 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-amber-300 animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1">
          {name || 'Unknown NFT'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={imageUrl}
        alt={name || 'NFT'}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1">
        {name || 'Unknown NFT'}
        {evolution && evolution !== '0' && (
          <span className="ml-2 text-amber-300">Evo {evolution}</span>
        )}
      </div>
    </div>
  );
}
