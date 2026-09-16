"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Notice } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_FIELDS = [
  { key: "category", label: "용역" },
  { key: "agency", label: "발주처" },
  { key: "industry1", label: "업종" },
  { key: "industry2", label: "업종2" },
  { key: "region1", label: "지역1" },
  { key: "region2", label: "지역2" },
] as const satisfies ReadonlyArray<{ key: keyof Notice; label: string }>;

type FilterKey = (typeof FILTER_FIELDS)[number]["key"];
type Filters = Record<FilterKey, string | null>;

const EMPTY_FILTERS: Filters = {
  category: null,
  agency: null,
  industry1: null,
  industry2: null,
  region1: null,
  region2: null,
};

/** 공고 목록에 필터(드롭다운 6종 + 용역명 검색)를 적용한다. */
export function useNoticeFilters<T>(rows: T[], getNotice: (row: T) => Notice) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const result = {} as Record<FilterKey, string[]>;
    for (const { key } of FILTER_FIELDS) {
      const source =
        key === "region2" && filters.region1
          ? rows.filter((r) => getNotice(r).region1 === filters.region1)
          : rows;
      result[key] = [...new Set(source.map((r) => getNotice(r)[key]))].sort((a, b) =>
        a.localeCompare(b, "ko")
      );
    }
    return result;
  }, [rows, getNotice, filters.region1]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return rows.filter((row) => {
      const notice = getNotice(row);
      if (q && !notice.title.includes(q)) return false;
      return FILTER_FIELDS.every(({ key }) => !filters[key] || notice[key] === filters[key]);
    });
  }, [rows, getNotice, filters, query]);

  const setFilter = (key: FilterKey, value: string | null) =>
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // 지역1이 바뀌면 지역2는 초기화
      ...(key === "region1" ? { region2: null } : {}),
    }));

  return { filters, setFilter, query, setQuery, options, filtered };
}

type FilterBarProps = Pick<
  ReturnType<typeof useNoticeFilters>,
  "filters" | "setFilter" | "query" | "setQuery" | "options"
> & { className?: string };

export function FilterBar({ filters, setFilter, query, setQuery, options, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {FILTER_FIELDS.map(({ key, label }) => (
        <Select key={key} value={filters[key]} onValueChange={(v) => setFilter(key, v as string | null)}>
          <SelectTrigger
            aria-label={label}
            className="h-[50px] w-[150px] rounded-full border-border bg-muted px-6 text-base data-placeholder:text-muted-foreground [&>svg]:size-5"
          >
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>{label} 전체</SelectItem>
            {options[key].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="용역명 검색"
        aria-label="용역명 검색"
        className="h-[50px] w-[228px] rounded-full bg-muted px-6 text-base md:text-base"
      />
    </div>
  );
}
