import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">demo-version</h1>
      <p className="text-muted-foreground">Next.js + shadcn/ui</p>
      <div className="flex gap-3">
        <Button>시작하기</Button>
        <Button variant="outline">더 알아보기</Button>
      </div>
    </main>
  );
}
