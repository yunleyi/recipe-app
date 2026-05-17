import { useState, useEffect, useCallback } from 'react';
import type { FavoriteFolder } from '@/types/recipe';
import { useAuth } from './useAuth';

const FAVORITE_FOLDERS_KEY = 'recipe_favorite_folders';
const DEFAULT_FOLDER: FavoriteFolder = {
  id: 'default',
  name: '默认收藏夹',
  createdAt: new Date().toISOString(),
};

function loadFolders(): FavoriteFolder[] {
  try {
    const stored = localStorage.getItem(FAVORITE_FOLDERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 确保默认收藏夹存在
      if (!parsed.find((f: FavoriteFolder) => f.id === 'default')) {
        return [DEFAULT_FOLDER, ...parsed];
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return [DEFAULT_FOLDER];
}

function saveFolders(folders: FavoriteFolder[]) {
  localStorage.setItem(FAVORITE_FOLDERS_KEY, JSON.stringify(folders));
}

export function useFavoriteFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FavoriteFolder[]>([DEFAULT_FOLDER]);

  // 加载当前用户的收藏夹
  useEffect(() => {
    if (user) {
      const stored = loadFolders();
      // 按用户隔离（简单用 user id 前缀）
      const userKey = `user_${user.id}_folders`;
      const userStored = localStorage.getItem(userKey);
      if (userStored) {
        try {
          setFolders(JSON.parse(userStored));
        } catch {
          setFolders([DEFAULT_FOLDER]);
        }
      } else {
        // 首次使用，加载全局再存到用户专属
        setFolders(stored);
        localStorage.setItem(userKey, JSON.stringify(stored));
      }
    } else {
      setFolders([DEFAULT_FOLDER]);
    }
  }, [user]);

  const persist = useCallback((updated: FavoriteFolder[]) => {
    setFolders(updated);
    if (user) {
      const userKey = `user_${user.id}_folders`;
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
    saveFolders(updated);
  }, [user]);

  const addFolder = useCallback((name: string): FavoriteFolder => {
    const newFolder: FavoriteFolder = {
      id: `folder_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    persist([...folders, newFolder]);
    return newFolder;
  }, [folders, persist]);

  const deleteFolder = useCallback((id: string) => {
    if (id === 'default') return; // 不能删除默认收藏夹
    persist(folders.filter(f => f.id !== id));
  }, [folders, persist]);

  const renameFolder = useCallback((id: string, name: string) => {
    persist(folders.map(f => f.id === id ? { ...f, name } : f));
  }, [folders, persist]);

  return { folders, addFolder, deleteFolder, renameFolder };
}
