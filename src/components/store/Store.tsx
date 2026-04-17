'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useGamification } from '@/contexts/GamificationContext';
import { StoreItem, defaultStoreItems, specialOfferItems } from './storeProducts';

interface UserInventory {
  coins: number;
  level: number;
  experience: number;
  purchasedItems: string[];
  equippedItems: {
    theme?: string;
    avatar?: string;
    background?: string;
    badge?: string;
  };
}

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Store({ isOpen, onClose }: StoreProps) {
  const { theme } = useTheme();
  const { getCurrentUser } = useUser();
  const { coins, level, addCoins, removeCoins } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<{ [key: string]: number }>({});
  const [userInventory, setUserInventory] = useState<UserInventory>({
    coins: 0,
    level: 1,
    experience: 0,
    purchasedItems: [],
    equippedItems: {}
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [itemForPreview, setItemForPreview] = useState<StoreItem | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserInventory();
    }
    setStoreItems(defaultStoreItems);
  }, [currentUser]);

  const loadUserInventory = () => {
    if (!currentUser) return;

    const savedInventory = localStorage.getItem(`userInventory_${currentUser.accountId}`);
    if (savedInventory) {
      try {
        const parsed = JSON.parse(savedInventory);
        setUserInventory(parsed);
        
        setStoreItems(prevItems => 
          prevItems.map(item => ({
            ...item,
            purchased: parsed.purchasedItems.includes(item.id),
            equipped: Object.values(parsed.equippedItems).includes(item.id)
          }))
        );
      } catch (error) {
        console.error('Failed to load inventory:', error);
      }
    }
  };

  const saveUserInventory = (inventory: UserInventory) => {
    if (!currentUser) return;
    
    localStorage.setItem(`userInventory_${currentUser.accountId}`, JSON.stringify(inventory));
    setUserInventory(inventory);
    
    setStoreItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        purchased: inventory.purchasedItems.includes(item.id),
        equipped: Object.values(inventory.equippedItems).includes(item.id)
      }))
    );
  };

  const purchaseItem = (item: StoreItem) => {
    if (!currentUser) return;
    
    const actualPrice = specialOfferItems.includes(item.id) 
      ? Math.floor(item.price * 0.5) 
      : item.price;
    
    if (coins < actualPrice) {
      alert('Not enough coins!');
      return;
    }

    if (userInventory.purchasedItems.includes(item.id)) {
      alert('You already own this item!');
      return;
    }

    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const showItemPreview = (item: StoreItem) => {
    setItemForPreview(item);
    setShowPreviewModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedItem || !currentUser) return;

    const actualPrice = specialOfferItems.includes(selectedItem.id) 
      ? Math.floor(selectedItem.price * 0.5) 
      : selectedItem.price;

    removeCoins(actualPrice);

    const updatedInventory = {
      ...userInventory,
      purchasedItems: [...userInventory.purchasedItems, selectedItem.id]
    };

    saveUserInventory(updatedInventory);
    setShowPurchaseModal(false);
    setSelectedItem(null);

    applyItemEffects(selectedItem);
  };

  const applyItemEffects = (item: StoreItem) => {
    switch (item.category) {
      case 'themes':
        if (item.data?.colors) {
          // Apply custom theme
          localStorage.setItem('customTheme', JSON.stringify(item.data.colors));
          window.dispatchEvent(new CustomEvent('customThemeChange', { detail: item.data.colors }));
          
          // Update timer settings color while preserving user's custom settings
          const currentTimerSettings = localStorage.getItem('timer_settings');
          let timerSettings;
          if (currentTimerSettings) {
            try {
              const parsed = JSON.parse(currentTimerSettings);
              timerSettings = {
                ...parsed,
                color: item.data.colors.primary || parsed.color
              };
            } catch (error) {
              console.error('Error parsing timer settings:', error);
              timerSettings = {
                color: item.data.colors.primary || '#ffffff',
                font: 'font-mono',
                design: 'minimal',
                size: 'text-6xl'
              };
            }
          } else {
            timerSettings = {
              color: item.data.colors.primary || '#ffffff',
              font: 'font-mono',
              design: 'minimal',
              size: 'text-6xl'
            };
          }
          localStorage.setItem('timer_settings', JSON.stringify(timerSettings));
          window.dispatchEvent(new CustomEvent('timerSettingsChanged', { detail: timerSettings }));
        }
        break;
        
      case 'avatars':
        if (item.data?.avatarUrl) {
          // Apply avatar
          localStorage.setItem('userAvatar', item.data.avatarUrl);
          window.dispatchEvent(new CustomEvent('avatarChange', { detail: item.data.avatarUrl }));
        }
        break;
        
      case 'backgrounds':
        if (item.data?.backgroundUrl) {
          // Apply background
          const backgroundId = `custom-${item.id}`;
          localStorage.setItem('selectedBackground', backgroundId);
          localStorage.setItem('customBackgroundValue', item.data.backgroundUrl);
          window.dispatchEvent(new CustomEvent('backgroundChange', { detail: { backgroundId } }));
        }
        break;
        
      case 'badges':
        // Apply badge (stored in user profile)
        localStorage.setItem('equippedBadge', item.id);
        window.dispatchEvent(new CustomEvent('badgeChange', { detail: item.id }));
        break;
        
      case 'effects':
        // Apply visual effect
        localStorage.setItem('activeEffect', item.id);
        window.dispatchEvent(new CustomEvent('effectChange', { detail: item.id }));
        
        // Remove all effect classes first
        document.body.classList.remove('sparkle-effect', 'fire-effect', 'rainbow-effect');
        
        // Add visual effect to body
        if (item.id === 'effect-sparkle') {
          document.body.classList.add('sparkle-effect');
        } else if (item.id === 'effect-fire') {
          document.body.classList.add('fire-effect');
        } else if (item.id === 'effect-rainbow') {
          document.body.classList.add('rainbow-effect');
        }
        break;
    }
  };

  const equipItem = (item: StoreItem) => {
    if (!userInventory.purchasedItems.includes(item.id)) return;

    // Convert plural category to singular key
    const categoryToKey: Record<string, string> = {
      themes: 'theme',
      avatars: 'avatar',
      backgrounds: 'background',
      badges: 'badge',
      effects: 'effect'
    };
    const key = categoryToKey[item.category] || item.category;

    // Check if item is already equipped
    if (userInventory.equippedItems[key as keyof typeof userInventory.equippedItems] === item.id) return;

    const updatedInventory = {
      ...userInventory,
      equippedItems: { ...userInventory.equippedItems, [key]: item.id }
    };

    saveUserInventory(updatedInventory);
    applyItemEffects(item);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const filteredItems = storeItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const categories = [
    { id: 'themes', name: 'Themes', icon: '??' },
    { id: 'avatars', name: 'Avatars', icon: '??' },
    { id: 'backgrounds', name: 'Backgrounds', icon: '??' },
    { id: 'badges', name: 'Badges', icon: '??' },
    { id: 'effects', name: 'Effects', icon: '??' }
  ];

  if (!mounted) {
    return (
      <div className={`min-h-screen p-6 ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      }`}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-7xl max-h-[90vh] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out z-[9999] overflow-hidden ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}
      >
        <div className={`flex h-[90vh] overflow-hidden ${
          theme === 'light' 
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900'
    }`}>
      {/* Sidebar */}
      <div className={`w-80 min-h-screen backdrop-blur-xl ${
        theme === 'light' 
          ? 'bg-white/70 border-r border-gray-200/50' 
          : 'bg-gray-900/70 border-r border-gray-700/50'
      }`}>
        <div className="p-6">
          {/* Back Button */}
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`mb-6 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              theme === 'light'
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Close Store
          </button>

          {/* User Stats */}
          <div className={`p-6 rounded-3xl mb-6 ${
            theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-800 shadow-2xl'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Your Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Coins</span>
                <span className={`font-bold text-yellow-500`}>{coins}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Level</span>
                <span className={`font-bold ${
                  theme === 'light' ? 'text-purple-600' : 'text-purple-400'
                }`}>{level}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Items</span>
                <span className={`font-bold ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>{userInventory.purchasedItems.length}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? theme === 'light'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-900/30 text-blue-400'
                  : theme === 'light'
                    ? 'hover:bg-gray-100 text-gray-700'
                    : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <span className="mr-2">??</span> All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? theme === 'light'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-900/30 text-blue-400'
                    : theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Special Offers Banner */}
          <div className={`mb-8 p-6 rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                  <span className="text-3xl">??</span>
                  Special Offers - Limited Time!
                </h2>
                <p className="text-white/90 font-medium">
                  Get exclusive items with special discounts before they're gone!
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">-50%</div>
                <div className="text-sm text-white/80">Selected Items</div>
              </div>
            </div>
          </div>

          {/* Store Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 hover:rotate-1 ${
                  theme === 'light' ? 'bg-white shadow-xl' : 'bg-gray-800 shadow-2xl'
                }`}
              >
                {/* Item Preview */}
                <div className={`h-48 relative overflow-hidden ${
                  theme === 'light' ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-gradient-to-br from-gray-700 to-gray-800'
                }`}>
                  {item.category === 'themes' && (
                    <div 
                      className="h-full flex items-center justify-center"
                      style={{ 
                        background: item.data?.colors?.primary 
                          ? `linear-gradient(135deg, ${item.data.colors.primary}40, ${item.data.colors.secondary}40)` 
                          : undefined
                      }}
                    >
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-lg ${
                        theme === 'light' ? 'bg-white shadow-xl' : 'bg-gray-700 shadow-2xl'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                  )}

                  {item.category === 'avatars' && (
                    <div className="h-full flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg ${
                        theme === 'light' ? 'bg-white shadow-xl' : 'bg-gray-700 shadow-2xl'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                  )}

                  {item.category === 'backgrounds' && (
                    <div className="h-full relative">
                      <img 
                        src={item.data?.backgroundUrl || '/placeholder.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  )}

                  {item.category === 'badges' && (
                    <div className="h-full flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg ${
                        theme === 'light' ? 'bg-white shadow-xl' : 'bg-gray-700 shadow-2xl'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                  )}

                  {item.category === 'effects' && (
                    <div className="h-full flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl animate-pulse ${
                        theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-700 shadow-2xl'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                  )}

                  {/* Special Offer Badge */}
                  {specialOfferItems.includes(item.id) && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      -50%
                    </div>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => showItemPreview(item)}
                    className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      theme === 'light'
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                {/* Item Details */}
                <div className={`relative p-6 border-t ${
                  theme === 'light' ? 'border-gray-200/50' : 'border-gray-700/50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative group-hover:scale-110 transition-transform ${
                      theme === 'light' 
                        ? 'bg-gradient-to-br from-gray-100 to-gray-200' 
                        : 'bg-gradient-to-br from-gray-700 to-gray-800'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                      {item.icon}
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: getRarityColor(item.rarity) + '20',
                        color: getRarityColor(item.rarity),
                        border: `1px solid ${getRarityColor(item.rarity)}30`
                      }}
                    >
                      {item.rarity}
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {item.description}
                  </p>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${
                      theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                    }`}>
                      {specialOfferItems.includes(item.id) && (
                        <span className="text-sm line-through text-gray-400 ml-2">
                          {item.price}
                        </span>
                      )}
                      {specialOfferItems.includes(item.id) 
                        ? Math.floor(item.price * 0.5) 
                        : item.price}
                      <span className="text-sm ml-1">??</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {!userInventory.purchasedItems.includes(item.id) ? (
                        <button
                          onClick={() => purchaseItem(item)}
                          disabled={coins < (specialOfferItems.includes(item.id) ? Math.floor(item.price * 0.5) : item.price)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            coins >= (specialOfferItems.includes(item.id) ? Math.floor(item.price * 0.5) : item.price)
                              ? theme === 'light'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-green-500/30 hover:transform hover:scale-105'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/40 hover:transform hover:scale-105'
                              : 'bg-gray-300/50 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {coins >= (specialOfferItems.includes(item.id) ? Math.floor(item.price * 0.5) : item.price) ? 'Buy' : 'Insufficient'}
                        </button>
                      ) : (
                        <button
                          onClick={() => equipItem(item)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            (() => {
                              const categoryToKey: Record<string, string> = {
                                themes: 'theme',
                                avatars: 'avatar',
                                backgrounds: 'background',
                                badges: 'badge',
                                effects: 'effect'
                              };
                              const key = categoryToKey[item.category] || item.category;
                              return userInventory.equippedItems[key as keyof typeof userInventory.equippedItems] === item.id;
                            })()
                              ? theme === 'light'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : theme === 'light'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:shadow-blue-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/40'
                          }`}
                        >
                          {(() => {
                            const categoryToKey: Record<string, string> = {
                              themes: 'theme',
                              avatars: 'avatar',
                              backgrounds: 'background',
                              badges: 'badge',
                              effects: 'effect'
                            };
                            const key = categoryToKey[item.category] || item.category;
                            return userInventory.equippedItems[key as keyof typeof userInventory.equippedItems] === item.id ? 'Equipped' : 'Equip';
                          })()}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${
            theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setShowPurchaseModal(false)}
              className={`float-right w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="clear-both">
              {/* Header */}
              <h2 className={`text-xl font-semibold mb-4 text-center ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Confirm Purchase
              </h2>
              
              {/* Item Display */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl mx-auto mb-3 ${
                  theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                }`}>
                  {selectedItem.icon}
                </div>
                <h3 className={`font-semibold mb-1 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {selectedItem.name}
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {selectedItem.description}
                </p>
              </div>

              {/* Price */}
              <div className={`text-center mb-6`}>
                <div className={`text-3xl font-bold ${
                  theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                }`}>
                  {specialOfferItems.includes(selectedItem.id) 
                    ? Math.floor(selectedItem.price * 0.5) 
                    : selectedItem.price}
                  <span className="text-lg ml-1">??</span>
                </div>
                {specialOfferItems.includes(selectedItem.id) && (
                  <div className="text-sm text-red-500 font-medium mt-1">
                    Special offer! Save {Math.floor(selectedItem.price * 0.5)} coins
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  disabled={coins < (specialOfferItems.includes(selectedItem.id) ? Math.floor(selectedItem.price * 0.5) : selectedItem.price)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    coins >= (specialOfferItems.includes(selectedItem.id) ? Math.floor(selectedItem.price * 0.5) : selectedItem.price)
                      ? theme === 'light'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-green-700 hover:bg-green-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {coins >= (specialOfferItems.includes(selectedItem.id) ? Math.floor(selectedItem.price * 0.5) : selectedItem.price) ? 
                    'Purchase' : 
                    'Insufficient Coins'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && itemForPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${
            theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className={`float-right w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="clear-both">
              {/* Header */}
              <h2 className={`text-xl font-semibold mb-4 text-center ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Item Preview
              </h2>
              
              {/* Item Preview */}
              <div className={`h-48 rounded-xl mb-6 flex items-center justify-center ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
              }`}>
                {itemForPreview.category === 'themes' && (
                  <div 
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-5xl shadow-lg"
                    style={{ 
                      background: itemForPreview.data?.colors?.primary 
                        ? `linear-gradient(135deg, ${itemForPreview.data.colors.primary}40, ${itemForPreview.data.colors.secondary}40)` 
                        : undefined
                    }}
                  >
                    {itemForPreview.icon}
                  </div>
                )}

                {itemForPreview.category === 'avatars' && (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-lg">
                    {itemForPreview.icon}
                  </div>
                )}

                {itemForPreview.category === 'backgrounds' && (
                  <img 
                    src={itemForPreview.data?.backgroundUrl || '/placeholder.jpg'} 
                    alt={itemForPreview.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}

                {itemForPreview.category === 'badges' && (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg">
                    {itemForPreview.icon}
                  </div>
                )}

                {itemForPreview.category === 'effects' && (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 animate-pulse">
                      {itemForPreview.icon}
                    </div>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Visual effect will be applied to your interface
                    </p>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="text-center mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {itemForPreview.name}
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {itemForPreview.description}
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-gray-700 text-gray-300'
                }`} style={{ 
                  backgroundColor: getRarityColor(itemForPreview.rarity) + '20',
                  color: getRarityColor(itemForPreview.rarity),
                  border: `1px solid ${getRarityColor(itemForPreview.rarity)}30`
                }}>
                  {itemForPreview.rarity}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  Close
                </button>
                {!userInventory.purchasedItems.includes(itemForPreview.id) && (
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      purchaseItem(itemForPreview);
                    }}
                    disabled={coins < (specialOfferItems.includes(itemForPreview.id) ? Math.floor(itemForPreview.price * 0.5) : itemForPreview.price)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                      coins >= (specialOfferItems.includes(itemForPreview.id) ? Math.floor(itemForPreview.price * 0.5) : itemForPreview.price)
                        ? theme === 'light'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-green-700 hover:bg-green-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {coins >= (specialOfferItems.includes(itemForPreview.id) ? Math.floor(itemForPreview.price * 0.5) : itemForPreview.price) ? 
                      'Purchase' : 
                      'Insufficient Coins'
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
