import { useState, useEffect, useCallback } from 'react';
import type { FavoriteFolder } from '@/types/recipe';
import { userApi } from '@/lib/api';
import { useAuth } from './useAuth';

export function useFavoriteFolders() {
  const { isLoggedIn } = useAuth();
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);

  const fetchFolders = useCallback(async () => {
    if (!isLoggedIn) {
      setFolders([{ id: 'default', name: '默认收藏夹', createdAt: new Date().toISOString() }]);
      return;
    }
    try {
      const result = await userApi.getFolders();
      if (result.code === 0 && Array.isArray(result.data)) {
        setFolders(result.data.map((f: { id: string; name: string; createdAt: string }) => ({
          id: f.id,
          name: f.name,
          createdAt: f.createdAt,
        })));
      }
    } catch (err) {
      console.error('加载收藏夹失败:', err);
      setFolders([{ id: 'default', name: '默认收藏夹', createdAt: new Date().toISOString() }]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const addFolder = useCallback(async (name: string): Promise<FavoriteFolder> => {
    try {
      const result = await userApi.createFolder(name);
      if (result.code === 0) {
        const newFolder: FavoriteFolder = {
          id: result.data.id,
          name: result.data.name,
          createdAt: result.data.createdAt,
        };
        setFolders(prev => [...prev, newFolder]);
        return newFolder;
      }
      throw new Error(result.message);
    } catch (err) {
      console.error('创建收藏夹失败:', err);
      throw err;
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    if (id.startsWith('default_') || id === 'default') return;
    try {
      setFolders(prev => prev.filter(f => f.id !== id));
      await userApi.deleteFolder(id);
    } catch (err) {
      console.error('删除收藏夹失败:', err);
      fetchFolders(); // 失败时重新加载
    }
  }, [fetchFolders]);

  const renameFolder = useCallback((_id: string, _name: string) => {
    // 暂时只做本地更新（后续可扩展 API）
    setFolders(prev => prev.map(f => f.id === _id ? { ...f, name: _name } : f));
  }, []);

  return { folders, addFolder, deleteFolder, renameFolder };
}
