"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Link2, ImagePlus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { fileToBase64 } from "@/lib/api";

const PLACEHOLDERS = [
  "Search by photo or describe anything…",
  "Paste an Instagram or Amazon link…",
  "Ask AI anything about a product…",
  "Upload a screenshot to find dupes…",
];

interface SearchBarProps {
  className?: string;
  size?: "compact" | "default" | "large";
  onSearch?: (query: string) => void;
}

export function SearchBar({ className, size = "default", onSearch }: SearchBarProps) {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const fileInputRef  = useRef<HTMLInputElement>(null);

  const [text,       setText]       = useState(searchParams.get("q") ?? "");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [isUrlMode,  setIsUrlMode]  = useState(false);
  const [urlValue,   setUrlValue]   = useState("");
  const [focused,    setFocused]    = useState(false);

  const showQuickActions = size !== "compact";

  const inputPadding = size === "large"
    ? "px-5 py-4"
    : size === "compact"
    ? "px-4 py-2"
    : "px-4 py-3";

  useEffect(() => {
    if (focused || text.length > 0) return;
    const id = setInterval(() => {
      setPlaceholder((prev) => {
        const idx = PLACEHOLDERS.indexOf(prev);
        return PLACEHOLDERS[(idx + 1) % PLACEHOLDERS.length];
      });
    }, 3000);
    return () => clearInterval(id);
  }, [focused, text]);

  const handleTextSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = text.trim();
      if (!q) return;
      if (onSearch) onSearch(q);
      else router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [text, router, onSearch]
  );

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const v = urlValue.trim();
      if (!v) return;
      router.push(`/search?url=${encodeURIComponent(v)}`);
    },
    [urlValue, router]
  );

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const base64 = await fileToBase64(files[0]);
      sessionStorage.setItem("ds_search_image", base64);
      router.push(`/search?img=${Date.now()}`);
    },
    [router]
  );

  if (isUrlMode) {
    return (
      <form onSubmit={handleUrlSubmit} className={cn("w-full", className)}>
        <div className="flex gap-2">
          <div className={cn(
            "flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl",
            inputPadding,
            "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all"
          )}>
            <Link2 size={17} className="text-zinc-400 shrink-0" />
            <input
              autoFocus
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="Paste Amazon, Instagram, Pinterest link…"
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 bg-brand-600 text-white rounded-2xl font-medium text-sm hover:bg-brand-700 transition-colors focus-ring"
          >
            Find
          </button>
          <button
            type="button"
            aria-label="Close link search"
            onClick={() => setIsUrlMode(false)}
            className="px-3 border border-zinc-200 rounded-2xl text-zinc-500 hover:bg-zinc-50 focus-ring"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <form onSubmit={handleTextSearch}>
        <div className={cn(
          "flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl",
          inputPadding,
          "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all duration-200"
        )}>
          <Search size={17} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            aria-label="Search products by text, photo, or link"
            autoComplete="off"
            className={cn(
              "flex-1 bg-transparent text-zinc-900 placeholder:text-zinc-400 outline-none",
              size === "large" ? "text-base" : "text-sm"
            )}
          />
          {text && (
            <button
              type="submit"
              className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors focus-ring shrink-0"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {showQuickActions && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <QuickAction
            icon={<Camera size={15} />}
            label="Camera"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = "environment";
                fileInputRef.current.click();
              }
            }}
          />
          <QuickAction
            icon={<Link2 size={15} />}
            label="Link"
            onClick={() => setIsUrlMode(true)}
          />
          <QuickAction
            icon={<ImagePlus size={15} />}
            label="Upload"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl",
        "bg-white border border-zinc-200 text-zinc-600",
        "hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50",
        "text-sm font-medium transition-all duration-150 active:scale-95 focus-ring"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
