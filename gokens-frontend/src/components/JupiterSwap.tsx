// components/JupiterSwap.tsx
// Компонент для обмена токенов через Jupiter

import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ArrowDownUp, Settings, Info, Loader2, AlertCircle } from 'lucide-react';
import { Jupiter, TOKENS, TokenInfo, QuoteResponse } from '@/lib/jupiter';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function JupiterSwap() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  // Состояния
  const [inputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [priceImpact, setPriceImpact] = useState('0');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputBalance, setInputBalance] = useState(0);
  const [outputBalance, setOutputBalance] = useState(0);
  const [txSignature, setTxSignature] = useState('');

  // Получение балансов
  useEffect(() => {
    if (wallet.publicKey) {
      // Получаем баланс входного токена
      Jupiter.getTokenBalance(connection, inputToken.address, wallet.publicKey.toString())
        .then((balance: number) => setInputBalance(balance))
        .catch((err: any) => console.error('Error fetching input balance:', err));
      
      // Получаем баланс выходного токена
      Jupiter.getTokenBalance(connection, outputToken.address, wallet.publicKey.toString())
        .then((balance: number) => setOutputBalance(balance))
        .catch((err: any) => console.error('Error fetching output balance:', err));
    }
  }, [wallet.publicKey, connection, inputToken, outputToken]);

  // Получение котировки при изменении суммы
  useEffect(() => {
    const getQuoteDebounced = setTimeout(async () => {
      if (inputAmount && parseFloat(inputAmount) > 0) {
        setLoading(true);
        setError('');
        
        try {
          const amount = parseFloat(inputAmount) * Math.pow(10, inputToken.decimals);
          const quoteResponse = await Jupiter.getQuote(
            inputToken.address,
            outputToken.address,
            amount,
            slippage * 100 // Convert to basis points
          );
          
          if (quoteResponse) {
            setQuote(quoteResponse);
            const output = parseFloat(quoteResponse.outAmount) / Math.pow(10, outputToken.decimals);
            setOutputAmount(output.toFixed(6));
            setPriceImpact(quoteResponse.priceImpactPct || '0');
          } else {
            setError('No route found for this swap');
            setOutputAmount('');
          }
        } catch (err) {
          console.error('Error getting quote:', err);
          setError('Failed to get quote');
          setOutputAmount('');
        } finally {
          setLoading(false);
        }
      } else {
        setOutputAmount('');
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(getQuoteDebounced);
  }, [inputAmount, inputToken, outputToken, slippage]);

  // Функция обмена токенов местами
  const switchTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
    setInputBalance(outputBalance);
    setOutputBalance(inputBalance);
  };

  // Выполнение свапа
  const executeSwap = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !quote) {
      setError('Please connect wallet and enter amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Получаем транзакцию для свапа
      const swapTransaction = await Jupiter.getSwapTransaction(
        quote,
        wallet.publicKey.toString()
      );
      
      if (!swapTransaction) {
        throw new Error('Failed to create swap transaction');
      }
      
      // Выполняем транзакцию
      const txid = await Jupiter.executeSwap(
        connection,
        swapTransaction.swapTransaction,
        wallet
      );
      
      if (txid) {
        setTxSignature(txid);
        setSuccess(`Swap successful! Transaction: ${txid.substring(0, 8)}...`);
        
        // Обновляем балансы
        setTimeout(() => {
          if (wallet.publicKey) {
            Jupiter.getTokenBalance(connection, inputToken.address, wallet.publicKey.toString())
              .then((balance: number) => setInputBalance(balance));
            Jupiter.getTokenBalance(connection, outputToken.address, wallet.publicKey.toString())
              .then((balance: number) => setOutputBalance(balance));
          }
        }, 2000);
        
        // Очищаем поля
        setInputAmount('');
        setOutputAmount('');
        setQuote(null);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  // Установка максимальной суммы
  const setMaxAmount = () => {
    if (inputToken.address === TOKENS.SOL.address) {
      // Для SOL оставляем немного на комиссии
      const maxAmount = Math.max(0, inputBalance - 0.01);
      setInputAmount(maxAmount.toString());
    } else {
      setInputAmount(inputBalance.toString());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Token Swap
          </h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Slippage Tolerance</span>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map(value => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded text-sm ${
                      slippage === value 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                  className="w-16 px-2 py-1 bg-gray-700 rounded text-sm text-center"
                  step="0.1"
                  min="0.1"
                  max="5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Input Token */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-400">
              Balance: {inputBalance.toFixed(4)} {inputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={setMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300"
              >
                MAX
              </button>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <img src={inputToken.logoURI} alt={inputToken.symbol} className="w-6 h-6 rounded-full" />
              <span>{inputToken.symbol}</span>
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-2">
          <button
            onClick={switchTokens}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition hover:rotate-180 duration-300"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* Output Token */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-400">
              Balance: {outputBalance.toFixed(4)} {outputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="number"
                value={outputAmount}
                placeholder="0.00"
                readOnly
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-2xl focus:outline-none opacity-75"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <img src={outputToken.logoURI} alt={outputToken.symbol} className="w-6 h-6 rounded-full" />
              <span>{outputToken.symbol}</span>
            </button>
          </div>
        </div>

        {/* Price Info */}
        {quote && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span>
                1 {inputToken.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4)} {outputToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={parseFloat(priceImpact) > 1 ? 'text-yellow-400' : 'text-green-400'}>
                {parseFloat(priceImpact).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network Fee</span>
              <span>~0.00025 SOL</span>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
            <span className="text-sm text-green-400">{success}</span>
            {txSignature && (
              <a 
                href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-purple-400 hover:text-purple-300 mt-1"
              >
                View on Solscan →
              </a>
            )}
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={!wallet.connected || !quote || loading || !inputAmount}
          className={`w-full py-4 rounded-lg font-bold transition flex items-center justify-center space-x-2 ${
            wallet.connected && quote && inputAmount && !loading
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : !wallet.connected ? (
            'Connect Wallet'
          ) : !inputAmount ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </button>

        {/* Powered by Jupiter */}
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">Powered by</span>
          <span className="text-xs text-purple-400 ml-1">Jupiter Aggregator</span>
        </div>
      </div>
    </div>
  );
}