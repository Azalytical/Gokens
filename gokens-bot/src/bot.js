// Полностью замените содержимое файла: gokens-bot/src/bot.js

require("./instrument.js");

const Sentry = require("@sentry/node");

try {
  foo();
} catch (e) {
  Sentry.captureException(e);
}

const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
require('dotenv').config();

// ===== КОНФИГУРАЦИЯ =====
const BOT_TOKEN = process.env.BOT_TOKEN || '8236253203:AAGTFLqMxz1ygQFaep6p0y1zGANsSDAcqYg';
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gokens-web.netlify.app';
const PROGRAM_ID = process.env.PROGRAM_ID || 'FeLQB1uPtHA7wfq2m1uBHxd4SL8G5H37S9LbTEh5DmRh';

// ===== EXPRESS СЕРВЕР ДЛЯ HEALTH CHECK =====
const app = express();
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${PORT}`);
});

// ===== ИНИЦИАЛИЗАЦИЯ БОТА =====
const bot = new Telegraf(BOT_TOKEN);
const connection = new Connection(SOLANA_RPC, 'confirmed');

// ===== ХРАНИЛИЩЕ СЕССИЙ =====
const userSessions = new Map();

// Демо данные для NFT
const artNFTs = [
  { id: 1, name: 'Digital Mona Lisa', price: 4.89, artist: '@wzard', description: 'A masterpiece reimagined for the digital age' },
  { id: 2, name: 'Abstract Reality', price: 3.21, artist: '@vzla', description: 'Where dreams meet blockchain' },
  { id: 3, name: 'Neon Dreams', price: 5.67, artist: '@neon', description: 'Cyberpunk aesthetic NFT' },
  { id: 4, name: 'Cosmic Journey', price: 8.99, artist: '@cosmos', description: 'Travel through the stars' }
];

const gameAssets = [
  { id: 1, name: 'Legendary Sword', game: 'MetaQuest', price: 0.5, rarity: 'Legendary' },
  { id: 2, name: 'Dragon Mount', game: 'CryptoRealm', price: 2.3, rarity: 'Epic' },
  { id: 3, name: 'Space Station', game: 'StarVerse', price: 15.0, rarity: 'Mythic' }
];

// ===== MIDDLEWARE =====
bot.use(async (ctx, next) => {
  if (ctx.from) {
    if (!userSessions.has(ctx.from.id)) {
      userSessions.set(ctx.from.id, {
        walletAddress: null,
        walletConnected: false,
        balance: 0,
        portfolio: {
          artNFTs: [],
          gameAssets: [],
          fractionalTokens: []
        },
        kycVerified: false,
        language: 'en'
      });
    }
  }
  return next();
});

// ===== КОМАНДА START =====
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || 'User';
  const userId = ctx.from.id;
  
  const welcomeMessage = `
🎨 *Welcome to Gokens Bot, ${userName}!* 🎮

Your gateway to tokenized art and gaming assets on Solana blockchain.

🌟 *Features:*
• Connect wallet & manage portfolio
• Buy/Sell NFTs directly in Telegram  
• Fractional art ownership
• Real-time price tracking
• Jupiter token swaps

📊 *Platform Stats:*
• Network: Solana Devnet
• Total Volume: 32,456 SOL
• Active Users: 12,543
• NFTs Created: 50,234

Choose an action below to get started:`;

  await ctx.replyWithMarkdown(
    welcomeMessage,
    Markup.inlineKeyboard([
      [Markup.button.callback('💳 Connect Wallet', 'connect_wallet')],
      [Markup.button.callback('🎨 Browse Art', 'browse_art'), 
       Markup.button.callback('🎮 Game Assets', 'browse_games')],
      [Markup.button.callback('💼 My Portfolio', 'view_portfolio')],
      [Markup.button.callback('💱 Swap Tokens', 'swap_tokens')],
      [Markup.button.callback('📊 Platform Stats', 'view_stats')],
      [Markup.button.callback('✅ KYC Verification', 'kyc_verify')],
      [Markup.button.url('🌐 Open Web App', FRONTEND_URL)]
    ])
  );
});

// ===== ПОДКЛЮЧЕНИЕ КОШЕЛЬКА =====
bot.action('connect_wallet', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  // Генерируем временный кошелек для демо
  const tempKeypair = Keypair.generate();
  const walletAddress = tempKeypair.publicKey.toString();
  
  // Сохраняем в сессии
  session.walletAddress = walletAddress;
  session.walletConnected = true;
  
  // Получаем баланс (для демо устанавливаем случайный)
  const demoBalance = (Math.random() * 10 + 1).toFixed(4);
  session.balance = parseFloat(demoBalance);
  
  const connectUrl = `${FRONTEND_URL}?connect=${walletAddress}&telegram=${userId}`;
  
  await ctx.editMessageText(
    `✅ *Wallet Connected Successfully!*\n\n` +
    `📍 *Address:*\n\`${walletAddress.substring(0, 20)}...\n...${walletAddress.substring(walletAddress.length - 20)}\`\n\n` +
    `💰 *Balance:* ${demoBalance} SOL\n` +
    `🌐 *Network:* Solana Devnet\n` +
    `📱 *Program ID:* \`${PROGRAM_ID.substring(0, 8)}...\`\n\n` +
    `💡 *Tip:* You can also connect your real Phantom wallet on the website.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Connect Phantom Wallet', url: connectUrl }],
          [{ text: '💼 View Portfolio', callback_data: 'view_portfolio' }],
          [{ text: '🎨 Browse NFTs', callback_data: 'browse_art' }],
          [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
        ]
      }
    }
  );
  await ctx.answerCbQuery('Wallet connected! You can now browse and buy NFTs.');
});

// ===== ПРОСМОТР ПОРТФЕЛЯ =====
bot.action('view_portfolio', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (!session.walletConnected) {
    await ctx.answerCbQuery('Please connect your wallet first!', { show_alert: true });
    return;
  }
  
  // Симуляция портфеля
  const totalValue = session.balance * 100.25; // Примерная цена SOL в USD
  const profit = (Math.random() * 20 - 10).toFixed(2);
  
  await ctx.editMessageText(
    `💼 *Your Portfolio*\n\n` +
    `📍 *Wallet:* \`${session.walletAddress.substring(0, 12)}...\`\n` +
    `💰 *Balance:* ${session.balance.toFixed(4)} SOL\n\n` +
    `🎨 *Art NFTs:* ${session.portfolio.artNFTs.length}\n` +
    `🎮 *Game Assets:* ${session.portfolio.gameAssets.length}\n` +
    `🔢 *Fractional Tokens:* ${session.portfolio.fractionalTokens.length}\n\n` +
    `📈 *Total Value:* $${totalValue.toFixed(2)} USD\n` +
    `📊 *24h Change:* ${profit > 0 ? '+' : ''}${profit}%\n` +
    `✅ *KYC Status:* ${session.kycVerified ? 'Verified' : 'Not Verified'}`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'view_portfolio' }],
          [{ text: '💱 Swap Tokens', callback_data: 'swap_tokens' }],
          [{ text: '📜 Transaction History', callback_data: 'view_history' }],
          [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
        ]
      }
    }
  );
  await ctx.answerCbQuery();
});

// ===== ПРОСМОТР NFT ИСКУССТВА =====
bot.action('browse_art', async (ctx) => {
  let message = '🎨 *Available Art NFTs*\n\n';
  const keyboard = [];
  
  artNFTs.forEach((nft, index) => {
    message += `${index + 1}. *${nft.name}*\n`;
    message += `   Artist: ${nft.artist}\n`;
    message += `   Price: ${nft.price} SOL\n`;
    message += `   _${nft.description}_\n\n`;
    
    keyboard.push([{ 
      text: `Buy "${nft.name}" - ${nft.price} SOL`, 
      callback_data: `buy_art_${nft.id}` 
    }]);
  });
  
  keyboard.push(
    [{ text: '🖼 View Gallery', url: `${FRONTEND_URL}#gallery` }],
    [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
  );
  
  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  });
  await ctx.answerCbQuery();
});

// ===== ПРОСМОТР ИГРОВЫХ АКТИВОВ =====
bot.action('browse_games', async (ctx) => {
  let message = '🎮 *Gaming Assets Marketplace*\n\n';
  const keyboard = [];
  
  gameAssets.forEach((asset, index) => {
    const rarityEmoji = asset.rarity === 'Mythic' ? '🔥' : 
                        asset.rarity === 'Legendary' ? '⭐' : '💎';
    
    message += `${index + 1}. *${asset.name}* ${rarityEmoji}\n`;
    message += `   Game: ${asset.game}\n`;
    message += `   Rarity: ${asset.rarity}\n`;
    message += `   Price: ${asset.price} SOL\n\n`;
    
    keyboard.push([{ 
      text: `Buy "${asset.name}" - ${asset.price} SOL`, 
      callback_data: `buy_game_${asset.id}` 
    }]);
  });
  
  keyboard.push([{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]);
  
  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  });
  await ctx.answerCbQuery();
});

// ===== ПОКУПКА NFT =====
bot.action(/buy_(art|game)_(\d+)/, async (ctx) => {
  const [, type, id] = ctx.match;
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (!session.walletConnected) {
    await ctx.answerCbQuery('Please connect your wallet first!', { show_alert: true });
    return;
  }
  
  const item = type === 'art' 
    ? artNFTs.find(n => n.id === parseInt(id))
    : gameAssets.find(a => a.id === parseInt(id));
  
  if (!item) {
    await ctx.answerCbQuery('Item not found!', { show_alert: true });
    return;
  }
  
  // Проверяем баланс
  if (session.balance < item.price) {
    await ctx.answerCbQuery(`Insufficient balance! You need ${item.price} SOL`, { show_alert: true });
    return;
  }
  
  // Симулируем покупку
  const txHash = Keypair.generate().publicKey.toString().substring(0, 44);
  
  await ctx.editMessageText(
    `✅ *Purchase Initiated!*\n\n` +
    `📦 *Item:* ${item.name}\n` +
    `💰 *Price:* ${item.price} SOL\n` +
    `📍 *Type:* ${type === 'art' ? 'Art NFT' : 'Game Asset'}\n\n` +
    `🔄 *Transaction Status:* Processing...\n` +
    `🔗 *TX Hash:* \`${txHash}\`\n\n` +
    `⏱ Estimated time: 5-10 seconds\n\n` +
    `_The NFT will be transferred to your wallet after confirmation._`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📜 View on Solscan', url: `https://solscan.io/tx/${txHash}?cluster=devnet` }],
          [{ text: '💼 View Portfolio', callback_data: 'view_portfolio' }],
          [{ text: '🛒 Continue Shopping', callback_data: type === 'art' ? 'browse_art' : 'browse_games' }],
          [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
        ]
      }
    }
  );
  
  // Обновляем портфель
  if (type === 'art') {
    session.portfolio.artNFTs.push(item);
  } else {
    session.portfolio.gameAssets.push(item);
  }
  session.balance -= item.price;
  
  await ctx.answerCbQuery(`Successfully initiated purchase of ${item.name}!`);
});

// ===== SWAP ТОКЕНОВ =====
bot.action('swap_tokens', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (!session.walletConnected) {
    await ctx.answerCbQuery('Please connect your wallet first!', { show_alert: true });
    return;
  }
  
  const message = `
💱 *Token Swap (Jupiter Integration)*

Available pairs:
• SOL ↔️ USDC
• SOL ↔️ GOKENS  
• USDC ↔️ GOKENS

📊 *Current Rates:*
• 1 SOL = 100.25 USDC
• 1 SOL = 667 GOKENS
• 1 GOKENS = 0.15 USDC

💰 *Your Balance:*
• SOL: ${session.balance.toFixed(4)}
• USDC: 0.00
• GOKENS: 0.00

Select a swap pair:`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'SOL → USDC', callback_data: 'swap_sol_usdc' },
         { text: 'SOL → GOKENS', callback_data: 'swap_sol_gokens' }],
        [{ text: 'USDC → SOL', callback_data: 'swap_usdc_sol' },
         { text: 'GOKENS → SOL', callback_data: 'swap_gokens_sol' }],
        [{ text: '🌐 Use Jupiter on Web', url: `${FRONTEND_URL}#swap` }],
        [{ text: '🔙 Back', callback_data: 'view_portfolio' }]
      ]
    }
  });
  await ctx.answerCbQuery();
});

// ===== ОБРАБОТКА СВАПОВ =====
bot.action(/swap_(\w+)_(\w+)/, async (ctx) => {
  const [, from, to] = ctx.match;
  
  await ctx.editMessageText(
    `🔄 *Swap ${from.toUpperCase()} → ${to.toUpperCase()}*\n\n` +
    `To complete the swap, please use our web interface.\n` +
    `Jupiter aggregator will find the best rates for you.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Complete Swap on Website', url: `${FRONTEND_URL}#swap` }],
          [{ text: '🔙 Back', callback_data: 'swap_tokens' }]
        ]
      }
    }
  );
  await ctx.answerCbQuery('Opening swap interface...', { show_alert: true });
});

// ===== KYC ВЕРИФИКАЦИЯ =====
bot.action('kyc_verify', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (session.kycVerified) {
    await ctx.editMessageText(
      `✅ *KYC Already Verified!*\n\n` +
      `Your account is fully verified and you have access to all features.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    await ctx.answerCbQuery('Already verified!');
    return;
  }
  
  await ctx.editMessageText(
    `🛡 *KYC Verification*\n\n` +
    `Complete KYC to unlock:\n` +
    `• Higher transaction limits\n` +
    `• Access to exclusive NFTs\n` +
    `• Fractional ownership features\n` +
    `• Priority support\n\n` +
    `The process takes only 2 minutes.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📝 Start Verification', callback_data: 'kyc_start' }],
          [{ text: '🌐 Verify on Website', url: `${FRONTEND_URL}#kyc` }],
          [{ text: '🔙 Back', callback_data: 'back_to_menu' }]
        ]
      }
    }
  );
  await ctx.answerCbQuery();
});

// ===== НАЧАЛО KYC =====
bot.action('kyc_start', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  // Симулируем быструю верификацию для демо
  session.kycVerified = true;
  
  await ctx.editMessageText(
    `✅ *KYC Verification Complete!*\n\n` +
    `Congratulations! Your account is now fully verified.\n\n` +
    `*Verification Level:* Basic\n` +
    `*Status:* Approved\n` +
    `*Valid Until:* Dec 31, 2025\n\n` +
    `You now have access to all platform features!`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💼 View Portfolio', callback_data: 'view_portfolio' }],
          [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
        ]
      }
    }
  );
  await ctx.answerCbQuery('Verification successful!', { show_alert: true });
});

// ===== СТАТИСТИКА ПЛАТФОРМЫ =====
bot.action('view_stats', async (ctx) => {
  const stats = {
    totalVolume: '32,456 SOL',
    dailyVolume: '1,234 SOL',
    activeUsers: '12,543',
    nftsCreated: '50,234',
    gamesIntegrated: '25',
    topCollection: 'Gokens Genesis',
    topGame: 'MetaQuest'
  };
  
  const message = `
📊 *Gokens Platform Statistics*

📈 *Volume:*
• Total: ${stats.totalVolume}
• 24h: ${stats.dailyVolume}
• 24h Change: +12.5%

👥 *Users & Activity:*
• Active Users: ${stats.activeUsers}
• NFTs Created: ${stats.nftsCreated}
• Games Integrated: ${stats.gamesIntegrated}

🏆 *Top Performers:*
• Collection: ${stats.topCollection}
• Game: ${stats.topGame}
• Most Traded: Digital Mona Lisa

⚡ *Network Stats:*
• Blockchain: Solana
• Avg TX Time: <1 second
• Avg Fee: 0.00025 SOL
• Success Rate: 99.9%`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Refresh', callback_data: 'view_stats' }],
        [{ text: '📊 View Charts on Web', url: `${FRONTEND_URL}#stats` }],
        [{ text: '🔙 Main Menu', callback_data: 'back_to_menu' }]
      ]
    }
  });
  await ctx.answerCbQuery();
});

// ===== ИСТОРИЯ ТРАНЗАКЦИЙ =====
bot.action('view_history', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  const message = `
📜 *Transaction History*

${session.portfolio.artNFTs.length > 0 || session.portfolio.gameAssets.length > 0 ? 
  session.portfolio.artNFTs.concat(session.portfolio.gameAssets)
    .slice(-5)
    .map((item, i) => `${i + 1}. Bought "${item.name}" for ${item.price} SOL`)
    .join('\n') 
  : '_No transactions yet_'}

View full history on the website.`;

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 View on Website', url: `${FRONTEND_URL}#history` }],
        [{ text: '🔙 Back', callback_data: 'view_portfolio' }]
      ]
    }
  });
  await ctx.answerCbQuery();
});

// ===== ВОЗВРАТ В ГЛАВНОЕ МЕНЮ =====
bot.action('back_to_menu', async (ctx) => {
  await ctx.editMessageText(
    '🎨 *Gokens Bot* 🎮\n\nChoose an action:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback('💳 Connect Wallet', 'connect_wallet')],
          [Markup.button.callback('🎨 Browse Art', 'browse_art'), 
           Markup.button.callback('🎮 Game Assets', 'browse_games')],
          [Markup.button.callback('💼 My Portfolio', 'view_portfolio')],
          [Markup.button.callback('💱 Swap Tokens', 'swap_tokens')],
          [Markup.button.callback('📊 Platform Stats', 'view_stats')],
          [Markup.button.callback('✅ KYC Verification', 'kyc_verify')],
          [Markup.button.url('🌐 Open Web App', FRONTEND_URL)]
        ]
      }
    }
  );
  await ctx.answerCbQuery();
});

// ===== КОМАНДА HELP =====
bot.command('help', async (ctx) => {
  await ctx.reply(
    `*Gokens Bot Commands:*\n\n` +
    `/start - Main menu\n` +
    `/wallet - Wallet info\n` +
    `/portfolio - View your portfolio\n` +
    `/stats - Platform statistics\n` +
    `/help - This help message\n\n` +
    `*Support:* @gokens_support\n` +
    `*Website:* ${FRONTEND_URL}`,
    { parse_mode: 'Markdown' }
  );
});

// ===== КОМАНДА WALLET =====
bot.command('wallet', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (!session.walletConnected) {
    await ctx.reply('Wallet not connected. Use /start to connect.');
    return;
  }
  
  await ctx.replyWithMarkdown(
    `💳 *Wallet Info*\n\n` +
    `Address: \`${session.walletAddress.substring(0, 20)}...\`\n` +
    `Balance: ${session.balance.toFixed(4)} SOL\n` +
    `Network: Solana Devnet`
  );
});

// ===== КОМАНДА PORTFOLIO =====
bot.command('portfolio', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);
  
  if (!session.walletConnected) {
    await ctx.reply('Please connect your wallet first. Use /start');
    return;
  }
  
  await ctx.replyWithMarkdown(
    `💼 *Portfolio Summary*\n\n` +
    `Art NFTs: ${session.portfolio.artNFTs.length}\n` +
    `Game Assets: ${session.portfolio.gameAssets.length}\n` +
    `Balance: ${session.balance.toFixed(4)} SOL`
  );
});

// ===== КОМАНДА STATS =====
bot.command('stats', async (ctx) => {
  await ctx.replyWithMarkdown(
    `📊 *Quick Stats*\n\n` +
    `Total Volume: 32,456 SOL\n` +
    `Active Users: 12,543\n` +
    `NFTs: 50,234\n\n` +
    `Use /start for detailed statistics.`
  );
});

// ===== ОБРАБОТКА ТЕКСТОВЫХ СООБЩЕНИЙ =====
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  
  if (text.includes('price') || text.includes('cost')) {
    await ctx.reply('To view NFT prices, use /start and browse our collections.');
  } else if (text.includes('buy') || text.includes('purchase')) {
    await ctx.reply('To buy NFTs, use /start and browse available items.');
  } else if (text.includes('sell')) {
    await ctx.reply('To sell NFTs, please use our web platform: ' + FRONTEND_URL);
  } else {
    await ctx.reply('I didn\'t understand that. Try /help for available commands.');
  }
});

// ===== ОБРАБОТКА ОШИБОК =====
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('An error occurred. Please try again or contact support.');
});

// ===== ЗАПУСК БОТА =====
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('🤖 Gokens Bot is running!');
  console.log('📍 Program ID:', PROGRAM_ID);
  console.log('🌐 Frontend:', FRONTEND_URL);
  console.log('⚡ Network:', SOLANA_RPC);
}).catch(err => {
  console.error('Failed to start bot:', err);
  process.exit(1);
});

// ===== GRACEFUL SHUTDOWN =====
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot initialization complete. Waiting for messages...');