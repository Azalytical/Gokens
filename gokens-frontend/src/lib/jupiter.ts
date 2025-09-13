// lib/jupiter.ts
// Jupiter API интеграция для обмена токенов

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4';

// Основные токены для демо
export const TOKENS = {
  SOL: {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  USDC: {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  USDT: {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'USDT',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
  },
  GOKENS: {
    address: 'GokensTokenAddressHere123456789', // Ваш токен
    symbol: 'GOKENS',
    name: 'Gokens Token',
    decimals: 9,
    logoURI: '/gokens-logo.png'
  }
};

// Интерфейсы
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

// Получение списка токенов
export async function getTokenList(): Promise<TokenInfo[]> {
  try {
    const response = await fetch('https://token.jup.ag/strict');
    const tokens = await response.json();
    // Добавляем наш токен в список
    return [...tokens, TOKENS.GOKENS];
  } catch (error) {
    console.error('Error fetching token list:', error);
    // Возвращаем базовый список при ошибке
    return Object.values(TOKENS);
  }
}

// Получение цены токена
export async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${tokenAddress}`);
    const data = await response.json();
    return data.data[tokenAddress]?.price || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

// Получение котировки для обмена
export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50 // 0.5% slippage по умолчанию
): Promise<QuoteResponse | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false'
    });

    const response = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const quote = await response.json();
    return quote;
  } catch (error) {
    console.error('Error getting quote:', error);
    return null;
  }
}

// Создание транзакции для свапа
export async function getSwapTransaction(
  quote: QuoteResponse,
  userPublicKey: string
): Promise<SwapTransaction | null> {
  try {
    const response = await fetch(`${JUPITER_QUOTE_API}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const swapData = await response.json();
    return swapData;
  } catch (error) {
    console.error('Error getting swap transaction:', error);
    return null;
  }
}

// Выполнение свапа
export async function executeSwap(
  connection: Connection,
  swapTransaction: string,
  wallet: any
): Promise<string | null> {
  try {
    // Десериализуем транзакцию
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    // Подписываем транзакцию
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Отправляем транзакцию
    const rawTransaction = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      maxRetries: 2
    });
    
    // Подтверждаем транзакцию
    await connection.confirmTransaction(txid, 'confirmed');
    
    return txid;
  } catch (error) {
    console.error('Error executing swap:', error);
    return null;
  }
}

// Форматирование суммы токена
export function formatTokenAmount(amount: string | number, decimals: number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = value / Math.pow(10, decimals);
  return formatted.toFixed(4);
}

// Получение баланса токена
export async function getTokenBalance(
  connection: Connection,
  tokenAddress: string,
  walletAddress: string
): Promise<number> {
  try {
    if (tokenAddress === TOKENS.SOL.address) {
      // Для SOL получаем баланс напрямую
      const balance = await connection.getBalance(new PublicKey(walletAddress));
      return balance / Math.pow(10, TOKENS.SOL.decimals);
    } else {
      // Для других токенов используем getTokenAccountsByOwner
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(walletAddress),
        { mint: new PublicKey(tokenAddress) }
      );
      
      if (tokenAccounts.value.length === 0) {
        return 0;
      }
      
      const balance = tokenAccounts.value[0].account.lamports;
      const tokenInfo = Object.values(TOKENS).find(t => t.address === tokenAddress);
      const decimals = tokenInfo?.decimals || 9;
      
      return balance / Math.pow(10, decimals);
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

// Проверка доступных маршрутов
export async function checkRoutes(
  inputMint: string,
  outputMint: string
): Promise<boolean> {
  try {
    const quote = await getQuote(inputMint, outputMint, 1000000, 50);
    return quote !== null && quote.routePlan.length > 0;
  } catch (error) {
    console.error('Error checking routes:', error);
    return false;
  }
}

// Получение статистики обмена
export interface SwapStats {
  priceImpact: string;
  minimumReceived: string;
  fee: string;
  route: string;
}

export function getSwapStats(quote: QuoteResponse): SwapStats {
  const priceImpact = quote.priceImpactPct || '0';
  const slippage = quote.slippageBps / 10000; // Convert basis points to percentage
  const outputAmount = parseFloat(quote.outAmount);
  const minimumReceived = outputAmount * (1 - slippage);
  
  // Определяем маршрут (упрощенно)
  const route = quote.routePlan.length > 1 
    ? `Multi-hop (${quote.routePlan.length} steps)` 
    : 'Direct swap';
  
  return {
    priceImpact: `${parseFloat(priceImpact).toFixed(2)}%`,
    minimumReceived: minimumReceived.toString(),
    fee: '0.0025', // Jupiter fee
    route
  };
}

// Экспорт всех функций для удобства
export const Jupiter = {
  getTokenList,
  getTokenPrice,
  getQuote,
  getSwapTransaction,
  executeSwap,
  formatTokenAmount,
  getTokenBalance,
  checkRoutes,
  getSwapStats,
  TOKENS
};