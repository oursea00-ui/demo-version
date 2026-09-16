import { predictions } from "@/lib/mock-data";
import { PageShell } from "@/components/page-shell";
import { TestResult } from "./test-result";

export default async function TestResultPage({ searchParams }: PageProps<"/test/result">) {
  const { ids } = await searchParams;
  const idSet = new Set(typeof ids === "string" && ids ? ids.split(",") : []);
  // 선택된 공고가 없으면(직접 접근 등) 전체 목업을 보여준다
  const rows = idSet.size > 0 ? predictions.filter((p) => idSet.has(p.notice.id)) : predictions;

  return (
    <PageShell>
      <TestResult rows={rows} />
    </PageShell>
  );
}
