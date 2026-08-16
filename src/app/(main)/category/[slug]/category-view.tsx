'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { WallpaperGrid } from '@/components/wallpaper/wallpaper-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useAuth } from '@/lib/hooks/useAuth'
import { CATEGORIES } from '@/lib/constants'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { toast } from '@/lib/utils/toast'
import type { Wallpaper } from '@/types'

export function CategoryView() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [categoryName, setCategoryName] = useState(
    CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
  )
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const fetchPage = useCallback(
    async (from: number, append: boolean) => {
      const supabase = createClient()
      const to = from + ITEMS_PER_PAGE - 1

      const { data, count, error } = await supabase
        .from('wallpapers')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .eq('visibility', 'public')
        .or(`categories.cs.[{"slug":"${slug.replace(/[^a-z0-9-]/gi, "")}"}]`)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Category page fetch error:', error)
        return
      }

      const batch = (data ?? []) as Wallpaper[]
      setWallpapers((prev) => (append ? [...prev, ...batch] : batch))
      setHasMore((count ?? 0) > from + batch.length)
    },
    [slug]
  )

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .single()

      if (!cancelled && cat) setCategoryName(cat.name)

      await fetchPage(0, false)
      if (!cancelled) setLoading(false)
    }

    init()

    return () => {
      cancelled = true
    }
  }, [slug, fetchPage])

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true)
    fetchPage(wallpapers.length, true).finally(() => setLoadingMore(false))
  }, [fetchPage, wallpapers.length])

  const mappedWallpapers = wallpapers.map((w) => ({
    id: w.id,
    title: w.title,
    thumbnailUrl: w.thumbnail_url || w.preview_url || '',
    imageUrl: w.preview_url || w.thumbnail_url || '',
    artist: w.uploader?.full_name || w.uploader?.username,
    dominantColor: w.dominant_colors?.[0] || undefined,
    isPremium: w.is_premium,
    likes: w.like_count,
    downloads: w.download_count,
    width: w.width || 1080,
    height: w.height || 1920,
  }))

  return (
    <div>
      <PageHeader
        title={categoryName}
        description={`Wallpapers in the ${categoryName} category`}
        breadcrumbs={[
          { label: 'Categories', href: '/categories' },
          { label: categoryName, href: `/category/${slug}` },
        ]}
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : mappedWallpapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-white">No wallpapers found</p>
          <p className="mt-1 text-sm text-white/40">No wallpapers in this category yet</p>
          <Link href="/browse" className="mt-4 text-sm text-purple-400 hover:text-purple-300">
            Browse all wallpapers
          </Link>
        </div>
      ) : (
        <>
          <WallpaperGrid
            wallpapers={mappedWallpapers}
            favoriteIds={favoriteIds}
            onFavorite={(id) => {
              if (!user) {
                toast.error('Please login to save')
                return
              }
              toggleFavorite(id)
            }}
          />
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
