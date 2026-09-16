"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  closestModelIndex,
  formatRate,
  formatWon,
  MODELS,
  results,
  type NoticeResult,
} from "@/lib/mock-data";
import { FilterBar, useNoticeFilters } from "@/components/filter-bar";
import { EmptyRow, PageShell, PageTitle } from "@/components/page-shell";
import { ReasonDialog } from "@/components/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getNotice = (r: NoticeResult) => r.notice;

export default function HistoryPage() {
  const { filtered, ...filterProps } = useNoticeFilters(results, getNotice);
  const [active, setActive] = useState<NoticeResult | null>(null);
  const openedCount = filtered.filter((r) => r.actualRate !== null).length;

  return (
    <PageShell>
      <PageTitle>전체 내역</PageTitle>

      <div className="mt-11 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">
          총 <span className="tabular-nums">{filtered.length}</span>건
          <span className="ml-3 text-base font-normal text-muted-foreground">
            개찰 완료 <span className="tabular-nums">{openedCount}</span>건
          </span>
          <span className="ml-4 inline-flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
            <span className="inline-block size-3 rounded-sm bg-primary/15 ring-1 ring-primary/40" />
            실제 예가율과 가장 유사한 모델
          </span>
        </h2>
        <FilterBar {...filterProps} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table className="text-base">
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead rowSpan={2} className="pl-8">공고번호</TableHead>
              <TableHead rowSpan={2}>용역명</TableHead>
              <TableHead rowSpan={2} className="text-right">기초금액</TableHead>
              <TableHead colSpan={MODELS.length} className="h-10 border-x text-center">
                모델별 예측 예가율
              </TableHead>
              <TableHead rowSpan={2} className="text-right">실제 예가율</TableHead>
              <TableHead rowSpan={2} className="text-center">개찰일</TableHead>
              <TableHead rowSpan={2} className="w-28 pr-8 text-right">근거</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {MODELS.map((m, i) => (
                <TableHead
                  key={m}
                  className={cn("h-10 text-right", i === 0 && "border-l", i === MODELS.length - 1 && "border-r")}
                >
                  {m}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const closest = closestModelIndex(r);
              const opened = r.actualRate !== null;
              return (
                <TableRow key={r.notice.id} className="h-[60px]">
                  <TableCell className="pl-8 font-mono text-sm text-muted-foreground">{r.notice.no}</TableCell>
                  <TableCell className="max-w-[360px]">
                    <div className="truncate font-medium">{r.notice.title}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {r.notice.agency} · {r.notice.region1} {r.notice.region2}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatWon(r.notice.basePrice)}</TableCell>
                  {r.modelRates.map((rate, i) => (
                    <TableCell key={MODELS[i]} className="text-right tabular-nums">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1",
                          i === closest && "bg-primary/15 font-bold text-primary"
                        )}
                        title={i === closest ? "실제 예가율과 가장 유사한 모델" : undefined}
                      >
                        {formatRate(rate)}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold tabular-nums">{formatRate(r.actualRate)}</TableCell>
                  <TableCell className="text-center">
                    <div className="tabular-nums">{r.notice.openDate}</div>
                    {opened ? (
                      <Badge variant="secondary" className="mt-1">개찰 완료</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">개찰 전</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    {opened ? (
                      <Button variant="outline" size="sm" onClick={() => setActive(r)}>
                        근거
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <EmptyRow colSpan={6 + MODELS.length}>조건에 맞는 공고가 없어요.</EmptyRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ReasonDialog result={active} onOpenChange={(open) => !open && setActive(null)} />
    </PageShell>
  );
}
