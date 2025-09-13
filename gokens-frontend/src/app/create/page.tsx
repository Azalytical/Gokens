// СОЗДАТЬ файл: gokens-frontend/src/app/create/page.tsx

"use client"

import React, { useState } from 'react';
import { Upload, Image, Gamepad2, Music, Diamond, Plus, Check, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function CreatePage() {
  const wallet = useWallet();
  const [nftType, setNftType] = useState('art');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    royalty: '10',
    supply: '1',
    collection: 'new'
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [properties, setProperties] = useState<{key: string; value: string}[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const updateProperty = (index: number, field: 'key' | 'value', value: string) => {
    const newProps = [...properties];
    newProps[index][field] = value;
    setProperties(newProps);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsCreating(true);
    
    // Симуляция процесса создания
    for (let i = 1; i <= 4; i++) {
      setCreationStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsCreating(false);
    alert(`Successfully created NFT: ${formData.name}`);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      royalty: '10',
      supply: '1',
      collection: 'new'
    });
    setUploadedImage(null);
    setProperties([]);
    setCreationStep(1);
  };

  const nftTypes = [
    { id: 'art', label: 'Art', icon: Image, color: 'from-purple-600 to-pink-600' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'from-blue-600 to-cyan-600' },
    { id: 'music', label: 'Music', icon: Music, color: 'from-green-600 to-teal-600' },
    { id: 'collectible', label: 'Collectible', icon: Diamond, color: 'from-yellow-600 to-orange-600' }
  ];

  const collections = [
    { id: 'new', name: 'Create New Collection' },
    { id: 'genesis', name: 'Gokens Genesis' },
    { id: 'art-masters', name: 'Art Masters' },
    { id: 'game-legends', name: 'Game Legends' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Create Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NFT</span>
            </h1>
            <p className="text-gray-400">
              Mint your digital masterpiece on Solana blockchain
            </p>
          </div>

          {!wallet.connected ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-purple-500/20">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">You need to connect your wallet to create NFTs</p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600" />
              </div>
            </div>
          ) : (
            <>
              {/* NFT Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-4">Select NFT Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {nftTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setNftType(type.id)}
                        className={`p-4 rounded-xl border-2 transition ${
                          nftType === type.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Upload */}
                <div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <label className="block text-sm font-semibold mb-4">Upload File</label>
                    
                    {uploadedImage ? (
                      <div className="relative">
                        <img src={uploadedImage} alt="Preview" className="w-full rounded-lg" />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-4 right-4 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-purple-500 transition">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                          <p className="text-gray-400 mb-2">Drop your file here or browse</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4, MP3 up to 100MB</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*,video/*,audio/*" />
                      </label>
                    )}
                  </div>

                  {/* Properties */}
                  <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold">Properties</label>
                      <button
                        onClick={addProperty}
                        className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {properties.map((prop, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Property"
                          value={prop.key}
                          onChange={(e) => updateProperty(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={prop.value}
                          onChange={(e) => updateProperty(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => removeProperty(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {properties.length === 0 && (
                      <p className="text-gray-500 text-sm">No properties added yet</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Name *</label>
                        <input
                          type="text"
                          placeholder="Enter NFT name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          placeholder="Describe your NFT..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Collection</label>
                        <select
                          value={formData.collection}
                          onChange={(e) => setFormData({...formData, collection: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {collections.map(col => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Price (SOL) *</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Supply</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={formData.supply}
                            onChange={(e) => setFormData({...formData, supply: e.target.value})}
                            min="1"
                            className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Royalty (%)</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={formData.royalty}
                          onChange={(e) => setFormData({...formData, royalty: e.target.value})}
                          min="0"
                          max="50"
                          className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Earn a percentage from secondary sales</p>
                      </div>
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreate}
                    disabled={!formData.name || !formData.price || !uploadedImage || isCreating}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                  >
                    {isCreating ? 'Creating NFT...' : 'Create NFT'}
                  </button>

                  {/* Creation Progress */}
                  {isCreating && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                      <h3 className="font-semibold mb-4">Creating Your NFT</h3>
                      <div className="space-y-3">
                        {['Uploading to IPFS', 'Creating metadata', 'Minting on Solana', 'Finalizing'].map((step, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              creationStep > index 
                                ? 'bg-green-500' 
                                : creationStep === index + 1
                                ? 'bg-purple-500 animate-pulse'
                                : 'bg-gray-700'
                            }`}>
                              {creationStep > index ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            <span className={creationStep > index ? 'text-green-400' : ''}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fee Info */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Listing fee</span>
                      <span>0.01 SOL</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Platform fee</span>
                      <span>2.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}