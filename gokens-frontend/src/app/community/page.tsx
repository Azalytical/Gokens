// СОЗДАТЬ файл: gokens-frontend/src/app/community/page.tsx

"use client"

import React, { useState } from 'react';
import { Users, MessageCircle, Trophy, Calendar, Star, TrendingUp, Award, Zap, Heart, Share2, Bookmark } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';

export default function CommunityPage() {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState('feed');
  const [postContent, setPostContent] = useState('');

  // Демо данные для ленты
  const communityPosts = [
    {
      id: 1,
      author: '@cryptoartist',
      avatar: 'https://picsum.photos/50/50?random=1',
      content: 'Just minted my new collection on Gokens! Check it out 🚀',
      image: 'https://picsum.photos/600/400?random=20',
      likes: 234,
      comments: 45,
      shares: 12,
      time: '2 hours ago'
    },
    {
      id: 2,
      author: '@gamerwizard',
      avatar: 'https://picsum.photos/50/50?random=2',
      content: 'Legendary sword just dropped in MetaQuest! Limited edition, only 100 available.',
      likes: 567,
      comments: 89,
      shares: 34,
      time: '5 hours ago'
    },
    {
      id: 3,
      author: '@solanadev',
      avatar: 'https://picsum.photos/50/50?random=3',
      content: 'New Jupiter integration is live! Swap tokens directly on Gokens platform 💱',
      likes: 890,
      comments: 123,
      shares: 67,
      time: '1 day ago'
    }
  ];

  // Топ коллекционеры
  const topCollectors = [
    { rank: 1, name: '@whale.sol', nfts: 1234, volume: '5,432 SOL', badge: '🏆' },
    { rank: 2, name: '@artlover', nfts: 897, volume: '3,221 SOL', badge: '🥈' },
    { rank: 3, name: '@gamer123', nfts: 654, volume: '2,109 SOL', badge: '🥉' },
    { rank: 4, name: '@cryptoqueen', nfts: 432, volume: '1,876 SOL', badge: '⭐' },
    { rank: 5, name: '@nftmaster', nfts: 321, volume: '1,234 SOL', badge: '⭐' }
  ];

  // Предстоящие события
  const upcomingEvents = [
    {
      id: 1,
      title: 'Art Masters Drop',
      date: 'Dec 15, 2024',
      time: '3:00 PM UTC',
      type: 'drop',
      participants: 234
    },
    {
      id: 2,
      title: 'Gaming NFT Tournament',
      date: 'Dec 18, 2024',
      time: '6:00 PM UTC',
      type: 'tournament',
      participants: 567
    },
    {
      id: 3,
      title: 'Community AMA',
      date: 'Dec 20, 2024',
      time: '4:00 PM UTC',
      type: 'ama',
      participants: 890
    }
  ];

  // Топ проекты
  const trendingProjects = [
    {
      id: 1,
      name: 'Gokens Genesis',
      image: 'https://picsum.photos/100/100?random=30',
      floor: '4.5 SOL',
      volume24h: '234 SOL',
      change: '+12.5%'
    },
    {
      id: 2,
      name: 'MetaQuest Items',
      image: 'https://picsum.photos/100/100?random=31',
      floor: '2.3 SOL',
      volume24h: '178 SOL',
      change: '+8.2%'
    },
    {
      id: 3,
      name: 'Digital Masters',
      image: 'https://picsum.photos/100/100?random=32',
      floor: '6.7 SOL',
      volume24h: '456 SOL',
      change: '+24.7%'
    }
  ];

  const handlePost = () => {
    if (!wallet.connected) {
      alert('Please connect your wallet to post!');
      return;
    }
    if (postContent.trim()) {
      alert(`Posted: ${postContent}`);
      setPostContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Community</span> Hub
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect with creators, collectors, and gamers in the Gokens ecosystem
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <p className="text-2xl font-bold">12,543</p>
            <p className="text-sm text-gray-400">Active Members</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-green-400">+25%</span>
            </div>
            <p className="text-2xl font-bold">89,234</p>
            <p className="text-sm text-gray-400">Total Posts</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-green-400">+8%</span>
            </div>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-gray-400">Top Creators</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-green-400">+15%</span>
            </div>
            <p className="text-2xl font-bold">567</p>
            <p className="text-sm text-gray-400">Collections</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-800">
          {['feed', 'collectors', 'events', 'trending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 capitalize transition ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Create Post */}
                {wallet.connected && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your thoughts with the community..."
                      className="w-full px-4 py-3 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                          📷
                        </button>
                        <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                          🎨
                        </button>
                        <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                          🔗
                        </button>
                      </div>
                      <button
                        onClick={handlePost}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                {communityPosts.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-start space-x-3 mb-4">
                      <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{post.author}</span>
                          <span className="text-gray-500 text-sm">{post.time}</span>
                        </div>
                        <p className="mt-2">{post.content}</p>
                        {post.image && (
                          <img src={post.image} alt="Post" className="mt-4 rounded-lg w-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-700">
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition">
                        <Heart className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition">
                        <Share2 className="w-5 h-5" />
                        <span>{post.shares}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition ml-auto">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'collectors' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold mb-6">Top Collectors</h2>
                <div className="space-y-4">
                  {topCollectors.map((collector) => (
                    <div key={collector.rank} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{collector.badge}</span>
                        <div>
                          <p className="font-semibold">{collector.name}</p>
                          <p className="text-sm text-gray-400">{collector.nfts} NFTs owned</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{collector.volume}</p>
                        <p className="text-sm text-gray-400">Total Volume</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </span>
                          <span>{event.time}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        event.type === 'drop' ? 'bg-purple-600' :
                        event.type === 'tournament' ? 'bg-blue-600' :
                        'bg-green-600'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{event.participants} participants</span>
                      <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                        Join Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trending' && (
              <div className="space-y-4">
                {trendingProjects.map((project) => (
                  <div key={project.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center space-x-4">
                      <img src={project.image} alt={project.name} className="w-16 h-16 rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{project.name}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-gray-400">Floor: <span className="text-white font-semibold">{project.floor}</span></span>
                          <span className="text-gray-400">24h Vol: <span className="text-white font-semibold">{project.volume24h}</span></span>
                          <span className={`font-semibold ${project.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {project.change}
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Discord */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-bold mb-3">Join our Discord</h3>
              <p className="text-sm text-gray-400 mb-4">Connect with 10,000+ members</p>
              <button className="w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                Join Discord
              </button>
            </div>

            {/* Trending Tags */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="font-bold mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['#art', '#gaming', '#solana', '#nft', '#defi', '#metaverse', '#web3'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-purple-600/20 rounded-full text-sm hover:bg-purple-600/30 transition cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                  <Award className="w-4 h-4" />
                  <span>Leaderboard</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                  <Zap className="w-4 h-4" />
                  <span>Rewards Program</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}