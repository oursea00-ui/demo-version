"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";

import { formatRate, formatWon, MODELS, type Prediction } from "@/lib/mock-data";
import { FilterBar, useNoticeFilters } from "@/components/filter-bar";
import { EmptyRow, PageTitle } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getNotice = (p: Prediction) => p.notice;

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function TestResult({ rows }: { rows: Prediction[] }) {
  const { filtered, ...filterProps } = useNoticeFilters(rows, getNotice);
  const [active, setActive] = useState<Prediction | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-lg"
            nativeButton={false}
            render={<Link href="/" aria-label="뒤로 가기" />}
          >
            <ArrowLeftIcon className="size-8" />
          </Button>
          <PageTitle>예가율 예측 테스트 결과</PageTitle>
        </div>
        <div className="flex items-center gap-3">
          {uploadedFile && (
            <Badge variant="secondary" className="h-8 gap-1.5 px-3 text-sm">
              <FileTextIcon /> {uploadedFile}
            </Badge>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setUploadedFile(e.target.files?.[0]?.name ?? null)}
          />
          <Button className="h-[60px] rounded-full px-6 text-lg" onClick={() => fileInput.current?.click()}>
            데이터 업로드
          </Button>
        </div>
      </div>

      <FilterBar {...filterProps} className="mt-10" />

      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table className="text-base">
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-14 pl-8">공고번호</TableHead>
              <TableHead>용역명</TableHead>
              <TableHead>발주처</TableHead>
              <TableHead className="text-right">기초금액</TableHead>
              <TableHead className="text-right">예측 예가율</TableHead>
              <TableHead className="text-right">모델 예측 범위</TableHead>
              <TableHead className="text-right">개찰일</TableHead>
              <TableHead className="w-32 pr-8 text-right">근거</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.notice.id} className="h-[50px] cursor-pointer" onClick={() => setActive(p)}>
                <TableCell className="pl-8 font-mono text-sm text-muted-foreground">{p.notice.no}</TableCell>
                <TableCell className="max-w-[420px] truncate font-medium">{p.notice.title}</TableCell>
                <TableCell>{p.notice.agency}</TableCell>
                <TableCell className="text-right tabular-nums">{formatWon(p.notice.basePrice)}</TableCell>
                <TableCell className="text-right font-semibold text-primary tabular-nums">
                  {formatRate(average(p.modelRates))}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatRate(Math.min(...p.modelRates))} ~ {formatRate(Math.max(...p.modelRates))}
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.notice.openDate}</TableCell>
                <TableCell className="pr-8 text-right">
                  <Button variant="outline" size="sm">
                    근거 보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={8}>조건에 맞는 예측 결과가 없어요.</EmptyRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="gap-6 rounded-3xl p-10 sm:max-w-[863px] [&>[data-slot=dialog-close]]:top-8 [&>[data-slot=dialog-close]]:right-8 [&>[data-slot=dialog-close]_svg]:size-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">예가율 예측 근거</DialogTitle>
            {active && <DialogDescription className="text-base">{active.notice.title}</DialogDescription>}
          </DialogHeader>
          {active && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MODELS.map((model, i) => (
                  <div key={model} className="rounded-xl bg-muted p-4">
                    <div className="text-sm text-muted-foreground">{model}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{formatRate(active.modelRates[i])}</div>
                  </div>
                ))}
              </div>
              <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                예측 근거 데이터 영역 (데이터 정의 후 연결 예정)
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
