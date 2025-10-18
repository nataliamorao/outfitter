import { useState, useEffect, useCallback } from 'react';
import { StorableClothingItem } from '../types';

const CLOSET_STORAGE_KEY = 'outfitterCloset';

export const useCloset = () => {
  const [closetItems, setClosetItems] = useState<StorableClothingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(CLOSET_STORAGE_KEY);
      if (storedItems) {
        setClosetItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load closet items from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CLOSET_STORAGE_KEY, JSON.stringify(closetItems));
      } catch (error) {
        console.error("Failed to save closet items to localStorage:", error);
      }
    }
  }, [closetItems, isLoaded]);

  const addClosetItem = useCallback((item: Omit<StorableClothingItem, 'id'>) => {
    setClosetItems(prev => {
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const newItem: StorableClothingItem = { ...item, id: `item-${Date.now()}-${randomSuffix}` };
      return [...prev, newItem];
    });
  }, []);

  const removeClosetItem = useCallback((id: string) => {
    setClosetItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { closetItems, addClosetItem, removeClosetItem, isLoaded };
};
