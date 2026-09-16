"use client";

import { useState } from "react";

import { formatRate, MODELS, predictions, type Prediction } from "@/lib/mock-data";
import { FilterBar, useNoticeFilters } from "@/components/filter-bar";
import { EmptyRow, PageShell, PageTitle } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getNotice = (p: Prediction) => p.notice;

export default function HistoryPage() {
  const { filtered, ...filterProps } = useNoticeFilters(predictions, getNotice);
  const [model, setModel] = useState(0);

  return (
    <PageShell>
      <PageTitle>테스트 내역</PageTitle>

      <div className="mt-11 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">
          총 <span className="tabular-nums">{filtered.length}</span>건
        </h2>
        <FilterBar {...filterProps} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table className="text-base">
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-16 pl-8">공고번호</TableHead>
              <TableHead>용역명</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-4">
                  예측 예가율
                  <Tabs value={model} onValueChange={(v) => setModel(v as number)}>
                    <TabsList variant="line">
                      {MODELS.map((m, i) => (
                        <TabsTrigger key={m} value={i} className="px-2 text-base">
                          {m}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </TableHead>
              <TableHead className="text-center">실제 개찰 여부</TableHead>
              <TableHead className="text-right">실제 예가율</TableHead>
              <TableHead className="text-right">오차</TableHead>
              <TableHead className="pr-8 text-right">테스트 날짜</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const predicted = p.modelRates[model];
              const diff = p.actualRate === null ? null : predicted - p.actualRate;
              return (
                <TableRow key={p.notice.id} className="h-[50px]">
                  <TableCell className="pl-8 font-mono text-sm text-muted-foreground">{p.notice.no}</TableCell>
                  <TableCell className="max-w-[480px] truncate font-medium">{p.notice.title}</TableCell>
                  <TableCell className="text-right font-semibold text-primary tabular-nums">
                    {formatRate(predicted)}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.opened ? <Badge>개찰</Badge> : <Badge variant="outline">미개찰</Badge>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatRate(p.actualRate)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {diff === null ? "-" : `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%p`}
                  </TableCell>
                  <TableCell className="pr-8 text-right tabular-nums">{p.testedAt}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <EmptyRow colSpan={7}>조건에 맞는 테스트 내역이 없어요.</EmptyRow>}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}
