'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types'
import {
  Sparkles, Leaf, Car, Gamepad2, Cpu, Minus, Layers, Zap,
  Globe, Moon, Sun, Building2, PawPrint, Brain, Trophy,
  Clapperboard, Music, Box, Wand2, Code2, Landmark,
  UtensilsCrossed, Crown, Truck,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Leaf, Car, Gamepad2, Cpu, Minus, Layers, Zap,
  Globe, Moon, Sun, Building2, PawPrint, Brain, Trophy,
  Clapperboard, Music, Box, Wand2, Code2, Landmark,
  UtensilsCrossed, Crown, Truck,
}

const gradients = [
  'from-pink-500/20 to-rose-500/20',
  'from-green-500/20 to-emerald-500/20',
  'from-red-500/20 to-orange-500/20',
  'from-violet-500/20 to-purple-500/20',
  'from-blue-500/20 to-indigo-500/20',
  'from-gray-500/20 to-slate-500/20',
  'from-pink-500/20 to-fuchsia-500/20',
  'from-cyan-500/20 to-teal-500/20',
  'from-indigo-500/20 to-blue-500/20',
  'from-gray-800/20 to-gray-900/20',
  'from-yellow-200/20 to-amber-200/20',
  'from-orange-500/20 to-amber-500/20',
  'from-lime-500/20 to-green-500/20',
  'from-purple-500/20 to-violet-500/20',
  'from-teal-500/20 to-cyan-500/20',
  'from-red-600/20 to-pink-600/20',
  'from-purple-600/20 to-indigo-600/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-violet-500/20 to-purple-500/20',
  'from-green-500/20 to-teal-500/20',
  'from-stone-500/20 to-gray-500/20',
  'from-orange-400/20 to-yellow-400/20',
  'from-yellow-500/20 to-amber-500/20',
  'from-slate-500/20 to-zinc-500/20',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      // Count wallpapers per category from JSONB
      const { data: allWallpapers } = await supabase
        .from('wallpapers')
        .select('categories')
        .eq('status', 'published')
        .eq('visibility', 'public')

      const countMap: Record<string, number> = {}
      if (allWallpapers) {
        for (const wp of allWallpapers) {
          const cats = wp.categories as { slug?: string }[] | null
          if (Array.isArray(cats)) {
            for (const c of cats) {
              if (c.slug) {
                countMap[c.slug] = (countMap[c.slug] || 0) + 1
              }
            }
          }
        }
      }

      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories.map(c => ({ ...c, wallpaper_count: countMap[c.slug] ?? 0 })))
      } else {
        // Fallback to constants
        setCategories(CATEGORIES.map(c => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          color: c.color,
          wallpaper_count: countMap[c.slug] ?? 0,
          is_active: true,
          display_order: 0,
          created_at: '',
        } as Category)))
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Categories" description="Browse wallpapers by category" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    )
  }

  const items = categories.length > 0
    ? categories.map((c) => ({ name: c.name, slug: c.slug, count: c.wallpaper_count, icon: c.icon }))
    : CATEGORIES.map((c) => ({ name: c.name, slug: c.slug, count: 0, icon: c.icon }))

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Browse wallpapers by category"
        breadcrumbs={[{ label: 'Categories', href: '/categories' }]}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((cat, i) => {
          const IconComp = iconMap[cat.icon ?? ''] ?? Sparkles
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/category/${cat.slug}`} className="group block">
                <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 transition-all duration-300 hover:border-white/20 hover:shadow-xl ${gradients[i % gradients.length]}`}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <IconComp className="h-5 w-5 text-white/80" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-white/40">
                    {cat.count.toLocaleString()} wallpapers
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
