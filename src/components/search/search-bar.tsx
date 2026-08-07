"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface SearchSuggestion {
  text: string;
  type: "recent" | "popular" | "suggestion";
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (text: string) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  className?: string;
}

export function SearchBar({
  placeholder = "Search wallpapers...",
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onSearch?.(val);
  }, 300);

  const allSuggestions = query
    ? suggestions
    : [
        ...recentSearches.map((s) => ({ text: s, type: "recent" as const })),
        ...popularSearches.map((s) => ({ text: s, type: "popular" as const })),
      ];

  const visibleSuggestions = query
    ? allSuggestions.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase()),
      )
    : allSuggestions.slice(0, 8);

  const handleSelect = useCallback(
    (text: string) => {
      setQuery(text);
      setFocused(false);
      onSuggestionSelect?.(text) ?? onSearch?.(text);
    },
    [onSearch, onSuggestionSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < visibleSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : visibleSuggestions.length - 1,
        );
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(visibleSuggestions[selectedIndex].text);
      } else if (e.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      }
    },
    [selectedIndex, visibleSuggestions, handleSelect],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-2xl border bg-white/5 backdrop-blur-xl transition-all duration-200",
          focused
            ? "border-purple-500/50 ring-2 ring-purple-500/20"
            : "border-white/10 hover:border-white/20",
        )}
      >
        <Search className="ml-4 h-4.5 w-4.5 shrink-0 text-white/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent px-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onSearch?.("");
              inputRef.current?.focus();
            }}
            className="mr-3 rounded-full p-1 text-white/30 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onSearch?.(query)}
          className="mr-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </div>

      <AnimatePresence>
        {focused && visibleSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0f0f1a]/95 shadow-2xl backdrop-blur-2xl"
          >
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  Recent
                </p>
                {recentSearches.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {!query && popularSearches.length > 0 && (
              <div className="border-t border-white/5 p-2">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  Popular
                </p>
                {popularSearches.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {query && (
              <div className="p-2">
                {visibleSuggestions.map((s, i) => (
                  <button
                    key={s.text}
                    onClick={() => handleSelect(s.text)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedIndex === i
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 opacity-40" />
                    <span className="flex-1 text-left">{s.text}</span>
                    <ArrowRight className="h-3 w-3 opacity-30" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
