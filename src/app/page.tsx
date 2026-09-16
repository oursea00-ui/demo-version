"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatWon, notices, type Notice } from "@/lib/mock-data";
import { FilterBar, useNoticeFilters } from "@/components/filter-bar";
import { EmptyRow, PageShell, PageTitle } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getNotice = (n: Notice) => n;

export default function Home() {
  const router = useRouter();
  const { filtered, ...filterProps } = useNoticeFilters(notices, getNotice);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allChecked = filtered.length > 0 && filtered.every((n) => selected.has(n.id));
  const someChecked = !allChecked && filtered.some((n) => selected.has(n.id));

  const toggleAll = (checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const n of filtered) {
        if (checked) next.add(n.id);
        else next.delete(n.id);
      }
      return next;
    });

  const toggleOne = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const startTest = () => {
    const ids = notices.filter((n) => selected.has(n.id)).map((n) => n.id);
    router.push(`/test/result?ids=${ids.join(",")}`);
  };

  return (
    <>
      <PageShell className={selected.size > 0 ? "pb-40" : undefined}>
        <PageTitle>돈방석 데모 버전</PageTitle>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            미개찰 공고 <span className="tabular-nums">{filtered.length}</span>
          </h2>
          <FilterBar {...filterProps} />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <Table className="text-base">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-14 w-20 pl-8">
                  <label className="flex items-center gap-4">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onCheckedChange={toggleAll}
                      className="size-6 rounded-md bg-background [&_svg]:size-4!"
                      aria-label="전체 선택"
                    />
                    <span className="font-medium text-muted-foreground">전체</span>
                  </label>
                </TableHead>
                <TableHead>공고번호</TableHead>
                <TableHead>용역명</TableHead>
                <TableHead>용역</TableHead>
                <TableHead>발주처</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>지역</TableHead>
                <TableHead className="text-right">기초금액</TableHead>
                <TableHead className="pr-8 text-right">개찰일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((n) => {
                const checked = selected.has(n.id);
                return (
                  <TableRow
                    key={n.id}
                    data-state={checked ? "selected" : undefined}
                    className="h-[50px] cursor-pointer"
                    onClick={() => toggleOne(n.id, !checked)}
                  >
                    <TableCell className="pl-8" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleOne(n.id, v)}
                        className="size-6 rounded-md [&_svg]:size-4!"
                        aria-label={`${n.title} 선택`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{n.no}</TableCell>
                    <TableCell className="max-w-[420px] truncate font-medium">{n.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{n.category}</Badge>
                    </TableCell>
                    <TableCell>{n.agency}</TableCell>
                    <TableCell>
                      {n.industry1} · {n.industry2}
                    </TableCell>
                    <TableCell>
                      {n.region1} {n.region2}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatWon(n.basePrice)}</TableCell>
                    <TableCell className="pr-8 text-right tabular-nums">{n.openDate}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <EmptyRow colSpan={9}>조건에 맞는 미개찰 공고가 없어요.</EmptyRow>}
            </TableBody>
          </Table>
        </div>
      </PageShell>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-[84px] w-full max-w-[1576px] items-center justify-end gap-3 px-6">
            <span className="mr-auto text-base text-muted-foreground">
              <strong className="font-semibold text-foreground tabular-nums">{selected.size}</strong>건 선택됨
            </span>
            <Button
              variant="secondary"
              className="h-[60px] rounded-full px-6 text-lg"
              onClick={() => setSelected(new Set())}
            >
              선택 취소
            </Button>
            <Button className="h-[60px] rounded-full px-6 text-lg" onClick={startTest}>
              예가율 테스트하기
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
