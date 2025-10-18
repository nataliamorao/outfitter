import React, { useState, useCallback, useMemo } from 'react';
import { ClothingItem, Look, ClothingCategory, StorableClothingItem, Avatar } from './types';
import { FASHION_STYLES, CLOTHING_CATEGORIES, AVATARS } from './constants';
import { getFashionAdvice, virtualTryOn } from './services/geminiService';
import { UploadIcon, TrashIcon, SparklesIcon, InfoIcon, HeartIcon, HeartOutlineIcon, HangerIcon, PlusIcon, TshirtIcon } from './components/icons';
import { useCloset } from './hooks/useCloset';


function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Components
const LookCard: React.FC<{ look: Look; onToggleFavorite: (id: string) => void }> = ({ look, onToggleFavorite }) => {
  const formattedDescription = look.description
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');

  return (
    <div className="space-y-6 border-b border-zinc-200 pb-12 last:border-b-0 last:pb-0">
      {look.image && (
        <div className="relative">
          <img 
            src={look.image} 
            alt={`Look ${look.id}`}
            className="w-full max-w-lg mx-auto rounded-xl shadow-lg border border-zinc-200/80"
          />
          <button
            onClick={() => onToggleFavorite(look.id)}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-zinc-600 hover:text-rose-500 hover:scale-110 transition-all duration-200"
            aria-label={look.isFavorited ? "Desfavoritar look" : "Favoritar look"}
          >
            {look.isFavorited ? <HeartIcon className="h-6 w-6 text-rose-500" /> : <HeartOutlineIcon className="h-6 w-6" />}
          </button>
        </div>
      )}
      {look.description && (
        <div 
            className="prose prose-lg max-w-none text-zinc-700 mt-4" 
            dangerouslySetInnerHTML={{ __html: formattedDescription }}
        />
      )}
    </div>
  );
};

const ResultDisplay: React.FC<{ looks: Look[] | null, isLoading: boolean, error: string | null, onToggleFavorite: (id: string) => void }> = ({ looks, isLoading, error, onToggleFavorite }) => {
    if (isLoading) {
      return (
        <div className="space-y-12">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-8 animate-pulse border-b border-zinc-200 pb-12 last:border-b-0 last:pb-0">
              <div className="bg-zinc-200 rounded-xl w-full aspect-[4/3] max-w-lg mx-auto"></div>
              <div className="space-y-6 mt-6">
                <div className="h-6 bg-zinc-200 rounded-md w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-200 rounded-md w-full"></div>
                  <div className="h-4 bg-zinc-200 rounded-md w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>;
    }

    if (looks) {
        const favoritedLooks = looks.filter(look => look.isFavorited);

        return (
            <div className="space-y-16">
                {favoritedLooks.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-zinc-800 mb-6">Looks Favoritos</h3>
                        <div className="space-y-12">
                            {favoritedLooks.map((look) => (
                                <LookCard key={look.id} look={look} onToggleFavorite={onToggleFavorite} />
                            ))}
                        </div>
                         <hr className="my-12 border-zinc-300 border-dashed" />
                    </div>
                )}
                
                <div>
                  {favoritedLooks.length > 0 && (
                    <h3 className="text-xl font-bold text-zinc-800 mb-6">Todas as Sugestões</h3>
                  )}
                  <div className="space-y-12">
                    {looks.map((look) => (
                       <LookCard key={look.id} look={look} onToggleFavorite={onToggleFavorite} />
                    ))}
                  </div>
                </div>
            </div>
        );
    }

    return (
      <div className="text-center text-zinc-400 py-16">
        <SparklesIcon className="mx-auto h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-600">Suas sugestões de look aparecerão aqui</h3>
        <p className="mt-2 text-zinc-500">Selecione peças do seu guarda-roupa, escolha um estilo e a IA irá montar looks para você!</p>
      </div>
    );
  };


const App: React.FC = () => {
  // Global State
  const { closetItems, addClosetItem, removeClosetItem } = useCloset();
  const [activeTab, setActiveTab] = useState<'generator' | 'closet' | 'tryon'>('generator');
  
  // Generator State
  const [selectedClosetItemIds, setSelectedClosetItemIds] = useState<Set<string>>(new Set());
  const [selectedStyle, setSelectedStyle] = useState<string>(FASHION_STYLES[0].value);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [suggestNewItems, setSuggestNewItems] = useState<boolean>(false);
  const [includeShoes, setIncludeShoes] = useState<boolean>(false);
  const [includeAccessories, setIncludeAccessories] = useState<boolean>(false);
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Closet Uploader State
  const [stagedItems, setStagedItems] = useState<ClothingItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Try-on State
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(AVATARS[0].id);
  const [selectedTryOnItemIds, setSelectedTryOnItemIds] = useState<Set<string>>(new Set());
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState<boolean>(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);


  const hasUncategorizedStagedItems = useMemo(() => stagedItems.some(item => item.category === 'uncategorized'), [stagedItems]);


  const processFiles = (files: FileList) => {
    const newItems: Promise<Omit<ClothingItem, 'category'>>[] = Array.from(files).map((file: File) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve({ file, base64: e.target?.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newItems).then(items => {
      const itemsWithCategory = items.map(item => ({...item, category: 'uncategorized' as ClothingCategory}));
      setStagedItems(prev => [...prev, ...itemsWithCategory]);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
      e.dataTransfer.clearData();
    }
  };


  const removeStagedItem = (index: number) => {
    setStagedItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleStagedCategoryChange = (index: number, category: ClothingCategory) => {
      setStagedItems(prev => {
          const newItems = [...prev];
          newItems[index].category = category;
          return newItems;
      });
  };
  
  const handleSaveToCloset = () => {
      stagedItems.forEach(item => {
        addClosetItem({
            name: item.file.name,
            size: item.file.size,
            base64: item.base64,
            mimeType: item.file.type,
            category: item.category,
        });
      });
      setStagedItems([]);
  };

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLooks(null);
    
    const selectedItems = closetItems.filter(item => selectedClosetItemIds.has(item.id));

    if (selectedItems.length === 0) {
        setError("Por favor, selecione pelo menos uma peça para gerar looks.");
        setIsLoading(false);
        return;
    }
    
    try {
      const itemsForApi = selectedItems.map(item => ({
        base64: item.base64,
        mimeType: item.mimeType,
        category: item.category,
      }));
      
      const response = await getFashionAdvice(
        itemsForApi, 
        selectedStyle, 
        customPrompt,
        suggestNewItems,
        includeShoes,
        includeAccessories
      );

      const looksWithFavorites = response.map((look, index) => ({
        ...look,
        id: `look-${Date.now()}-${index}`,
        isFavorited: false,
      }));

      setLooks(looksWithFavorites);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [closetItems, selectedClosetItemIds, selectedStyle, customPrompt, suggestNewItems, includeShoes, includeAccessories]);

  const handleToggleFavorite = (id: string) => {
    setLooks(prevLooks => {
      if (!prevLooks) return null;
      return prevLooks.map(look =>
        look.id === id ? { ...look, isFavorited: !look.isFavorited } : look
      );
    });
  };
  
  const handleToggleClosetSelection = (id: string) => {
      setSelectedClosetItemIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };
  
  const handleToggleTryOnSelection = (id: string) => {
      setSelectedTryOnItemIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  const handleTryOnSubmit = useCallback(async () => {
    setIsTryOnLoading(true);
    setTryOnError(null);
    setTryOnResult(null);

    const selectedAvatar = AVATARS.find(avatar => avatar.id === selectedAvatarId);
    if (!selectedAvatar) {
        setTryOnError("Por favor, selecione um modelo.");
        setIsTryOnLoading(false);
        return;
    }
    
    const selectedItems = closetItems.filter(item => selectedTryOnItemIds.has(item.id));
    if (selectedItems.length === 0) {
        setTryOnError("Por favor, selecione pelo menos uma peça para provar.");
        setIsTryOnLoading(false);
        return;
    }

    try {
      const avatarSrc = selectedAvatar.src;
      const mimeTypeMatch = avatarSrc.match(/^data:(.*);base64,/);
      
      if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
        setTryOnError("Formato de imagem do modelo inválido.");
        setIsTryOnLoading(false);
        return;
      }
      
      const mimeType = mimeTypeMatch[1];
      const avatarData = { base64: avatarSrc, mimeType: mimeType };

      const itemsForApi = selectedItems.map(item => ({
        base64: item.base64,
        mimeType: item.mimeType,
        category: item.category,
      }));

      const resultImage = await virtualTryOn(avatarData, itemsForApi);
      setTryOnResult(resultImage);

    } catch (e: any) {
      setTryOnError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsTryOnLoading(false);
    }
  }, [closetItems, selectedAvatarId, selectedTryOnItemIds]);

  const groupedClosetItems = useMemo(() => {
    return closetItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<ClothingCategory, StorableClothingItem[]>);
  }, [closetItems]);


  const renderCloset = (isSelectable: boolean, selectionSet?: Set<string>, onSelect?: (id: string) => void) => (
    <div className="space-y-8">
        {CLOTHING_CATEGORIES.filter(c => c.value !== 'uncategorized' && groupedClosetItems[c.value as ClothingCategory]?.length > 0).map(cat => (
            <div key={cat.value}>
                <h3 className="text-lg font-semibold text-zinc-700 mb-4 border-b pb-2">{cat.label}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedClosetItems[cat.value as ClothingCategory].map(item => (
                        <div 
                          key={item.id}
                          className={`relative group rounded-lg overflow-hidden border-2 ${
                            isSelectable && selectionSet?.has(item.id) ? 'border-rose-500 ring-2 ring-rose-300' : 'border-transparent'
                          } ${isSelectable ? 'cursor-pointer' : ''}`}
                           onClick={isSelectable && onSelect ? () => onSelect(item.id) : undefined}
                        >
                            <img src={item.base64} alt={item.name} className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {!isSelectable && (
                                    <button 
                                      onClick={() => removeClosetItem(item.id)}
                                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                      aria-label="Remover item do guarda-roupa"
                                    >
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                )}
                            </div>
                            {isSelectable && selectionSet?.has(item.id) && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}
        {closetItems.length === 0 && (
          <div className="text-center text-zinc-400 py-16">
            <HangerIcon className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-600">Seu guarda-roupa está vazio</h3>
            <p className="mt-2 text-zinc-500">Adicione suas peças para começar a organizá-las e criar looks.</p>
          </div>
        )}
    </div>
  );


  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800">
      <header className="bg-white/80 backdrop-blur-sm border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Outfitter</h1>
                <span className="text-sm font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">Beta</span>
             </div>
             <nav className="flex space-x-2 bg-zinc-200/80 p-1 rounded-lg">
                <button onClick={() => setActiveTab('generator')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'generator' ? 'bg-white text-rose-600 shadow' : 'text-zinc-600 hover:bg-zinc-300/50'}`}>Gerador de Looks</button>
                <button onClick={() => setActiveTab('closet')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'closet' ? 'bg-white text-rose-600 shadow' : 'text-zinc-600 hover:bg-zinc-300/50'}`}>Meu Guarda-Roupa</button>
                <button onClick={() => setActiveTab('tryon')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'tryon' ? 'bg-white text-rose-600 shadow' : 'text-zinc-600 hover:bg-zinc-300/50'}`}>Provador Virtual</button>
             </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Controls Column */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                  <h2 className="text-lg font-semibold mb-4 text-zinc-800">1. Selecione as peças</h2>
                  <div className="max-h-[400px] overflow-y-auto p-1 space-y-6">
                    {renderCloset(true, selectedClosetItemIds, handleToggleClosetSelection)}
                  </div>
               </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-zinc-800">2. Escolha um estilo</h2>
                    <div className="relative group">
                        <InfoIcon className="h-5 w-5 text-zinc-400 cursor-pointer group-hover:text-rose-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-zinc-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-20">
                            <ul className="space-y-2">
                                {FASHION_STYLES.map(style => (
                                    <li key={style.value}><strong className="font-bold text-rose-300">{style.label}:</strong> {style.description}</li>
                                ))}
                            </ul>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-zinc-800"></div>
                        </div>
                    </div>
                </div>
                <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition">
                  {FASHION_STYLES.map(style => (<option key={style.value} value={style.value}>{style.label}</option>))}
                </select>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                <h2 className="text-lg font-semibold mb-2 text-zinc-800">3. Pedido especial (opcional)</h2>
                <p className="text-sm text-zinc-500 mb-4">Ex: "Preciso de um look para um casamento de dia"</p>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={3} placeholder="Seja específico sobre a ocasião, clima, etc." className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"/>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                <h2 className="text-lg font-semibold mb-4 text-zinc-800">4. Detalhes do Look</h2>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={suggestNewItems} onChange={(e) => setSuggestNewItems(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"/><span className="text-sm font-medium text-zinc-700">Sugerir novas peças para comprar</span></label>
                  <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={includeShoes} onChange={(e) => setIncludeShoes(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"/><span className="text-sm font-medium text-zinc-700">Incluir sapatos no look</span></label>
                  <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={includeAccessories} onChange={(e) => setIncludeAccessories(e.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"/><span className="text-sm font-medium text-zinc-700">Incluir acessórios no look</span></label>
                </div>
              </div>
              <div className="mt-2">
                <button onClick={handleSubmit} disabled={isLoading || selectedClosetItemIds.size === 0} className="w-full bg-rose-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg">
                  <SparklesIcon className="h-6 w-6"/>
                  {isLoading ? 'Analisando seu estilo...' : 'Criar Looks'}
                </button>
              </div>
            </div>
            {/* Results Column */}
            <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-zinc-200/80 min-h-[600px]">
              <h2 className="text-2xl font-bold mb-6 border-b border-zinc-200 pb-4 text-zinc-800">Sugestões da IA</h2>
              <ResultDisplay looks={looks} isLoading={isLoading} error={error} onToggleFavorite={handleToggleFavorite} />
            </div>
          </div>
        )}

        {activeTab === 'closet' && (
          <div className="space-y-10">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
              <h2 className="text-lg font-semibold mb-4 text-zinc-800">Adicionar novas peças</h2>
               <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? 'border-rose-500 bg-rose-50' : 'border-zinc-300 hover:border-rose-400 hover:bg-rose-50/50'}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className={`mx-auto h-12 w-12 transition-colors ${isDragging ? 'text-rose-500' : 'text-zinc-400'}`} />
                <p className="mt-2 text-sm text-zinc-600">Arraste e solte suas peças aqui, ou <span className="font-semibold text-rose-600 cursor-pointer">clique para buscar</span></p>
                <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP, HEIC</p>
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              {stagedItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-700 mb-3">Peças para adicionar:</h3>
                  <ul className="space-y-3">
                    {stagedItems.map((item, index) => (
                      <li key={index} className="flex items-center justify-between bg-zinc-50 p-2 rounded-lg border border-zinc-200 gap-2">
                        <div className="flex items-center gap-3 overflow-hidden flex-shrink"><img src={item.base64} alt={item.file.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" /><div className="flex-1 overflow-hidden"><p className="text-sm font-medium text-zinc-800 truncate">{item.file.name}</p><p className="text-xs text-zinc-500">{formatBytes(item.file.size)}</p></div></div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <select value={item.category} onChange={(e) => handleStagedCategoryChange(index, e.target.value as ClothingCategory)} className={`text-xs p-2 rounded-md bg-white border transition-colors ${item.category === 'uncategorized' ? 'border-red-400 text-red-600 focus:ring-red-500' : 'border-zinc-300 focus:ring-rose-500'} focus:ring-2 focus:ring-offset-1`}>
                                {CLOTHING_CATEGORIES.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                            </select>
                            <button onClick={() => removeStagedItem(index)} className="text-zinc-500 p-2 rounded-full hover:bg-zinc-200 hover:text-zinc-800 transition-colors" aria-label="Remover item"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                   <div className="flex justify-end mt-4">
                      <button onClick={handleSaveToCloset} disabled={hasUncategorizedStagedItems} className="bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                         <PlusIcon className="h-5 w-5" /> Adicionar ao Guarda-Roupa
                      </button>
                   </div>
                   {hasUncategorizedStagedItems && (
                     <p className="text-xs text-red-600 text-right mt-2">Por favor, categorize todas as novas peças para salvá-las.</p>
                   )}
                </div>
              )}
            </div>
             <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                <h2 className="text-xl font-bold text-zinc-800 mb-6">Meu Guarda-Roupa</h2>
                {renderCloset(false)}
             </div>
          </div>
        )}
        
        {activeTab === 'tryon' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Controls Column */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                  <h2 className="text-lg font-semibold mb-4 text-zinc-800">1. Selecione um modelo</h2>
                   <div className="grid grid-cols-2 gap-4">
                        {AVATARS.map(avatar => (
                            <div 
                                key={avatar.id} 
                                onClick={() => setSelectedAvatarId(avatar.id)}
                                className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedAvatarId === avatar.id ? 'border-rose-500 ring-2 ring-rose-300' : 'border-transparent hover:border-rose-300'}`}
                            >
                                <img src={avatar.src} alt={avatar.alt} className="w-full h-full object-cover"/>
                            </div>
                        ))}
                   </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
                  <h2 className="text-lg font-semibold mb-4 text-zinc-800">2. Selecione as peças</h2>
                  <div className="max-h-[400px] overflow-y-auto p-1 space-y-6">
                    {renderCloset(true, selectedTryOnItemIds, handleToggleTryOnSelection)}
                  </div>
               </div>
              <div className="mt-2">
                <button onClick={handleTryOnSubmit} disabled={isTryOnLoading || selectedTryOnItemIds.size === 0} className="w-full bg-rose-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg">
                  <TshirtIcon className="h-6 w-6"/>
                  {isTryOnLoading ? 'Provando o look...' : 'Provar Look'}
                </button>
              </div>
            </div>
            {/* Results Column */}
            <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-zinc-200/80 min-h-[600px]">
              <h2 className="text-2xl font-bold mb-6 border-b border-zinc-200 pb-4 text-zinc-800">Provador Virtual</h2>
                {isTryOnLoading && (
                    <div className="space-y-8 animate-pulse">
                        <div className="bg-zinc-200 rounded-xl w-full aspect-[3/4] max-w-md mx-auto"></div>
                    </div>
                )}
                {tryOnError && <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">{tryOnError}</div>}
                {!isTryOnLoading && !tryOnError && tryOnResult && (
                    <img src={tryOnResult} alt="Resultado do provador virtual" className="w-full max-w-md mx-auto rounded-xl shadow-lg border border-zinc-200/80" />
                )}
                {!isTryOnLoading && !tryOnError && !tryOnResult && (
                    <div className="text-center text-zinc-400 py-16">
                        <TshirtIcon className="mx-auto h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-600">Seu resultado aparecerá aqui</h3>
                        <p className="mt-2 text-zinc-500">Escolha um modelo e as peças que deseja provar. A IA irá criar uma imagem para você.</p>
                    </div>
                )}
            </div>
          </div>
        )}

      </main>
      <footer className="text-center py-8 text-sm text-zinc-500">
        <p>Desenvolvido com ❤️ e IA</p>
      </footer>
    </div>
  );
};

export default App;