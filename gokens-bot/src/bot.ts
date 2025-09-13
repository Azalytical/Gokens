import { Telegraf, Context, Markup } from 'telegraf';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { Update, Message } from 'telegraf/types';

dotenv.config();

// Интерфейс для хранения данных пользователя
interface UserData {
  walletAddress?: string;
  portfolio: {
    artNFTs: any[];
    gameAssets: any[];
    fractionalTokens: any[];
  };
  balance: number;
}

// Хранилище данных пользователей (в реальном проекте используйте БД)
const users: Map<number, UserData> = new Map();

// Создаем подключение к Solana
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899',
  'confirmed'
);

// Инициализируем бота
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Добавляем типизацию для контекста
interface MyContext extends Context {
  session?: UserData;
}

// Middleware для инициализации пользователя
bot.use((ctx: MyContext, next) => {
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
  if (ctx.from) {
    ctx.session = users.get(ctx.from.id);
  }
  return next();
});

// Команда /start
bot.start((ctx) => {
  const welcomeMessage = `
🎨 *Welcome to Gokens Bot!* 🎮

Your gateway to tokenized art and gaming assets on Solana blockchain.

*Available Commands:*
/wallet - Connect/View wallet
/portfolio - View your portfolio
/marketplace - Browse available NFTs
/art - Browse art collections
/gaming - Browse gaming assets
/fractional - View fractional tokens
/buy - Buy tokens
/sell - Sell tokens
/stats - Platform statistics
/help - Get help

*Features:*
✨ Fractional ownership of expensive art
🎮 Trade gaming NFTs across games
⚡ Lightning-fast Solana transactions
🔒 Secure blockchain verification

Choose an action below to get started:`;

  return ctx.replyWithMarkdown(
    welcomeMessage,
    Markup.keyboard([
      ['💼 Portfolio', '🏪 Marketplace'],
      ['🎨 Art NFTs', '🎮 Game Assets'],
      ['💰 Balance', '📊 Stats'],
      ['⚙️ Settings', '❓ Help']
    ]).resize()
  );
});

// Команда /wallet
bot.command('wallet', async (ctx: MyContext) => {
  if (!ctx.session?.walletAddress) {
    return ctx.reply(
      '🔗 *Connect Your Wallet*\n\n' +
      'To connect your Solana wallet, please send your wallet address.\n\n' +
      '_Example: 5FHwkr...dQP6_\n\n' +
      '⚠️ Only send the public address, never share your private keys!',
      { parse_mode: 'Markdown' }
    );
  }

  try {
    const pubkey = new PublicKey(ctx.session.walletAddress);
    const balance = await connection.getBalance(pubkey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    return ctx.replyWithMarkdown(
      `💳 *Your Wallet Info*\n\n` +
      `📍 Address: \`${ctx.session.walletAddress.slice(0, 8)}...${ctx.session.walletAddress.slice(-8)}\`\n` +
      `💰 Balance: *${solBalance.toFixed(4)} SOL*\n` +
      `🎨 Art NFTs: ${ctx.session.portfolio.artNFTs.length}\n` +
      `🎮 Game Assets: ${ctx.session.portfolio.gameAssets.length}\n` +
      `🔢 Fractional Tokens: ${ctx.session.portfolio.fractionalTokens.length}`
    );
  } catch (error) {
    return ctx.reply('❌ Error fetching wallet info. Please check your connection.');
  }
});

// Команда /portfolio
bot.command('portfolio', (ctx: MyContext) => {
  if (!ctx.session) {
    return ctx.reply('❌ Please start the bot first with /start');
  }

  const portfolio = ctx.session.portfolio;
  const totalAssets = 
    portfolio.artNFTs.length + 
    portfolio.gameAssets.length + 
    portfolio.fractionalTokens.length;

  if (totalAssets === 0) {
    return ctx.replyWithMarkdown(
      `📂 *Your Portfolio is Empty*\n\n` +
      `Start building your collection!\n\n` +
      `• Browse /marketplace for available NFTs\n` +
      `• Check /art for art collections\n` +
      `• Explore /gaming for game assets\n` +
      `• Invest in /fractional tokens`
    );
  }

  let message = `💼 *Your Portfolio*\n\n`;
  
  if (portfolio.artNFTs.length > 0) {
    message += `🎨 *Art NFTs (${portfolio.artNFTs.length}):*\n`;
    portfolio.artNFTs.forEach(nft => {
      message += `• ${nft.name} - ${nft.value} SOL\n`;
    });
    message += '\n';
  }

  if (portfolio.gameAssets.length > 0) {
    message += `🎮 *Gaming Assets (${portfolio.gameAssets.length}):*\n`;
    portfolio.gameAssets.forEach(asset => {
      message += `• ${asset.name} - ${asset.value} SOL\n`;
    });
    message += '\n';
  }

  if (portfolio.fractionalTokens.length > 0) {
    message += `🔢 *Fractional Tokens (${portfolio.fractionalTokens.length}):*\n`;
    portfolio.fractionalTokens.forEach(token => {
      message += `• ${token.shares} shares of ${token.artwork} - ${token.value} SOL\n`;
    });
  }

  message += `\n💵 *Total Portfolio Value:* ${calculatePortfolioValue(portfolio)} SOL`;

  return ctx.replyWithMarkdown(message);
});

// Команда /marketplace
bot.command('marketplace', (ctx) => {
  const marketplaceMenu = Markup.inlineKeyboard([
    [
      Markup.button.callback('🎨 Art Collections', 'browse_art'),
      Markup.button.callback('🎮 Gaming NFTs', 'browse_gaming')
    ],
    [
      Markup.button.callback('🔢 Fractional Tokens', 'browse_fractional'),
      Markup.button.callback('🔥 Trending', 'browse_trending')
    ],
    [
      Markup.button.callback('💎 New Listings', 'browse_new'),
      Markup.button.callback('📊 Top Sales', 'browse_top')
    ]
  ]);

  return ctx.replyWithMarkdown(
    `🏪 *Gokens Marketplace*\n\n` +
    `Explore tokenized assets across art and gaming!\n\n` +
    `📈 24h Volume: *2,847 SOL*\n` +
    `🔥 Active Listings: *1,293*\n` +
    `👥 Active Traders: *456*\n\n` +
    `Select a category to browse:`,
    marketplaceMenu
  );
});

// Обработчик для просмотра коллекций искусства
bot.action('browse_art', (ctx) => {
  const artCollections = [
    { name: 'Digital Renaissance', floor: 2.5, items: 100 },
    { name: 'Abstract Visions', floor: 1.8, items: 250 },
    { name: 'Pixel Masters', floor: 0.9, items: 500 },
  ];

  let message = `🎨 *Art Collections*\n\n`;
  artCollections.forEach((collection, index) => {
    message += `${index + 1}. *${collection.name}*\n`;
    message += `   Floor: ${collection.floor} SOL | Items: ${collection.items}\n\n`;
  });

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🛒 Buy Art NFT', 'buy_art')],
    [Markup.button.callback('◀️ Back to Marketplace', 'back_marketplace')]
  ]);

  return ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...keyboard
  });
});

// Обработчик для игровых активов
bot.action('browse_gaming', (ctx) => {
  const gameAssets = [
    { name: 'Legendary Sword', game: 'MetaQuest', price: 0.5, rarity: 'Legendary' },
    { name: 'Dragon Mount', game: 'CryptoRealm', price: 2.3, rarity: 'Epic' },
    { name: 'Space Station', game: 'StarVerse', price: 15.0, rarity: 'Mythic' },
  ];

  let message = `🎮 *Gaming Assets*\n\n`;
  gameAssets.forEach((asset, index) => {
    message += `${index + 1}. *${asset.name}*\n`;
    message += `   Game: ${asset.game}\n`;
    message += `   Rarity: ${asset.rarity}\n`;
    message += `   Price: ${asset.price} SOL\n\n`;
  });

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🛒 Buy Game Asset', 'buy_gaming')],
    [Markup.button.callback('◀️ Back to Marketplace', 'back_marketplace')]
  ]);

  return ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    ...keyboard
  });
});

// Команда /buy
bot.command('buy', (ctx) => {
  return ctx.replyWithMarkdown(
    `💳 *Buy Tokens*\n\n` +
    `Select what you want to buy:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🎨 Art NFT', 'buy_art')],
      [Markup.button.callback('🎮 Game Asset', 'buy_gaming')],
      [Markup.button.callback('🔢 Fractional Shares', 'buy_fractional')]
    ])
  );
});

// Обработчик покупки искусства
bot.action('buy_art', async (ctx: MyContext) => {
  // Симуляция покупки
  const mockNFT = {
    name: 'Digital Masterpiece #' + Math.floor(Math.random() * 1000),
    value: (Math.random() * 5 + 0.5).toFixed(2)
  };

  if (ctx.session) {
    ctx.session.portfolio.artNFTs.push(mockNFT);
  }

  await ctx.answerCbQuery('✅ Purchase successful!');
  return ctx.replyWithMarkdown(
    `✅ *NFT Purchased!*\n\n` +
    `🎨 *${mockNFT.name}*\n` +
    `💰 Price: ${mockNFT.value} SOL\n\n` +
    `Transaction confirmed on Solana blockchain.\n` +
    `View your /portfolio to see your new NFT!`
  );
});

// Команда /stats
bot.command('stats', async (ctx) => {
  const stats = {
    totalVolume: '32,847 SOL',
    totalUsers: '12,456',
    totalNFTs: '50,293',
    avgPrice: '2.34 SOL',
    topSale: '156 SOL'
  };

  return ctx.replyWithMarkdown(
    `📊 *Gokens Platform Statistics*\n\n` +
    `💰 Total Volume: *${stats.totalVolume}*\n` +
    `👥 Total Users: *${stats.totalUsers}*\n` +
    `🖼 Total NFTs: *${stats.totalNFTs}*\n` +
    `📈 Avg Price: *${stats.avgPrice}*\n` +
    `🏆 Top Sale: *${stats.topSale}*\n\n` +
    `⚡ Powered by Solana blockchain`
  );
});

// Обработчик текстовых сообщений (для ввода адреса кошелька)
bot.on('message', (ctx: MyContext) => {
  // Проверяем, является ли сообщение текстовым
  if (!ctx.message || !('text' in ctx.message)) return;
  
  const text = (ctx.message! as any).text;
  if (!text) return;
  
  if (text && text.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
    // Похоже на Solana адрес
    if (ctx.session) {
      ctx.session.walletAddress = text;
      return ctx.reply('✅ Wallet connected successfully! Use /wallet to view details.');
    }
  }

  // Обработка кнопок клавиатуры
  switch(text) {
    case '💼 Portfolio':
      return ctx.reply('/portfolio');
    case '🏪 Marketplace':
      return ctx.reply('/marketplace');
    case '🎨 Art NFTs':
      return ctx.replyWithMarkdown('🎨 *Art Collections*\n\nBrowse and invest in tokenized artworks.\n\nUse /art to see available collections.');
    case '🎮 Game Assets':
      return ctx.replyWithMarkdown('🎮 *Gaming NFTs*\n\nTrade in-game items and assets.\n\nUse /gaming to browse assets.');
    case '💰 Balance':
      return ctx.reply('/wallet');
    case '📊 Stats':
      return ctx.reply('/stats');
    case '❓ Help':
      return ctx.reply('/help');
    case '⚙️ Settings':
      return ctx.replyWithMarkdown('⚙️ *Settings*\n\n• /wallet - Manage wallet\n• /notifications - Toggle notifications\n• /language - Change language');
  }
});

// Команда /help
bot.command('help', (ctx) => {
  return ctx.replyWithMarkdown(
    `❓ *Gokens Bot Help*\n\n` +
    `*Main Commands:*\n` +
    `/start - Start the bot\n` +
    `/wallet - Manage wallet\n` +
    `/portfolio - View your assets\n` +
    `/marketplace - Browse NFTs\n` +
    `/buy - Purchase tokens\n` +
    `/sell - Sell your tokens\n` +
    `/stats - Platform statistics\n\n` +
    `*Features:*\n` +
    `• Fractional ownership of art\n` +
    `• Gaming NFT marketplace\n` +
    `• Real-time price updates\n` +
    `• Secure Solana transactions\n\n` +
    `*Support:* @gokens_support`
  );
});

// Вспомогательная функция для расчета стоимости портфеля
function calculatePortfolioValue(portfolio: UserData['portfolio']): string {
  let total = 0;
  
  portfolio.artNFTs.forEach(nft => {
    total += parseFloat(nft.value || '0');
  });
  
  portfolio.gameAssets.forEach(asset => {
    total += parseFloat(asset.value || '0');
  });
  
  portfolio.fractionalTokens.forEach(token => {
    total += parseFloat(token.value || '0');
  });
  
  return total.toFixed(2);
}

// Обработка ошибок
bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ An error occurred. Please try again later.');
});

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('🤖 Gokens Bot is running!');
    console.log('🔗 Connected to Solana:', process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899');
  })
  .catch(err => {
    console.error('Failed to start bot:', err);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));