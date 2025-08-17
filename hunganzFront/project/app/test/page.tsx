'use client';

import React, { useState } from 'react';

export default function TestPage() {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`You typed: ${input}`);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
        <p className="mb-4">This page tests basic functionality without the wallet context.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something here..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Submit
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-600 rounded">
            {message}
          </div>
        )}
        
        <div className="mt-8 text-sm text-slate-400">
          <p>If this input works but the main page doesn't, there's likely an issue with the WalletProvider.</p>
        </div>
      </div>
    </div>
  );
}
