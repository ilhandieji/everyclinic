"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ServiceHit = { id: string; title: string };

const SEARCH_DELAY_MS = 200;

export function ServiceNavSearch({ className }: { className?: string }) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<number | null>(null);
  const fetchGenerationRef = useRef(0);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(false);
  const [results, setResults] = useState<ServiceHit[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const fetchResults = useCallback(async (term: string) => {
    const generation = ++fetchGenerationRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      const response = await fetch(`/api/services/search?${params.toString()}`, {
        cache: "no-store",
      });
      if (generation !== fetchGenerationRef.current) return;
      if (!response.ok) {
        setResults([]);
        setActiveIndex(-1);
        return;
      }
      const data = (await response.json()) as { services?: ServiceHit[] };
      setResults(Array.isArray(data.services) ? data.services : []);
      setActiveIndex(-1);
    } catch {
      if (generation !== fetchGenerationRef.current) return;
      setResults([]);
      setActiveIndex(-1);
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const queueSearch = useCallback(
    (term: string, immediate = false) => {
      if (searchTimerRef.current !== null) {
        window.clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
      setPendingSearch(true);
      if (immediate) {
        setPendingSearch(false);
        void fetchResults(term);
        return;
      }
      searchTimerRef.current = window.setTimeout(() => {
        searchTimerRef.current = null;
        setPendingSearch(false);
        void fetchResults(term);
      }, SEARCH_DELAY_MS);
    },
    [fetchResults],
  );

  useEffect(() => {
    return () => {
      if (searchTimerRef.current !== null) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      queueSearch(query, true);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) {
        closeSearch();
        router.push(`/services/${target.id}`);
      }
    }
  };

  const showList = open && (loading || pendingSearch || results.length > 0 || query.length > 0);

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-label="جستجوی خدمات"
          placeholder="جستجوی خدمات…"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            queueSearch(next);
          }}
          onFocus={() => {
            setOpen(true);
            if (!query.trim()) {
              queueSearch("", true);
            }
          }}
          onKeyDown={onKeyDown}
          className="h-9 rounded-full border-border bg-card ps-9 pe-3 text-sm shadow-none"
        />
      </div>
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="نتایج جستجوی خدمات"
          className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-[70] max-h-64 overflow-y-auto rounded-lg border border-border bg-popover py-1 text-sm text-popover-foreground shadow-md"
        >
          {loading || pendingSearch ? (
            <li className="px-3 py-2 text-muted-foreground" role="presentation">
              در حال جستجو…
            </li>
          ) : null}
          {!loading && !pendingSearch && results.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground" role="presentation">
              خدمتی یافت نشد.
            </li>
          ) : null}
          {results.map((service, index) => (
            <li key={service.id} role="presentation">
              <Link
                href={`/services/${service.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-start transition-colors outline-none",
                  index === activeIndex ? "bg-muted text-foreground" : "hover:bg-muted/70",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={closeSearch}
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
