// СОЗДАТЬ файл: gokens-frontend/src/components/Navigation.tsx

"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageCircle } from 'lucide-react';

const TELEGRAM_BOT_URL = 'https://t.me/gokens_bot';

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/explore', label: 'Explore' },
    { href: '/create', label: 'Create' },
    { href: '/community', label: 'Community' },
    { href: '/stats', label: 'Stats' },
  ];

  return (
    <header className="border-b border-purple-500/20 backdrop-blur-sm bg-black/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gokens
              </span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`hover:text-purple-400 transition ${
                    pathname === item.href ? 'text-purple-400' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-purple-400 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bot</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}