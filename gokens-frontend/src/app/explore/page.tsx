// СОЗДАТЬ файл: gokens-frontend/src/app/explore/page.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, DollarSign, Heart, Eye, ShoppingCart } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function ExplorePage() {
  const wallet = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [priceRange, setPriceRange] = useState('all');
  const [likedItems, setLikedItems] = useState<number[]>([]);

  // Расширенная коллекция NFT
  const allNFTs = [
    // Art NFTs
    { id: 1, name: "Digital Mona Lisa", category: "art", price: 4.89, artist: "@wzard", image: "https://picsum.photos/400/400?random=1", likes: 92, views: 1234, rarity: "Rare" },
    { id: 2, name: "Abstract Reality", category: "art", price: 3.21, artist: "@vzla", image: "https://picsum.photos/400/400?random=2", likes: 87, views: 987, rarity: "Common" },
    { id: 3, name: "Neon Dreams", category: "art", price: 5.67, artist: "@neon", image: "https://picsum.photos/400/400?random=3", likes: 134, views: 2341, rarity: "Epic" },
    { id: 4, name: "Cosmic Journey", category: "art", price: 8.99, artist: "@cosmos", image: "https://picsum.photos/400/400?random=7", likes: 256, views: 4567, rarity: "Legendary" },
    { id: 5, name: "Digital Sunset", category: "art", price: 2.45, artist: "@sunset", image: "https://picsum.photos/400/400?random=8", likes: 45, views: 567, rarity: "Common" },
    { id: 6, name: "Pixel Paradise", category: "art", price: 12.50, artist: "@pixel", image: "https://picsum.photos/400/400?random=9", likes: 389, views: 5678, rarity: "Mythic" },
    
    // Gaming NFTs
    { id: 10, name: "Legendary Sword", category: "gaming", price: 0.5, game: "MetaQuest", image: "https://picsum.photos/400/400?random=4", likes: 56, views: 789, rarity: "Legendary" },
    { id: 11, name: "Dragon Mount", category: "gaming", price: 2.3, game: "CryptoRealm", image: "https://picsum.photos/400/400?random=5", likes: 178, views: 2345, rarity: "Epic" },
    { id: 12, name: "Space Station", category: "gaming", price: 15.0, game: "StarVerse", image: "https://picsum.photos/400/400?random=6", likes: 445, views: 8901, rarity: "Mythic" },
    { id: 13, name: "Magic Potion", category: "gaming", price: 0.1, game: "WizardLand", image: "https://picsum.photos/400/400?random=10", likes: 23, views: 234, rarity: "Common" },
    { id: 14, name: "Golden Armor", category: "gaming", price: 7.5, game: "KnightSaga", image: "https://picsum.photos/400/400?random=11", likes: 298, views: 3456, rarity: "Legendary" },
    { id: 15, name: "Phoenix Pet", category: "gaming", price: 25.0, game: "PetWorld", image: "https://picsum.photos/400/400?random=12", likes: 567, views: 9999, rarity: "Mythic" },
    
    // Music NFTs
    { id: 20, name: "Beat Drop #1", category: "music", price: 1.5, artist: "@dj_crypto", image: "https://picsum.photos/400/400?random=13", likes: 89, views: 1234, rarity: "Rare" },
    { id: 21, name: "Symphony of Sol", category: "music", price: 3.0, artist: "@classical", image: "https://picsum.photos/400/400?random=14", likes: 145, views: 2345, rarity: "Epic" },
    
    // Collectibles
    { id: 30, name: "Rare Stamp #001", category: "collectibles", price: 0.8, artist: "@collector", image: "https://picsum.photos/400/400?random=15", likes: 34, views: 456, rarity: "Rare" },
    { id: 31, name: "Vintage Card", category: "collectibles", price: 5.0, artist: "@cards", image: "https://picsum.photos/400/400?random=16", likes: 267, views: 3456, rarity: "Legendary" }
  ];

  // Фильтрация и сортировка
  const filteredNFTs = allNFTs
    .filter(nft => {
      if (selectedCategory !== 'all' && nft.category !== selectedCategory) return false;
      if (searchQuery && !nft.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (priceRange === 'low' && nft.price > 1) return false;
      if (priceRange === 'medium' && (nft.price < 1 || nft.price > 10)) return false;
      if (priceRange === 'high' && nft.price < 10) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return b.likes - a.likes; // trending by default
    });

  const handleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBuy = (nft: any) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }
    alert(`Purchasing ${nft.name} for ${nft.price} SOL`);
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      case 'Mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NFT Marketplace</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover, collect, and trade extraordinary NFTs from top artists and games
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-purple-500/20">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search NFTs, collections, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="art">🎨 Art</option>
              <option value="gaming">🎮 Gaming</option>
              <option value="music">🎵 Music</option>
              <option value="collectibles">💎 Collectibles</option>
            </select>

            {/* Sort By */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="trending">🔥 Trending</option>
              <option value="popular">❤️ Most Liked</option>
              <option value="views">👁 Most Viewed</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💸 Price: High to Low</option>
            </select>

            {/* Price Range */}
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Any Price</option>
              <option value="low">Under 1 SOL</option>
              <option value="medium">1 - 10 SOL</option>
              <option value="high">Over 10 SOL</option>
            </select>
          </div>

          {/* Active Filters */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-400">Found {filteredNFTs.length} NFTs</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-purple-600/20 rounded-full text-sm">
                Search: {searchQuery}
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="px-3 py-1 bg-purple-600/20 rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <div key={nft.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="relative">
                <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover" />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-bold ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </span>
                <button
                  onClick={() => handleLike(nft.id)}
                  className={`absolute top-4 left-4 p-2 rounded-lg ${
                    likedItems.includes(nft.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-900/50 text-gray-400 hover:text-white'
                  } transition`}
                >
                  <Heart className={`w-5 h-5 ${likedItems.includes(nft.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{nft.name}</h3>
                <p className="text-gray-400 text-sm mb-3">
                  {nft.category === 'gaming' ? `Game: ${(nft as any).game}` : `By ${(nft as any).artist}`}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {nft.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {nft.views}
                  </span>
                </div>

                {/* Price and Buy */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-bold text-lg">{nft.price} SOL</p>
                  </div>
                  <button 
                    onClick={() => handleBuy(nft)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {filteredNFTs.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              Load More NFTs
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredNFTs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No NFTs found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange('all');
              }}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}