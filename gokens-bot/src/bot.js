const { Telegraf } = require('telegraf');
const express = require('express');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
require('dotenv').config();

// Express для health checks
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Запускаем Express сервер
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${PORT}`);
});

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Хранилище пользователей
const users = new Map();

// Middleware для инициализации пользователя
bot.use((ctx, next) => {
  if (ctx.from && !users.has(ctx.from.id)) {
    users.set(ctx.from.id, {
      portfolio: {
        artNFTs: [],
        gameAssets: [],
        fractionalTokens: []
      },
      balance: 0
    });
  }
  return next();
});

// Команды бота
bot.start((ctx) => {
  const welcomeMessage = `
🎨 *Welcome to Gokens Bot!* 🎮
Running on Fly.io 24/7! ⚡

Your gateway to tokenized art and gaming assets on Solana blockchain.

Available Commands:
/wallet - Connect/View wallet
/portfolio - View your portfolio
/marketplace - Browse available NFTs
/stats - Platform statistics
/help - Get help`;

  return ctx.replyWithMarkdown(welcomeMessage);
});

bot.command('wallet', async (ctx) => {
  ctx.reply('💳 Wallet functionality coming soon!');
});

bot.command('portfolio', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  ctx.replyWithMarkdown(
    `💼 *Your Portfolio*\n\n` +
    `🎨 Art NFTs: ${user.portfolio.artNFTs.length}\n` +
    `🎮 Game Assets: ${user.portfolio.gameAssets.length}\n` +
    `🔢 Fractional Tokens: ${user.portfolio.fractionalTokens.length}`
  );
});

bot.command('marketplace', (ctx) => {
  ctx.replyWithMarkdown(
    `🏪 *Gokens Marketplace*\n\n` +
    `📈 24h Volume: *2,847 SOL*\n` +
    `🔥 Active Listings: *1,293*\n` +
    `👥 Active Traders: *456*`
  );
});

bot.command('stats', (ctx) => {
  ctx.replyWithMarkdown(
    `📊 *Platform Statistics*\n\n` +
    `⚡ Powered by Solana blockchain\n` +
    `🚀 Hosted on Fly.io\n` +
    `✅ Status: Online 24/7`
  );
});

bot.command('help', (ctx) => {
  ctx.reply('Need help? Contact @gokens_support');
});

// Запускаем бота с polling
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('🤖 Gokens Bot is running on Fly.io!');
}).catch(err => {
  console.error('Failed to start bot:', err);
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));