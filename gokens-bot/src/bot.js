"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var web3_js_1 = require("@solana/web3.js");
var dotenv = __importStar(require("dotenv"));
dotenv.config();
// Хранилище данных пользователей (в реальном проекте используйте БД)
var users = new Map();
// Создаем подключение к Solana
var connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899', 'confirmed');
// Инициализируем бота
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN || '');
// Middleware для инициализации пользователя
bot.use(function (ctx, next) {
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
bot.start(function (ctx) {
    var welcomeMessage = "\n\uD83C\uDFA8 *Welcome to Gokens Bot!* \uD83C\uDFAE\n\nYour gateway to tokenized art and gaming assets on Solana blockchain.\n\n*Available Commands:*\n/wallet - Connect/View wallet\n/portfolio - View your portfolio\n/marketplace - Browse available NFTs\n/art - Browse art collections\n/gaming - Browse gaming assets\n/fractional - View fractional tokens\n/buy - Buy tokens\n/sell - Sell tokens\n/stats - Platform statistics\n/help - Get help\n\n*Features:*\n\u2728 Fractional ownership of expensive art\n\uD83C\uDFAE Trade gaming NFTs across games\n\u26A1 Lightning-fast Solana transactions\n\uD83D\uDD12 Secure blockchain verification\n\nChoose an action below to get started:";
    return ctx.replyWithMarkdown(welcomeMessage, telegraf_1.Markup.keyboard([
        ['💼 Portfolio', '🏪 Marketplace'],
        ['🎨 Art NFTs', '🎮 Game Assets'],
        ['💰 Balance', '📊 Stats'],
        ['⚙️ Settings', '❓ Help']
    ]).resize());
});
// Команда /wallet
bot.command('wallet', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var pubkey, balance, solBalance, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!((_a = ctx.session) === null || _a === void 0 ? void 0 : _a.walletAddress)) {
                    return [2 /*return*/, ctx.reply('🔗 *Connect Your Wallet*\n\n' +
                            'To connect your Solana wallet, please send your wallet address.\n\n' +
                            '_Example: 5FHwkr...dQP6_\n\n' +
                            '⚠️ Only send the public address, never share your private keys!', { parse_mode: 'Markdown' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                pubkey = new web3_js_1.PublicKey(ctx.session.walletAddress);
                return [4 /*yield*/, connection.getBalance(pubkey)];
            case 2:
                balance = _b.sent();
                solBalance = balance / web3_js_1.LAMPORTS_PER_SOL;
                return [2 /*return*/, ctx.replyWithMarkdown("\uD83D\uDCB3 *Your Wallet Info*\n\n" +
                        "\uD83D\uDCCD Address: `".concat(ctx.session.walletAddress.slice(0, 8), "...").concat(ctx.session.walletAddress.slice(-8), "`\n") +
                        "\uD83D\uDCB0 Balance: *".concat(solBalance.toFixed(4), " SOL*\n") +
                        "\uD83C\uDFA8 Art NFTs: ".concat(ctx.session.portfolio.artNFTs.length, "\n") +
                        "\uD83C\uDFAE Game Assets: ".concat(ctx.session.portfolio.gameAssets.length, "\n") +
                        "\uD83D\uDD22 Fractional Tokens: ".concat(ctx.session.portfolio.fractionalTokens.length))];
            case 3:
                error_1 = _b.sent();
                return [2 /*return*/, ctx.reply('❌ Error fetching wallet info. Please check your connection.')];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Команда /portfolio
bot.command('portfolio', function (ctx) {
    if (!ctx.session) {
        return ctx.reply('❌ Please start the bot first with /start');
    }
    var portfolio = ctx.session.portfolio;
    var totalAssets = portfolio.artNFTs.length +
        portfolio.gameAssets.length +
        portfolio.fractionalTokens.length;
    if (totalAssets === 0) {
        return ctx.replyWithMarkdown("\uD83D\uDCC2 *Your Portfolio is Empty*\n\n" +
            "Start building your collection!\n\n" +
            "\u2022 Browse /marketplace for available NFTs\n" +
            "\u2022 Check /art for art collections\n" +
            "\u2022 Explore /gaming for game assets\n" +
            "\u2022 Invest in /fractional tokens");
    }
    var message = "\uD83D\uDCBC *Your Portfolio*\n\n";
    if (portfolio.artNFTs.length > 0) {
        message += "\uD83C\uDFA8 *Art NFTs (".concat(portfolio.artNFTs.length, "):*\n");
        portfolio.artNFTs.forEach(function (nft) {
            message += "\u2022 ".concat(nft.name, " - ").concat(nft.value, " SOL\n");
        });
        message += '\n';
    }
    if (portfolio.gameAssets.length > 0) {
        message += "\uD83C\uDFAE *Gaming Assets (".concat(portfolio.gameAssets.length, "):*\n");
        portfolio.gameAssets.forEach(function (asset) {
            message += "\u2022 ".concat(asset.name, " - ").concat(asset.value, " SOL\n");
        });
        message += '\n';
    }
    if (portfolio.fractionalTokens.length > 0) {
        message += "\uD83D\uDD22 *Fractional Tokens (".concat(portfolio.fractionalTokens.length, "):*\n");
        portfolio.fractionalTokens.forEach(function (token) {
            message += "\u2022 ".concat(token.shares, " shares of ").concat(token.artwork, " - ").concat(token.value, " SOL\n");
        });
    }
    message += "\n\uD83D\uDCB5 *Total Portfolio Value:* ".concat(calculatePortfolioValue(portfolio), " SOL");
    return ctx.replyWithMarkdown(message);
});
// Команда /marketplace
bot.command('marketplace', function (ctx) {
    var marketplaceMenu = telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('🎨 Art Collections', 'browse_art'),
            telegraf_1.Markup.button.callback('🎮 Gaming NFTs', 'browse_gaming')
        ],
        [
            telegraf_1.Markup.button.callback('🔢 Fractional Tokens', 'browse_fractional'),
            telegraf_1.Markup.button.callback('🔥 Trending', 'browse_trending')
        ],
        [
            telegraf_1.Markup.button.callback('💎 New Listings', 'browse_new'),
            telegraf_1.Markup.button.callback('📊 Top Sales', 'browse_top')
        ]
    ]);
    return ctx.replyWithMarkdown("\uD83C\uDFEA *Gokens Marketplace*\n\n" +
        "Explore tokenized assets across art and gaming!\n\n" +
        "\uD83D\uDCC8 24h Volume: *2,847 SOL*\n" +
        "\uD83D\uDD25 Active Listings: *1,293*\n" +
        "\uD83D\uDC65 Active Traders: *456*\n\n" +
        "Select a category to browse:", marketplaceMenu);
});
// Обработчик для просмотра коллекций искусства
bot.action('browse_art', function (ctx) {
    var artCollections = [
        { name: 'Digital Renaissance', floor: 2.5, items: 100 },
        { name: 'Abstract Visions', floor: 1.8, items: 250 },
        { name: 'Pixel Masters', floor: 0.9, items: 500 },
    ];
    var message = "\uD83C\uDFA8 *Art Collections*\n\n";
    artCollections.forEach(function (collection, index) {
        message += "".concat(index + 1, ". *").concat(collection.name, "*\n");
        message += "   Floor: ".concat(collection.floor, " SOL | Items: ").concat(collection.items, "\n\n");
    });
    var keyboard = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('🛒 Buy Art NFT', 'buy_art')],
        [telegraf_1.Markup.button.callback('◀️ Back to Marketplace', 'back_marketplace')]
    ]);
    return ctx.editMessageText(message, __assign({ parse_mode: 'Markdown' }, keyboard));
});
// Обработчик для игровых активов
bot.action('browse_gaming', function (ctx) {
    var gameAssets = [
        { name: 'Legendary Sword', game: 'MetaQuest', price: 0.5, rarity: 'Legendary' },
        { name: 'Dragon Mount', game: 'CryptoRealm', price: 2.3, rarity: 'Epic' },
        { name: 'Space Station', game: 'StarVerse', price: 15.0, rarity: 'Mythic' },
    ];
    var message = "\uD83C\uDFAE *Gaming Assets*\n\n";
    gameAssets.forEach(function (asset, index) {
        message += "".concat(index + 1, ". *").concat(asset.name, "*\n");
        message += "   Game: ".concat(asset.game, "\n");
        message += "   Rarity: ".concat(asset.rarity, "\n");
        message += "   Price: ".concat(asset.price, " SOL\n\n");
    });
    var keyboard = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('🛒 Buy Game Asset', 'buy_gaming')],
        [telegraf_1.Markup.button.callback('◀️ Back to Marketplace', 'back_marketplace')]
    ]);
    return ctx.editMessageText(message, __assign({ parse_mode: 'Markdown' }, keyboard));
});
// Команда /buy
bot.command('buy', function (ctx) {
    return ctx.replyWithMarkdown("\uD83D\uDCB3 *Buy Tokens*\n\n" +
        "Select what you want to buy:", telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('🎨 Art NFT', 'buy_art')],
        [telegraf_1.Markup.button.callback('🎮 Game Asset', 'buy_gaming')],
        [telegraf_1.Markup.button.callback('🔢 Fractional Shares', 'buy_fractional')]
    ]));
});
// Обработчик покупки искусства
bot.action('buy_art', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var mockNFT;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mockNFT = {
                    name: 'Digital Masterpiece #' + Math.floor(Math.random() * 1000),
                    value: (Math.random() * 5 + 0.5).toFixed(2)
                };
                if (ctx.session) {
                    ctx.session.portfolio.artNFTs.push(mockNFT);
                }
                return [4 /*yield*/, ctx.answerCbQuery('✅ Purchase successful!')];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.replyWithMarkdown("\u2705 *NFT Purchased!*\n\n" +
                        "\uD83C\uDFA8 *".concat(mockNFT.name, "*\n") +
                        "\uD83D\uDCB0 Price: ".concat(mockNFT.value, " SOL\n\n") +
                        "Transaction confirmed on Solana blockchain.\n" +
                        "View your /portfolio to see your new NFT!")];
        }
    });
}); });
// Команда /stats
bot.command('stats', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        stats = {
            totalVolume: '32,847 SOL',
            totalUsers: '12,456',
            totalNFTs: '50,293',
            avgPrice: '2.34 SOL',
            topSale: '156 SOL'
        };
        return [2 /*return*/, ctx.replyWithMarkdown("\uD83D\uDCCA *Gokens Platform Statistics*\n\n" +
                "\uD83D\uDCB0 Total Volume: *".concat(stats.totalVolume, "*\n") +
                "\uD83D\uDC65 Total Users: *".concat(stats.totalUsers, "*\n") +
                "\uD83D\uDDBC Total NFTs: *".concat(stats.totalNFTs, "*\n") +
                "\uD83D\uDCC8 Avg Price: *".concat(stats.avgPrice, "*\n") +
                "\uD83C\uDFC6 Top Sale: *".concat(stats.topSale, "*\n\n") +
                "\u26A1 Powered by Solana blockchain")];
    });
}); });
// Обработчик текстовых сообщений (для ввода адреса кошелька)
bot.on('message', function (ctx) {
    // Проверяем, является ли сообщение текстовым
    if (!ctx.message || !('text' in ctx.message))
        return;
    var text = ctx.message.text;
    if (!text)
        return;
    if (text && text.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        // Похоже на Solana адрес
        if (ctx.session) {
            ctx.session.walletAddress = text;
            return ctx.reply('✅ Wallet connected successfully! Use /wallet to view details.');
        }
    }
    // Обработка кнопок клавиатуры
    switch (text) {
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
bot.command('help', function (ctx) {
    return ctx.replyWithMarkdown("\u2753 *Gokens Bot Help*\n\n" +
        "*Main Commands:*\n" +
        "/start - Start the bot\n" +
        "/wallet - Manage wallet\n" +
        "/portfolio - View your assets\n" +
        "/marketplace - Browse NFTs\n" +
        "/buy - Purchase tokens\n" +
        "/sell - Sell your tokens\n" +
        "/stats - Platform statistics\n\n" +
        "*Features:*\n" +
        "\u2022 Fractional ownership of art\n" +
        "\u2022 Gaming NFT marketplace\n" +
        "\u2022 Real-time price updates\n" +
        "\u2022 Secure Solana transactions\n\n" +
        "*Support:* @gokens_support");
});
// Вспомогательная функция для расчета стоимости портфеля
function calculatePortfolioValue(portfolio) {
    var total = 0;
    portfolio.artNFTs.forEach(function (nft) {
        total += parseFloat(nft.value || '0');
    });
    portfolio.gameAssets.forEach(function (asset) {
        total += parseFloat(asset.value || '0');
    });
    portfolio.fractionalTokens.forEach(function (token) {
        total += parseFloat(token.value || '0');
    });
    return total.toFixed(2);
}
// Обработка ошибок
bot.catch(function (err, ctx) {
    console.error("Error for ".concat(ctx.updateType, ":"), err);
    ctx.reply('❌ An error occurred. Please try again later.');
});
// Запускаем бота
bot.launch()
    .then(function () {
    console.log('🤖 Gokens Bot is running!');
    console.log('🔗 Connected to Solana:', process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899');
})
    .catch(function (err) {
    console.error('Failed to start bot:', err);
});
// Graceful stop
process.once('SIGINT', function () { return bot.stop('SIGINT'); });
process.once('SIGTERM', function () { return bot.stop('SIGTERM'); });
