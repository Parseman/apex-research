import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../auth/AuthContext.tsx';

export const MAX_FAVORITES = 10;

export function useFavorites() {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Ref toujours synchronisé avec l'état courant → callbacks stables sans stale closure
  const favRef = useRef(favorites);
  favRef.current = favorites;

  useEffect(() => {
    if (!session?.userId) { setLoading(false); return; }
    supabase
      .from('user_favorites')
      .select('sym')
      .eq('user_id', session.userId)
      .then(({ data }) => {
        setFavorites(new Set(data?.map((r: { sym: string }) => r.sym) ?? []));
        setLoading(false);
      });
  }, [session?.userId]);

  const toggle = useCallback(async (sym: string, assetType: 'stock' | 'crypto') => {
    if (!session?.userId) return;
    const isFav = favRef.current.has(sym);

    if (isFav) {
      setFavorites(prev => { const s = new Set(prev); s.delete(sym); return s; });
      const { error } = await supabase.from('user_favorites').delete().eq('user_id', session.userId).eq('sym', sym);
      if (error) {
        console.error('Erreur suppression favori:', error.message);
        setFavorites(prev => new Set([...prev, sym])); // rollback
      }
    } else {
      if (favRef.current.size >= MAX_FAVORITES) return;
      setFavorites(prev => new Set([...prev, sym]));
      const { error } = await supabase.from('user_favorites').upsert(
        { user_id: session.userId, sym, asset_type: assetType },
        { onConflict: 'user_id,sym' }
      );
      if (error) {
        console.error('Erreur ajout favori:', error.message);
        setFavorites(prev => { const s = new Set(prev); s.delete(sym); return s; }); // rollback
      }
    }
  }, [session?.userId]); // favorites retiré des deps : le ref suffit

  // Stable : lit toujours favRef.current (à jour au moment du rendu)
  const isFavorite = useCallback((sym: string) => favRef.current.has(sym), []);

  return { favorites, isFavorite, toggle, count: favorites.size, atLimit: favorites.size >= MAX_FAVORITES, loading };
}
