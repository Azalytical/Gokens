// СОЗДАТЬ файл: gokens-frontend/src/app/stats/page.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown, Clock, Zap, Globe } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedChain, setSelectedChain] = useState('solana');
  
  // Анимированные числа
  const [animatedVolume, setAnimatedVolume] = useState(0);
  const [animatedUsers, setAnimatedUsers] = useState(0);
  const [animatedTransactions, setAnimatedTransactions] = useState(0);

  useEffect(() => {
    // Анимация чисел при загрузке
    const volumeInterval = setInterval(() => {
      setAnimatedVolume(prev => {
        if (prev < 32456) return prev + 1000;
        return 32456;
      });
    }, 50);

    const usersInterval = setInterval(() => {
      setAnimatedUsers(prev => {
        if (prev < 12543) return prev + 500;
        return 12543;
      });
    }, 50);

    const txInterval = setInterval(() => {
      setAnimatedTransactions(prev => {
        if (prev < 89234) return prev + 2000;
        return 89234;
      });
    }, 50);

    return () => {
      clearInterval(volumeInterval);
      clearInterval(usersInterval);
      clearInterval(txInterval);
    };
  }, []);

  // Статистика по времени
  const volumeData = {
    '24h': { volume: '1,234 SOL', change: '+12.5%', isPositive: true },
    '7d': { volume: '8,765 SOL', change: '+24.3%', isPositive: true },
    '30d': { volume: '32,456 SOL', change: '+45.7%', isPositive: true },
    'all': { volume: '125,789 SOL', change: '+156.2%', isPositive: true }
  };

  // Топ коллекции
  const topCollections = [
    { rank: 1, name: 'Gokens Genesis', volume: '5,432 SOL', change: '+12.5%', floor: '4.5 SOL', owners: 234, items: 1000 },
    { rank: 2, name: 'MetaQuest Items', volume: '3,221 SOL', change: '+8.2%', floor: '2.3 SOL', owners: 189, items: 500 },
    { rank: 3, name: 'Digital Masters', volume: '2,109 SOL', change: '-3.4%', floor: '6.7 SOL', owners: 156, items: 333 },
    { rank: 4, name: 'CryptoRealm Assets', volume: '1,876 SOL', change: '+18.9%', floor: '1.2 SOL', owners: 423, items: 2000 },
    { rank: 5, name: 'Neon Dreams Art', volume: '1,234 SOL', change: '+5.6%', floor: '3.4 SOL', owners: 98, items: 250 }
  ];

  // Активность по категориям
  const categoryStats = [
    { category: 'Art', volume: '15,234 SOL', transactions: 3456, growth: '+23%', color: 'from-purple-600 to-pink-600' },
    { category: 'Gaming', volume: '12,876 SOL', transactions: 5678, growth: '+45%', color: 'from-blue-600 to-cyan-600' },
    { category: 'Music', volume: '3,456 SOL', transactions: 890, growth: '+12%', color: 'from-green-600 to-teal-600' },
    { category: 'Collectibles', volume: '890 SOL', transactions: 210, growth: '+8%', color: 'from-yellow-600 to-orange-600' }
  ];

  // График активности (симуляция)
  const activityChart = [
    { time: '00:00', value: 45 },
    { time: '04:00', value: 30 },
    { time: '08:00', value: 65 },
    { time: '12:00', value: 85 },
    { time: '16:00', value: 75 },
    { time: '20:00', value: 90 },
    { time: '23:59', value: 70 }
  ];

  // Статистика блокчейна
  const blockchainStats = {
    blockHeight: '156,789,234',
    avgBlockTime: '0.4s',
    tps: '65,000',
    validators: '1,925',
    totalStaked: '423M SOL',
    networkUptime: '99.99%'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Platform <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Statistics</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time analytics and insights for the Gokens ecosystem
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 inline-flex">
            {['24h', '7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className={`text-sm font-semibold ${volumeData[timeRange].isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {volumeData[timeRange].change}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{animatedVolume.toLocaleString()} SOL</p>
            <p className="text-sm text-gray-400">Total Volume</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-sm font-semibold text-green-400">+15.3%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{animatedUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Active Users</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-sm font-semibold text-green-400">+28.7%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{animatedTransactions.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Transactions</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-pink-400" />
              <span className="text-sm font-semibold text-green-400">+8.2%</span>
            </div>
            <p className="text-3xl font-bold mb-1">50,234</p>
            <p className="text-sm text-gray-400">NFTs Created</p>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 mb-8">
          <h2 className="text-xl font-bold mb-6">24h Activity</h2>
          <div className="h-64 flex items-end justify-between">
            {activityChart.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full mx-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${point.value}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">{point.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Collections */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold mb-6">Top Collections</h2>
            <div className="space-y-4">
              {topCollections.map((collection) => (
                <div key={collection.rank} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-500">#{collection.rank}</span>
                    <div>
                      <p className="font-semibold">{collection.name}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span>Floor: {collection.floor}</span>
                        <span>Owners: {collection.owners}</span>
                        <span>Items: {collection.items}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{collection.volume}</p>
                    <p className={`text-sm ${collection.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {collection.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold mb-6">Category Performance</h2>
            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">{stat.category}</span>
                    <span className="text-sm text-green-400">{stat.growth}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Volume: {stat.volume}</span>
                    <span>TX: {stat.transactions}</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      style={{ width: `${parseInt(stat.growth)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blockchain Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 text-center">Solana Network Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.tps}</p>
              <p className="text-sm text-gray-400">TPS</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.avgBlockTime}</p>
              <p className="text-sm text-gray-400">Block Time</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.networkUptime}</p>
              <p className="text-sm text-gray-400">Uptime</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.validators}</p>
              <p className="text-sm text-gray-400">Validators</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.totalStaked}</p>
              <p className="text-sm text-gray-400">Staked</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold">{blockchainStats.blockHeight}</p>
              <p className="text-sm text-gray-400">Block Height</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'NFT Minted', item: 'Digital Sunrise #234', user: '@artist123', time: '2 min ago', icon: '🎨' },
              { action: 'Collection Created', item: 'Mystic Legends', user: '@creator456', time: '5 min ago', icon: '📦' },
              { action: 'Token Swap', item: '100 SOL → 10,025 USDC', user: '@trader789', time: '8 min ago', icon: '💱' },
              { action: 'NFT Sold', item: 'Legendary Sword', user: '@gamer101', time: '12 min ago', icon: '⚔️' },
              { action: 'Bid Placed', item: 'Abstract Reality', user: '@collector202', time: '15 min ago', icon: '💰' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="font-semibold">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.item} by {activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}