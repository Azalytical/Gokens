// СОЗДАТЬ НОВЫЙ файл: gokens-frontend/src/components/KYCModal.tsx

import React, { useState } from 'react';
import { Shield, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KYCModal({ isOpen, onClose, onSuccess }: KYCModalProps) {
  const wallet = useWallet();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    idType: 'passport',
    idNumber: '',
    agreed: false
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Отправляем KYC данные на API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/kyc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: wallet.publicKey?.toString(),
          documents: formData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(3);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('KYC error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold">KYC Verification</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-purple-500' : 'bg-gray-700'}`} />
              {s < 3 && <div className="w-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="KZ">Kazakhstan</option>
              </select>
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!formData.fullName || !formData.email || !formData.country}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: ID Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({...formData, idType: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="passport">Passport</option>
                <option value="driver_license">Driver's License</option>
                <option value="national_id">National ID</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter ID number"
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Upload ID Document</p>
              <p className="text-xs text-gray-500 mt-1">(Demo - not required)</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agree"
                checked={formData.agreed}
                onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                className="mt-1"
              />
              <label htmlFor="agree" className="text-sm text-gray-400">
                I agree to the terms and conditions and authorize verification of my identity
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.idNumber || !formData.agreed || loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2">Verification Complete!</h3>
            <p className="text-gray-400">Your KYC has been successfully verified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
