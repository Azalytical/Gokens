import { Telegraf, Context } from 'telegraf';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Health check endpoint для Fly.io
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Solana connection с fallback
const SOLANA_ENDPOINTS = [
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];

let currentEndpoint = 0;
const getConnection = () => {
  return new Connection(SOLANA_ENDPOINTS[currentEndpoint], 'confirmed');
};

// Ваша логика бота остается та же
bot.start((ctx) => {
  ctx.reply('🎨 Welcome to Gokens Bot on Fly.io! 🎮');
});

// Используем long polling для Fly.io
bot.launch({
  webhook: undefined,  // Отключаем webhook
  dropPendingUpdates: true
});

// Express сервер для health checks
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Gokens Bot running on Fly.io port ${PORT}`);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));