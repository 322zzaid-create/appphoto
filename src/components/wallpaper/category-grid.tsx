"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Mountain,
  Sparkles,
  Rocket,
  Palette,
  Moon,
  Gamepad2,
  Car,
  Building2,
  TreePine,
  Music,
  Film,
  Gem,
} from "lucide-react";

interface CategoryItem {
  name: string;
  slug: string;
  count: number;
  icon?: string;
  gradient?: string;
}

const iconMap: Record<string, React.ElementType> = {
  mountain: Mountain,
  sparkles: Sparkles,
  rocket: Rocket,
  palette: Palette,
  moon: Moon,
  gamepad: Gamepad2,
  car: Car,
  building: Building2,
  tree: TreePine,
  music: Music,
  film: Film,
  gem: Gem,
};

const gradients = [
  "from-purple-500/20 to-blue-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-cyan-500/20 to-teal-500/20",
  "from-green-500/20 to-emerald-500/20",
  "from-orange-500/20 to-amber-500/20",
  "from-violet-500/20 to-purple-500/20",
  "from-red-500/20 to-orange-500/20",
  "from-blue-500/20 to-indigo-500/20",
];

interface CategoryGridProps {
  categories: CategoryItem[];
  className?: string;
}

export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className,
      )}
    >
      {categories.map((cat, i) => {
        const IconComponent = iconMap[cat.icon ?? ""] ?? Sparkles;
        const gradient = cat.gradient ?? gradients[i % gradients.length];

        return (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/category/${cat.slug}`}
              className="group block"
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 transition-all duration-300",
                  "hover:border-white/20 hover:shadow-xl",
                  gradient,
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <IconComponent className="h-5 w-5 text-white/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-white/40">
                  {cat.count.toLocaleString()} wallpapers
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
