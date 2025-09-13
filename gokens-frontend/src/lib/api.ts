
// СОЗДАТЬ НОВЫЙ файл: gokens-frontend/src/lib/api.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserData {
  userId: string;
  walletAddress: string;
  platform: string;
  kycVerified?: boolean;
}

export interface Portfolio {
  user: UserData;
  nfts: any[];
  balance: number;
  fractionalTokens: any[];
}

export interface Stats {
  totalVolume: string;
  activeUsers: number;
  nftsCreated: number;
  gamesIntegrated: number;
  dailyVolume: string;
  topCollections: Array<{
    name: string;
    volume: string;
  }>;
}

export const API = {
  // Синхронизация пользователя
  syncUser: async (userId: string, walletAddress: string, platform: string = 'web') => {
    const response = await axios.post(`${API_URL}/api/sync-user`, {
      userId,
      walletAddress,
      platform
    });
    return response.data;
  },

  // Получение портфеля
  getPortfolio: async (userId: string): Promise<Portfolio> => {
    const response = await axios.get(`${API_URL}/api/portfolio/${userId}`);
    return response.data;
  },

  // Создание транзакции
  createTransaction: async (userId: string, nftId: string, price: number) => {
    const response = await axios.post(`${API_URL}/api/create-transaction`, {
      userId,
      nftId,
      price
    });
    return response.data;
  },

  // Получение цен
  getPrices: async () => {
    const response = await axios.get(`${API_URL}/api/prices`);
    return response.data;
  },

  // KYC верификация
  verifyKYC: async (userId: string, documents: any) => {
    const response = await axios.post(`${API_URL}/api/kyc/verify`, {
      userId,
      documents
    });
    return response.data;
  },

  // Swap токенов
  createSwap: async (params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippage: number;
    userPublicKey: string;
  }) => {
    const response = await axios.post(`${API_URL}/api/swap`, params);
    return response.data;
  },

  // Получение статистики
  getStats: async (): Promise<Stats> => {
    const response = await axios.get(`${API_URL}/api/stats`);
    return response.data;
  }
};

---

// ДОБАВИТЬ в файл: gokens-frontend/src/app/page.tsx
// В начало файла после импортов

import KYCModal from '@/components/KYCModal';
import { API } from '@/lib/api';

// В компонент GokensMarketplace добавить после других useState:

const [showKYCModal, setShowKYCModal] = useState(false);
const [kycVerified, setKycVerified] = useState(false);
const [telegramUserId, setTelegramUserId] = useState<string | null>(null);

// Добавить useEffect для проверки telegram параметров:

useEffect(() => {
  // Проверяем параметры из Telegram
  const params = new URLSearchParams(window.location.search);
  const telegramId = params.get('telegram');
  const connectWallet = params.get('connect');
  
  if (telegramId) {
    setTelegramUserId(telegramId);
    // Синхронизируем с API
    if (wallet.publicKey) {
      API.syncUser(telegramId, wallet.publicKey.toString(), 'telegram-web')
        .then(() => console.log('Synced with Telegram'))
        .catch(console.error);
    }
  }
}, [wallet.publicKey]);

// Добавить функцию для обработки KYC:

const handleKYCSuccess = async () => {
  setKycVerified(true);
  showTxStatus('success', 'KYC verification completed successfully!');
  
  // Синхронизируем с Telegram если есть ID
  if (telegramUserId && wallet.publicKey) {
    await API.syncUser(telegramUserId, wallet.publicKey.toString(), 'web');
  }
};

// Добавить кнопку KYC в Hero Section после других кнопок:

{!kycVerified && wallet.connected && (
  <button 
    onClick={() => setShowKYCModal(true)}
    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition flex items-center space-x-2"
  >
    <Shield className="w-4 h-4" />
    <span>Verify KYC</span>
  </button>
)}

// В конце компонента перед закрывающим div добавить:

{/* KYC Modal */}
<KYCModal 
  isOpen={showKYCModal}
  onClose={() => setShowKYCModal(false)}
  onSuccess={handleKYCSuccess}
/>

{/* Telegram Connection Indicator */}
{telegramUserId && (
  <div className="fixed bottom-4 right-4 bg-blue-500/20 border border-blue-500/50 rounded-lg px-4 py-2">
    <p className="text-sm text-blue-400">Connected to Telegram Bot</p>
  </div>
)}