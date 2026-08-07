"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeaturedItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  isPremium?: boolean;
  gradient?: string;
}

interface FeaturedSectionProps {
  items: FeaturedItem[];
  onItemClick?: (item: FeaturedItem) => void;
  className?: string;
}

export function FeaturedSection({
  items,
  onItemClick,
  className,
}: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Featured</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/40 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/40 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 scrollbar-none sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onItemClick?.(item)}
            className="group relative min-w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-2xl sm:min-w-[340px]"
          >
            <div className="aspect-[16/10] w-full">
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {item.category && (
                    <Badge color="purple" className="mb-2">
                      {item.category}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
                {item.isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
                    <Star className="h-2.5 w-2.5" fill="currentColor" />
                    PRO
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
