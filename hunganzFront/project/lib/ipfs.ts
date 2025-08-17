// IPFS utility functions for handling NFT artwork

/**
 * Convert IPFS URI to HTTP URL using public gateways
 * @param ipfsUri - IPFS URI (ipfs://hash or ipfs://hash/path)
 * @returns HTTP URL for accessing the content
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri) return '';
  
  // If it's already an HTTP URL, return as is
  if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
    return ipfsUri;
  }
  
  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  
  // Handle raw IPFS hash
  if (ipfsUri.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44}/) || ipfsUri.match(/^ba[A-Za-z2-7]{56}/)) {
    return `https://ipfs.io/ipfs/${ipfsUri}`;
  }
  
  return ipfsUri;
}

/**
 * Get multiple gateway URLs for better reliability
 * @param ipfsUri - IPFS URI
 * @returns Array of HTTP URLs using different gateways
 */
export function getIpfsGateways(ipfsUri: string): string[] {
  if (!ipfsUri) return [];
  
  const hash = ipfsUri.replace('ipfs://', '');
  
  return [
    `https://ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
  ];
}

/**
 * Fetch JSON metadata from IPFS
 * @param ipfsUri - IPFS URI pointing to JSON metadata
 * @returns Parsed JSON object or null if failed
 */
export async function fetchIpfsJson(ipfsUri: string): Promise<any> {
  const gateways = getIpfsGateways(ipfsUri);
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${gateway}:`, error);
      continue;
    }
  }
  
  console.error('Failed to fetch IPFS JSON from all gateways');
  return null;
}

/**
 * Get the best available image URL from NFT metadata
 * @param metadata - NFT metadata object
 * @returns Image URL or placeholder
 */
export function getImageUrl(metadata: any): string {
  if (!metadata) return '/placeholder-nft.png';
  
  // Try different possible image fields
  const imageFields = ['image', 'image_url', 'imageUrl', 'picture', 'avatar'];
  
  for (const field of imageFields) {
    if (metadata[field]) {
      return ipfsToHttp(metadata[field]);
    }
  }
  
  return '/placeholder-nft.png';
}

/**
 * Preload an image to check if it's accessible
 * @param url - Image URL to preload
 * @returns Promise that resolves to true if image loads successfully
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
