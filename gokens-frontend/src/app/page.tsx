"use client"

"use client"

// Скрываем ошибки кошелька для демо
if (typeof window !== 'undefined') {
  const orig = console.error;
  console.error = function(...args) {
    if (args[0]?.toString().includes('WalletNotReadyError')) return;
    orig.apply(console, args);
  };
}

import React, { useState, useEffect, useMemo, useCallback, FC } from 'react';
import { Wallet, TrendingUp, Users, Image, Gamepad2, ChevronRight, Sparkles, BarChart3, Shield, Zap, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { 
  ConnectionProvider, 
  WalletProvider, 
  useConnection,
  useWallet,
  useAnchorWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  LAMPORTS_PER_SOL, 
  Transaction, 
  SystemProgram,
  ConfirmOptions 
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import JupiterSwap from '@/components/JupiterSwap';
import SafeWalletButton from '../components/SafeWalletButton';

// Импортируем стили для wallet-adapter
import '@solana/wallet-adapter-react-ui/styles.css';


// Constants
const PROGRAM_ID = new PublicKey('FeLQB1uPtHA7wfq2m1uBHxd4SL8G5H37S9LbTEh5DmRh');
const NETWORK = 'devnet'; // Используем devnet для тестирования

// IDL для вашей программы
const IDL = {
  version: "0.1.0",
  name: "gokens_contracts",
  instructions: [
    {
      name: "createArtCollection",
      accounts: [
        { name: "collection", isMut: true, isSigner: true },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "uri", type: "string" }
      ]
    },
    {
      name: "mintArtNft",
      accounts: [
        { name: "nft", isMut: true, isSigner: true },
        { name: "collection", isMut: true, isSigner: false },
        { name: "mint", isMut: false, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "uri", type: "string" },
        { name: "price", type: "u64" },
        { name: "royaltyPercentage", type: "u8" }
      ]
    }
  ]
};

// Компонент статуса кошелька
const WalletStatus: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (wallet.publicKey && mounted) {
      connection.getBalance(wallet.publicKey).then(bal => {
        setBalance(bal / LAMPORTS_PER_SOL);
      }).catch(err => {
        console.error('Error fetching balance:', err);
      });
    }
  }, [wallet.publicKey, connection, mounted]);

  if (!mounted) return null;

  if (!wallet.connected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <span>Wallet not connected</span>
        </div>
        <SafeWalletButton />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {balance !== null && (
        <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="font-bold ml-1">{balance.toFixed(4)} SOL</span>
          </span>
        </div>
      )}
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700" />
    </div>
  );
};

// Основной компонент маркетплейса
function GokensMarketplace() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [activeTab, setActiveTab] = useState('art');
  const [currentBid, setCurrentBid] = useState(0.99);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [collections, setCollections] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Получаем программу с правильной обработкой
  const program = useMemo(() => {
    if (anchorWallet && connection) {
      try {
        const provider = new AnchorProvider(
          connection,
          anchorWallet,
          { 
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
          } as ConfirmOptions
        );
        return new Program(IDL as any, PROGRAM_ID, provider);
      } catch (err) {
        console.error('Error creating program:', err);
        return null;
      }
    }
    return null;
  }, [connection, anchorWallet]);

  // Симуляция изменения ставки
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBid(prev => prev + Math.random() * 0.1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Функция для показа статуса транзакции
  const showTxStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setTxStatus({ type, message });
    setTimeout(() => {
      setTxStatus({ type: null, message: '' });
    }, 5000);
  };

  // Создание коллекции с улучшенной обработкой ошибок
  const createCollection = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      showTxStatus('error', 'Please connect your Phantom wallet first');
      return;
    }

    try {
      setLoading(true);
      showTxStatus('info', 'Creating collection... Please approve transaction in Phantom');

      const collection = web3.Keypair.generate();
      
      const tx = await program.methods
        .createArtCollection(
          "Gokens Genesis Collection",
          "GOKENS",
          "https://gokens.art/collection.json"
        )
        .accounts({
          collection: collection.publicKey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([collection])
        .rpc();

      showTxStatus('success', `Collection created! TX: ${tx.substring(0, 8)}...`);
      console.log("Collection created:", tx);
      
      setCollections(prev => [...prev, {
        pubkey: collection.publicKey.toString(),
        name: "Gokens Genesis Collection",
        symbol: "GOKENS"
      }]);
    } catch (error: any) {
      console.error("Error creating collection:", error);
      
      // Детальная обработка ошибок
      if (error.message?.includes('User rejected')) {
        showTxStatus('error', 'Transaction cancelled by user');
      } else if (error.message?.includes('insufficient')) {
        showTxStatus('error', 'Insufficient SOL balance. Get free SOL from faucet');
      } else if (error.message?.includes('Network')) {
        showTxStatus('error', 'Network error. Please check your connection');
      } else {
        showTxStatus('error', `Error: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  // Минт NFT с улучшенной обработкой
  const mintNFT = useCallback(async (artName: string, price: number) => {
    if (!program || !wallet.publicKey) {
      showTxStatus('error', 'Please connect your Phantom wallet first');
      return;
    }

    try {
      setLoading(true);
      showTxStatus('info', `Minting ${artName}... Please approve in Phantom`);

      if (collections.length === 0) {
        await createCollection();
      }

      const nft = web3.Keypair.generate();
      const mint = web3.Keypair.generate();
      
      const tx = await program.methods
        .mintArtNft(
          artName,
          "A unique digital artwork",
          "https://gokens.art/nft.json",
          new BN(price * LAMPORTS_PER_SOL),
          10
        )
        .accounts({
          nft: nft.publicKey,
          collection: new PublicKey(collections[0]?.pubkey || SystemProgram.programId),
          mint: mint.publicKey,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        })
        .signers([nft])
        .rpc();

      showTxStatus('success', `NFT Minted! TX: ${tx.substring(0, 8)}...`);
      console.log("NFT minted:", tx);
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      if (error.message?.includes('User rejected')) {
        showTxStatus('error', 'Transaction cancelled by user');
      } else {
        showTxStatus('error', `Error: ${error.message || 'Failed to mint NFT'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, collections, createCollection]);

  // Тестовая транзакция
  const sendTransaction = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      showTxStatus('error', 'Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      showTxStatus('info', 'Sending test transaction...');

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 0.001 * LAMPORTS_PER_SOL,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      showTxStatus('success', `Transaction confirmed! ${signature.substring(0, 8)}...`);
    } catch (error: any) {
      showTxStatus('error', `Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection]);

  const featuredArt = [
    { id: 1, name: "Digital Mona Lisa", artist: "@wzard", price: 4.89, image: "https://picsum.photos/400/400?random=1", likes: 92 },
    { id: 2, name: "Abstract Reality", artist: "@vzla", price: 3.21, image: "https://picsum.photos/400/400?random=2", likes: 87 },
    { id: 3, name: "Neon Dreams", artist: "@neon", price: 5.67, image: "https://picsum.photos/400/400?random=3", likes: 134 },
  ];

  const gameAssets = [
    { id: 1, name: "Legendary Sword", game: "MetaQuest", price: 0.5, rarity: "Legendary", image: "https://picsum.photos/400/400?random=4" },
    { id: 2, name: "Dragon Mount", game: "CryptoRealm", price: 2.3, rarity: "Epic", image: "https://picsum.photos/400/400?random=5" },
    { id: 3, name: "Space Station", game: "StarVerse", price: 15.0, rarity: "Mythic", image: "https://picsum.photos/400/400?random=6" },
  ];

  const stats = [
    { label: "Total Volume", value: "32k+ SOL", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Active Users", value: "12k+", icon: <Users className="w-5 h-5" /> },
    { label: "NFTs Created", value: "50k+", icon: <Image className="w-5 h-5" /> },
    { label: "Games Integrated", value: "25+", icon: <Gamepad2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm bg-black/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Gokens
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button className="hover:text-purple-400 transition">Explore</button>
                <button className="hover:text-purple-400 transition">Create</button>
                <button className="hover:text-purple-400 transition">Community</button>
                <button className="hover:text-purple-400 transition">Stats</button>
              </nav>
            </div>
            {mounted && <WalletStatus />}
          </div>
        </div>
      </header>

      {/* Status Bar */}
      {txStatus.type && (
        <div className={`border-b px-4 py-2 ${
          txStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
          txStatus.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
          'bg-blue-500/10 border-blue-500/20'
        }`}>
          <div className="container mx-auto flex items-center space-x-2">
            {txStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : txStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm">{txStatus.message}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Explore, Buy and Sell the{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Best NFTs!
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Tokenize art masterpieces and gaming assets on Solana. 
              Join the revolution of fractional ownership and digital collectibles.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={createCollection}
                disabled={!wallet.connected || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Create Collection'}
              </button>
              <button 
                onClick={sendTransaction}
                disabled={!wallet.connected || loading}
                className="px-6 py-3 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Transaction
              </button>
              {!wallet.connected && (
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <span>Get Phantom</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {!wallet.connected && mounted && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Connect your Phantom wallet to interact with the platform
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Don't have Phantom? <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Install it here</a>
                </p>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-30"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30">
              <img
                src="https://picsum.photos/600/600?random=0"
                alt="Featured NFT"
                className="w-full rounded-lg"
              />
              <div className="mt-4 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">Magic Mushrooms</h3>
                    <p className="text-gray-400">@shroomie</p>
                  </div>
                  <button 
                    onClick={() => mintNFT("Magic Mushrooms", currentBid)}
                    disabled={!wallet.connected || loading}
                    className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {wallet.connected ? 'Mint NFT' : 'Connect Wallet'}
                  </button>
                </div>
                <div className="flex justify-between mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Current Bid</p>
                    <p className="text-lg font-bold">{currentBid.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ends in</p>
                    <p className="text-lg font-bold">25 hrs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jupiter Swap Section */}
      {mounted && (
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Instant Token Swaps with 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-2">
                Jupiter
              </span>
            </h2>
            <p className="text-gray-400">
              Trade tokens directly on Solana with the best rates from Jupiter aggregator
            </p>
          </div>
          <JupiterSwap />
        </section>
      )}

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-400">{stat.icon}</div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tab Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('art')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'art'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span>Art Collection</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('gaming')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'gaming'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5" />
              <span>Gaming Assets</span>
            </div>
          </button>
        </div>

        {/* Art Collection */}
        {activeTab === 'art' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Featured Artworks</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArt.map((art) => (
                <div key={art.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition">
                  <img src={art.image} alt={art.name} className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{art.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{art.artist}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Current Bid</p>
                        <p className="font-bold">{art.price} SOL</p>
                      </div>
                      <button 
                        onClick={() => mintNFT(art.name, art.price)}
                        disabled={!wallet.connected || loading}
                        className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {wallet.connected ? 'Place Bid' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaming Assets */}
        {activeTab === 'gaming' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Gaming NFTs</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {gameAssets.map((asset) => (
                <div key={asset.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition">
                  <div className="relative">
                    <img src={asset.image} alt={asset.name} className="w-full h-64 object-cover" />
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-bold ${
                      asset.rarity === 'Mythic' ? 'bg-red-500' :
                      asset.rarity === 'Legendary' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}>
                      {asset.rarity}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{asset.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{asset.game}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="font-bold">{asset.price} SOL</p>
                      </div>
                      <button 
                        onClick={() => mintNFT(asset.name, asset.price)}
                        disabled={!wallet.connected || loading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {wallet.connected ? 'Buy Now' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Gokens?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
            <p className="text-gray-400">Built on Solana blockchain with smart contracts ensuring authenticity and ownership verification</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Experience instant transactions with Solana's high-speed network and low fees</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fractional Ownership</h3>
            <p className="text-gray-400">Own a piece of expensive artworks and gaming assets through tokenization</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Gokens</span>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">© 2024 Gokens. Built for Solana Hackathon</p>
              <p className="text-gray-500 text-xs mt-1">Program ID: {PROGRAM_ID.toString().substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Главный компонент с провайдерами
export default function App() {
  const [walletError, setWalletError] = useState<Error | null>(null);
  
  const wallets = useMemo(() => {
    try {
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter()
      ];
    } catch (error) {
      console.log('Wallet adapter initialization:', error);
      return [];
    }
  }, []);

  const endpoint = useMemo(() => clusterApiUrl(NETWORK), []);

  const onError = useCallback((error: Error) => {
    if (error.message?.includes('WalletNotReadyError')) {
      console.log('Phantom wallet is not installed. Please install from phantom.app');
    } else {
      console.error('Wallet error:', error);
    }
    setWalletError(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={onError}
      >
        <WalletModalProvider>
          <GokensMarketplace />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}