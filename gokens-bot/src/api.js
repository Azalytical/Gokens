// Создать НОВЫЙ файл: gokens-bot/src/api.js

const express = require('express');
const cors = require('cors');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Program, AnchorProvider, web3 } = require('@project-serum/anchor');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Хранилище данных пользователей
const userData = new Map();

// Синхронизация пользователя между платформами
app.post('/api/sync-user', async (req, res) => {
  try {
    const { userId, walletAddress, platform } = req.body;
    
    // Сохраняем в Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({
        user_id: userId,
        wallet_address: walletAddress,
        platform: platform,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Сохраняем локально
    userData.set(userId, {
      walletAddress,
      platform,
      lastSync: Date.now()
    });
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение портфеля пользователя
app.get('/api/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Получаем данные из Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Получаем NFT пользователя
    const { data: nfts, error: nftError } = await supabase
      .from('user_nfts')
      .select('*')
      .eq('user_id', userId);
    
    if (nftError) throw nftError;
    
    // Получаем баланс из блокчейна
    let balance = 0;
    if (userData?.wallet_address) {
      try {
        const pubkey = new PublicKey(userData.wallet_address);
        balance = await connection.getBalance(pubkey);
      } catch (e) {
        console.error('Balance fetch error:', e);
      }
    }
    
    res.json({
      user: userData,
      nfts: nfts || [],
      balance: balance / LAMPORTS_PER_SOL,
      fractionalTokens: []
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создание транзакции для покупки NFT
app.post('/api/create-transaction', async (req, res) => {
  try {
    const { userId, nftId, price } = req.body;
    
    // Создаем запись о транзакции
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        nft_id: nftId,
        price: price,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      transactionId: data[0].id,
      message: 'Transaction created. Please confirm in your wallet.'
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook для Telegram бота
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const { message, callback_query } = req.body;
    
    if (callback_query) {
      // Обработка inline кнопок
      const { data, from } = callback_query;
      
      if (data.startsWith('buy_')) {
        const nftId = data.replace('buy_', '');
        // Создаем транзакцию
        await createPurchaseTransaction(from.id, nftId);
      }
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение цен через Oracle
app.get('/api/prices', async (req, res) => {
  try {
    // Имитация Oracle для демо
    const prices = {
      SOL: 100.25,
      GOKENS: 0.15,
      USDC: 1.0
    };
    
    res.json({ prices, timestamp: Date.now() });
  } catch (error) {
    console.error('Price error:', error);
    res.status(500).json({ error: error.message });
  }
});

// KYC проверка (заглушка)
app.post('/api/kyc/verify', async (req, res) => {
  try {
    const { userId, documents } = req.body;
    
    // Заглушка для KYC
    const kycResult = {
      userId,
      status: 'verified',
      level: 1,
      verifiedAt: new Date().toISOString()
    };
    
    // Сохраняем в БД
    const { data, error } = await supabase
      .from('kyc_records')
      .upsert(kycResult);
    
    if (error) throw error;
    
    res.json({ success: true, kyc: kycResult });
  } catch (error) {
    console.error('KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Jupiter swap endpoint
app.post('/api/swap', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippage, userPublicKey } = req.body;
    
    // Получаем quote от Jupiter
    const quoteResponse = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippage}`
    );
    const quote = await quoteResponse.json();
    
    // Создаем транзакцию
    const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true
      })
    });
    
    const swapData = await swapResponse.json();
    
    res.json({ success: true, transaction: swapData });
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Статистика платформы
app.get('/api/stats', async (req, res) => {
  try {
    // Получаем статистику из БД
    const stats = {
      totalVolume: '32,456 SOL',
      activeUsers: 12543,
      nftsCreated: 50234,
      gamesIntegrated: 25,
      dailyVolume: '1,234 SOL',
      topCollections: [
        { name: 'Gokens Genesis', volume: '5,432 SOL' },
        { name: 'MetaQuest Items', volume: '3,221 SOL' }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});

module.exports = app;