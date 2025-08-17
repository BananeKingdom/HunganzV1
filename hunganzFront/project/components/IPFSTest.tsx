'use client';

import React, { useState } from 'react';
import { ipfsToHttp, getIpfsGateways, preloadImage } from '@/lib/ipfs';

export default function IPFSTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Test URIs from your successful deployment
  const testUris = [
    'ipfs://QmYourActualHashHere', // Replace with actual IPFS hash from deployment
    'ipfs://QmTestHash123', // Test hash
  ];

  const testIPFSLoading = async () => {
    setIsLoading(true);
    const results = [];

    for (const uri of testUris) {
      const result = {
        uri,
        httpUrl: ipfsToHttp(uri),
        gateways: getIpfsGateways(uri),
        loadResults: []
      };

      // Test each gateway
      for (const gateway of result.gateways) {
        try {
          const loaded = await preloadImage(gateway);
          result.loadResults.push({
            gateway,
            success: loaded,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          result.loadResults.push({
            gateway,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      results.push(result);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <h3 className="text-xl font-bold mb-4">🧪 IPFS Loading Test</h3>
      
      <button
        onClick={testIPFSLoading}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        {isLoading ? 'Testing...' : 'Test IPFS Loading'}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded">
              <h4 className="font-bold text-amber-300">Test {index + 1}</h4>
              <p className="text-sm text-gray-300">URI: {result.uri}</p>
              <p className="text-sm text-gray-300">HTTP: {result.httpUrl}</p>
              
              <div className="mt-2">
                <h5 className="font-semibold">Gateway Results:</h5>
                {result.loadResults.map((loadResult, i) => (
                  <div key={i} className={`text-sm p-2 rounded mt-1 ${loadResult.success ? 'bg-green-900' : 'bg-red-900'}`}>
                    <span className={loadResult.success ? 'text-green-300' : 'text-red-300'}>
                      {loadResult.success ? '✅' : '❌'} {loadResult.gateway}
                    </span>
                    {loadResult.error && (
                      <p className="text-red-400 text-xs mt-1">{loadResult.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
