"use client";

import { cn } from "@/lib/utils";
import {
  closestModelIndex,
  formatDiff,
  formatRate,
  MODELS,
  similarityScore,
  type NoticeResult,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReasonDialogProps = {
  result: NoticeResult | null;
  onOpenChange: (open: boolean) => void;
};

export function ReasonDialog({ result, onOpenChange }: ReasonDialogProps) {
  return (
    <Dialog open={result !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-4rem)] gap-8 overflow-y-auto rounded-3xl p-10 sm:max-w-[863px] [&>[data-slot=dialog-close]]:top-8 [&>[data-slot=dialog-close]]:right-8 [&>[data-slot=dialog-close]_svg]:size-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">예가율 분석 근거</DialogTitle>
          {result && (
            <DialogDescription className="text-base">
              {result.notice.title} · {result.notice.no} · 개찰일 {result.notice.openDate}
            </DialogDescription>
          )}
        </DialogHeader>
        {result?.actualRate != null && result.factors && (
          <ReasonBody result={result} actualRate={result.actualRate} factors={result.factors} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReasonBody({
  result,
  actualRate,
  factors,
}: {
  result: NoticeResult;
  actualRate: number;
  factors: NonNullable<NoticeResult["factors"]>;
}) {
  const closest = closestModelIndex(result)!;
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.01);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted p-5">
          <div className="text-sm text-muted-foreground">실제 예가율</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{formatRate(actualRate)}</div>
        </div>
        <div className="rounded-2xl bg-primary/10 p-5">
          <div className="text-sm text-primary">가장 유사한 모델</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{MODELS[closest]}</span>
            <span className="text-base text-muted-foreground tabular-nums">
              {formatRate(result.modelRates[closest])} (오차 {formatDiff(result.modelRates[closest] - actualRate)})
            </span>
          </div>
        </div>
      </div>

      <section className="grid gap-3">
        <h3 className="text-lg font-semibold">항목별 분석</h3>
        <p className="text-sm text-muted-foreground">
          기준 예가율 100.00%에서 각 항목이 실제 예가율을 얼마나 올리거나 내렸는지 보여줘요.
        </p>
        <ul className="divide-y rounded-2xl border">
          {factors.map((f) => (
            <li key={f.label} className="grid grid-cols-[1fr_200px_80px] items-center gap-4 px-5 py-3">
              <div>
                <div className="font-medium">{f.label}</div>
                <div className="text-sm text-muted-foreground">{f.detail}</div>
              </div>
              <ImpactBar value={f.impact} max={maxImpact} />
              <div
                className={cn(
                  "text-right font-semibold tabular-nums",
                  f.impact > 0 ? "text-primary" : f.impact < 0 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {formatDiff(f.impact)}
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between bg-muted/50 px-5 py-3 font-semibold">
            <span>합계 → 실제 예가율</span>
            <span className="tabular-nums">
              100.00% {formatDiff(round2(actualRate - 100))} = {formatRate(actualRate)}
            </span>
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-semibold">모델별 유사도</h3>
        <ul className="divide-y rounded-2xl border">
          {MODELS.map((model, i) => {
            const rate = result.modelRates[i];
            const score = similarityScore(rate, actualRate);
            const isClosest = i === closest;
            return (
              <li
                key={model}
                className={cn(
                  "grid grid-cols-[100px_90px_90px_1fr_56px] items-center gap-4 px-5 py-3",
                  isClosest && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  {model}
                  {isClosest && <Badge className="h-5 px-1.5 text-[11px]">최근접</Badge>}
                </div>
                <div className={cn("tabular-nums", isClosest && "font-semibold text-primary")}>
                  {formatRate(rate)}
                </div>
                <div className="text-sm text-muted-foreground tabular-nums">{formatDiff(rate - actualRate)}</div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", isClosest ? "bg-primary" : "bg-foreground/30")}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="text-right font-semibold tabular-nums">{score}%</div>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-muted-foreground">유사도는 실제 예가율과의 오차로 계산해요. 오차가 2%p 이상이면 0%예요.</p>
      </section>
    </>
  );
}

/** 0을 가운데 두고 +는 오른쪽, -는 왼쪽으로 뻗는 막대 */
function ImpactBar({ value, max }: { value: number; max: number }) {
  const width = `${(Math.abs(value) / max) * 50}%`;
  return (
    <div className="relative h-2 rounded-full bg-muted">
      <div className="absolute inset-y-[-3px] left-1/2 w-px bg-border" />
      <div
        className={cn("absolute inset-y-0 rounded-full", value >= 0 ? "left-1/2 bg-primary" : "right-1/2 bg-destructive")}
        style={{ width }}
      />
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
