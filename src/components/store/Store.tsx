'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { usePoints } from '@/contexts/PointsContext';
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
  const { language, t } = useLanguage();
  const { getCurrentUser } = useUser();
  const { coins, level, addCoins, removeCoins } = usePoints();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [mounted, setMounted] = useState(false);
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
          localStorage.setItem('customTheme', JSON.stringify(item.data.colors));
          window.dispatchEvent(new CustomEvent('customThemeChange', { detail: item.data.colors }));
          
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
          localStorage.setItem('userAvatar', item.data.avatarUrl);
          window.dispatchEvent(new CustomEvent('avatarChange', { detail: item.data.avatarUrl }));
        }
        break;
        
      case 'backgrounds':
        if (item.data?.backgroundUrl) {
          const backgroundId = `custom-${item.id}`;
          localStorage.setItem('selectedBackground', backgroundId);
          localStorage.setItem('customBackgroundValue', item.data.backgroundUrl);
          window.dispatchEvent(new CustomEvent('backgroundChange', { detail: { backgroundId } }));
        }
        break;
        
      case 'badges':
        localStorage.setItem('equippedBadge', item.id);
        window.dispatchEvent(new CustomEvent('badgeChange', { detail: item.id }));
        break;
        
      case 'effects':
        localStorage.setItem('activeEffect', item.id);
        window.dispatchEvent(new CustomEvent('effectChange', { detail: item.id }));
        
        document.body.classList.remove('sparkle-effect', 'fire-effect', 'rainbow-effect');
        
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

    const categoryToKey: Record<string, string> = {
      themes: 'theme',
      avatars: 'avatar',
      backgrounds: 'background',
      badges: 'badge',
      effects: 'effect'
    };
    const key = categoryToKey[item.category] || item.category;

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
      case 'common': return '#6b7280';
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
    { id: 'all', name: t.storeAll, icon: '🛍️' },
    { id: 'themes', name: t.storeThemes, icon: '🎨' },
    { id: 'avatars', name: t.storeAvatars, icon: '👤' },
    { id: 'backgrounds', name: t.storeBackgrounds, icon: '🖼️' },
    { id: 'badges', name: t.storeBadges, icon: '🏆' },
    { id: 'effects', name: t.storeEffects, icon: '✨' },
    { id: 'services', name: t.newServices, icon: '⚡' }
  ];

  if (!mounted) {
    return null;
  }

  if (!isOpen) return null;

  const actualPrice = (item: StoreItem) => 
    specialOfferItems.includes(item.id) ? Math.floor(item.price * 0.5) : item.price;

  const isEquipped = (item: StoreItem) => {
    const categoryToKey: Record<string, string> = {
      themes: 'theme',
      avatars: 'avatar',
      backgrounds: 'background',
      badges: 'badge',
      effects: 'effect'
    };
    const key = categoryToKey[item.category] || item.category;
    return userInventory.equippedItems[key as keyof typeof userInventory.equippedItems] === item.id;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={`fixed inset-4 md:inset-8 lg:inset-12 rounded-2xl shadow-2xl overflow-hidden z-[9999] flex flex-col ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${
          theme === 'light' ? 'border-gray-200' : 'border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {t.store}
              </h2>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.storeDescription}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Stats Bar */}
          <div className={`flex gap-4 p-3 rounded-xl ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.coins}
              </span>
              <span className={`font-bold text-yellow-500`}>{coins}</span>
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.level}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`}>{level}</span>
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.items}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`}>{userInventory.purchasedItems.length}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? theme === 'light'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'light'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.noItemsInCategory}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    theme === 'light' ? 'bg-white border border-gray-200 shadow-sm hover:shadow-lg' : 'bg-gray-800 border border-gray-700 hover:shadow-xl'
                  }`}
                >
                  {/* Item Preview */}
                  <div className={`h-40 relative overflow-hidden ${
                    theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
                  }`}>
                    {item.category === 'themes' && (
                      <div 
                        className="h-full flex items-center justify-center p-4"
                        style={{ 
                          background: item.data?.colors?.primary 
                            ? `linear-gradient(135deg, ${item.data.colors.primary}, ${item.data.colors.secondary})` 
                            : 'linear-gradient(135deg, #667eea, #764ba2)'
                        }}
                      >
                        <div className="grid grid-cols-2 gap-2 w-full max-w-24">
                          <div className="aspect-square rounded-lg" style={{ backgroundColor: item.data?.colors?.primary }} />
                          <div className="aspect-square rounded-lg" style={{ backgroundColor: item.data?.colors?.secondary }} />
                          <div className="aspect-square rounded-lg" style={{ backgroundColor: item.data?.colors?.accent }} />
                          <div className="aspect-square rounded-lg" style={{ backgroundColor: item.data?.colors?.background }} />
                        </div>
                      </div>
                    )}

                    {item.category === 'avatars' && (
                      <div className="h-full flex items-center justify-center p-4">
                        <img 
                          src={item.data?.avatarUrl} 
                          alt={item.name}
                          className="w-20 h-20 rounded-full object-cover shadow-lg"
                        />
                      </div>
                    )}

                    {item.category === 'backgrounds' && (
                      <div className="h-full relative">
                        <img 
                          src={item.data?.backgroundUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {item.category === 'badges' && (
                      <div className="h-full flex items-center justify-center p-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${getRarityColor(item.rarity)}, ${getRarityColor(item.rarity)}80)`,
                            border: `3px solid ${getRarityColor(item.rarity)}`
                          }}
                        >
                          <span className="text-3xl">{item.icon}</span>
                        </div>
                      </div>
                    )}

                    {item.category === 'effects' && (
                      <div className="h-full flex items-center justify-center p-4">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
                          style={{
                            background: `linear-gradient(135deg, ${getRarityColor(item.rarity)}40, ${getRarityColor(item.rarity)}20)`,
                            border: `2px solid ${getRarityColor(item.rarity)}60`
                          }}
                        >
                          <div className="relative">
                            <span className="text-4xl block">{item.icon}</span>
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    {item.category === 'services' && (
                      <div className="h-full flex items-center justify-center p-4">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${getRarityColor(item.rarity)}40, ${getRarityColor(item.rarity)}20)`,
                            border: `2px solid ${getRarityColor(item.rarity)}60`
                          }}
                        >
                          <div className="relative">
                            <span className="text-4xl block">{item.icon}</span>
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    {specialOfferItems.includes(item.id) && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -50%
                      </div>
                    )}

                    <button
                      onClick={() => showItemPreview(item)}
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        theme === 'light'
                          ? 'bg-white/90 text-blue-600 hover:bg-white'
                          : 'bg-gray-800/90 text-blue-400 hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold text-sm ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {language === 'ar' ? item.nameAr : item.name}
                      </h3>
                      <div 
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ 
                          backgroundColor: getRarityColor(item.rarity) + '20',
                          color: getRarityColor(item.rarity)
                        }}
                      >
                        {item.rarity}
                      </div>
                    </div>

                    <p className={`text-xs mb-3 line-clamp-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {language === 'ar' ? item.descriptionAr : item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className={`font-bold ${
                        theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                      }`}>
                        {specialOfferItems.includes(item.id) && (
                          <span className={`text-xs line-through mr-1 ${
                            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {item.price}
                          </span>
                        )}
                        {actualPrice(item)} 🪙
                      </div>
                      
                      {!userInventory.purchasedItems.includes(item.id) ? (
                        <button
                          onClick={() => purchaseItem(item)}
                          disabled={coins < actualPrice(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            coins >= actualPrice(item)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {coins >= actualPrice(item) 
                            ? t.buy
                            : t.insufficient}
                        </button>
                      ) : (
                        <button
                          onClick={() => equipItem(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isEquipped(item)
                              ? 'bg-purple-500 text-white'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isEquipped(item) 
                            ? t.equipped
                            : t.equip}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
              }`}>
                {selectedItem.icon}
              </div>
              <h3 className={`font-bold text-lg mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {language === 'ar' ? selectedItem.nameAr : selectedItem.name}
              </h3>
              <p className={`text-sm mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {language === 'ar' ? selectedItem.descriptionAr : selectedItem.description}
              </p>
              <div className={`text-3xl font-bold mb-2 ${
                theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
              }`}>
                {actualPrice(selectedItem)} 🪙
              </div>
              {specialOfferItems.includes(selectedItem.id) && (
                <div className="text-sm text-red-500 font-medium mb-4">
                  {t.specialOffer} {Math.floor(selectedItem.price * 0.5)} 🪙
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {t.storeCancel}
                </button>
                <button
                  onClick={confirmPurchase}
                  disabled={coins < actualPrice(selectedItem)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    coins >= actualPrice(selectedItem)
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {coins >= actualPrice(selectedItem) 
                    ? t.purchase
                    : t.insufficient}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && itemForPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
          <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <div className="text-center">
              <h3 className={`font-bold text-lg mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {t.itemPreview}
              </h3>
              
              <div className={`h-48 rounded-xl mb-4 flex items-center justify-center overflow-hidden ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
              }`}>
                {itemForPreview.category === 'themes' && (
                  <div 
                    className="h-full w-full flex items-center justify-center p-6"
                    style={{ 
                      background: itemForPreview.data?.colors?.primary 
                        ? `linear-gradient(135deg, ${itemForPreview.data.colors.primary}, ${itemForPreview.data.colors.secondary})` 
                        : 'linear-gradient(135deg, #667eea, #764ba2)'
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3 w-full max-w-32">
                      <div className="aspect-square rounded-lg shadow-md" style={{ backgroundColor: itemForPreview.data?.colors?.primary }} />
                      <div className="aspect-square rounded-lg shadow-md" style={{ backgroundColor: itemForPreview.data?.colors?.secondary }} />
                      <div className="aspect-square rounded-lg shadow-md" style={{ backgroundColor: itemForPreview.data?.colors?.accent }} />
                      <div className="aspect-square rounded-lg shadow-md" style={{ backgroundColor: itemForPreview.data?.colors?.background }} />
                    </div>
                  </div>
                )}

                {itemForPreview.category === 'avatars' && (
                  <div className="h-full w-full flex items-center justify-center p-6">
                    <img 
                      src={itemForPreview.data?.avatarUrl} 
                      alt={itemForPreview.name}
                      className="w-24 h-24 rounded-full object-cover shadow-xl"
                    />
                  </div>
                )}

                {itemForPreview.category === 'backgrounds' && (
                  <img 
                    src={itemForPreview.data?.backgroundUrl} 
                    alt={itemForPreview.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}

                {itemForPreview.category === 'badges' && (
                  <div className="h-full w-full flex items-center justify-center p-6">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${getRarityColor(itemForPreview.rarity)}, ${getRarityColor(itemForPreview.rarity)}80)`,
                        border: `4px solid ${getRarityColor(itemForPreview.rarity)}`
                      }}
                    >
                      <span className="text-5xl">{itemForPreview.icon}</span>
                    </div>
                  </div>
                )}

                {itemForPreview.category === 'effects' && (
                  <div className="h-full w-full flex items-center justify-center p-6">
                    <div
                      className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl animate-pulse"
                      style={{
                        background: `linear-gradient(135deg, ${getRarityColor(itemForPreview.rarity)}40, ${getRarityColor(itemForPreview.rarity)}20)`,
                        border: `3px solid ${getRarityColor(itemForPreview.rarity)}60`
                      }}
                    >
                      <div className="relative">
                        <span className="text-6xl block">{itemForPreview.icon}</span>
                        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
                        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-yellow-400" />
                      </div>
                    </div>
                  </div>
                )}

                {itemForPreview.category === 'services' && (
                  <div className="h-full w-full flex items-center justify-center p-6">
                    <div
                      className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl"
                      style={{
                        background: `linear-gradient(135deg, ${getRarityColor(itemForPreview.rarity)}40, ${getRarityColor(itemForPreview.rarity)}20)`,
                        border: `3px solid ${getRarityColor(itemForPreview.rarity)}60`
                      }}
                    >
                      <div className="relative">
                        <span className="text-6xl block">{itemForPreview.icon}</span>
                        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-blue-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h3 className={`font-semibold mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {language === 'ar' ? itemForPreview.nameAr : itemForPreview.name}
              </h3>
              <p className={`text-sm mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {language === 'ar' ? itemForPreview.descriptionAr : itemForPreview.description}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {t.close}
                </button>
                {!userInventory.purchasedItems.includes(itemForPreview.id) && (
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      purchaseItem(itemForPreview);
                    }}
                    disabled={coins < actualPrice(itemForPreview)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      coins >= actualPrice(itemForPreview)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {coins >= actualPrice(itemForPreview) 
                      ? t.purchase
                      : t.insufficient}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
