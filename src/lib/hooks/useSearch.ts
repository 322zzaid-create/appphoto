'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { createClient } from '@/lib/supabase/client'
import type { Wallpaper, SearchSuggestion, SearchHistoryEntry } from '@/types'

interface SearchResults {
  wallpapers: Wallpaper[]
  total: number
  query: string
  suggestions: string[]
}

interface UseSearchReturn {
  results: SearchResults | null
  suggestions: SearchSuggestion[]
  history: SearchHistoryEntry[]
  isLoading: boolean
  query: string
  setQuery: (query: string) => void
  search: (q: string) => void
  clearHistory: () => Promise<void>
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 300)
  const supabase = createClient()

  const { data: suggestions = [] } = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: async (): Promise<SearchSuggestion[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) return []
      const { data } = await supabase
        .from('search_suggestions')
        .select('*')
        .ilike('term', `%${debouncedQuery}%`)
        .order('search_count', { ascending: false })
        .limit(5)
      return data ?? []
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  })

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', 'results', activeQuery],
    queryFn: async (): Promise<SearchResults> => {
      if (!activeQuery) return { wallpapers: [], total: 0, query: '', suggestions: [] }

      const { data: wallpapers, count } = await supabase
        .from('wallpapers')
        .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)', { count: 'exact' })
        .eq('status', 'published')
        .eq('visibility', 'public')
        .or(`title.ilike.%${activeQuery}%,description.ilike.%${activeQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      const { data: matchedSuggestions } = await supabase
        .from('search_suggestions')
        .select('term')
        .ilike('term', `%${activeQuery}%`)
        .order('search_count', { ascending: false })
        .limit(5)

      await supabase.from('search_history').insert({
        query: activeQuery,
        results_count: count ?? 0,
      })

      try {
        await supabase.rpc('increment_search_suggestion', { p_term: activeQuery })
      } catch {
        await supabase.from('search_suggestions').upsert({ term: activeQuery, search_count: 1 })
      }

      return {
        wallpapers: wallpapers ?? [],
        total: count ?? 0,
        query: activeQuery,
        suggestions: matchedSuggestions?.map((s) => s.term) ?? [],
      }
    },
    enabled: !!activeQuery,
    staleTime: 2 * 60 * 1000,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['search', 'history'],
    queryFn: async (): Promise<SearchHistoryEntry[]> => {
      const { data } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      return data ?? []
    },
    staleTime: 30 * 1000,
  })

  const search = useCallback((q: string) => {
    setActiveQuery(q)
  }, [])

  const clearHistory = useCallback(async () => {
    await supabase.from('search_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  }, [supabase])

  return {
    results: results ?? null,
    suggestions,
    history,
    isLoading,
    query,
    setQuery,
    search,
    clearHistory,
  }
}
