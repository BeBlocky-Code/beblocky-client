"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);

    if (value.trim()) {
      const searchParams = new URLSearchParams({ q: value.trim() });
      router.push(`/courses?${searchParams.toString()}`);
    }
  };

  return (
    <motion.div
      className={cn("relative", className)}
      whileFocus={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "relative flex items-center rounded-lg border border-input bg-background/50 backdrop-blur-sm transition-all duration-200",
          isFocused
            ? "ring-2 ring-primary/20 border-primary/50"
            : "hover:border-primary/30"
        )}
      >
        <Search
          className={cn(
            "absolute left-3 h-4 w-4 transition-colors duration-200",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}
        />
        <Input
          className="border-0 bg-transparent pl-10 pr-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          placeholder="Search courses, children..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      {/* Search suggestions could go here */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-2"
        >
          <div className="text-sm text-muted-foreground p-2">
            Search results for "{query}"...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
