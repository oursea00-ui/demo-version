import { cn } from "@/lib/utils";

export function PageShell({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("mx-auto flex w-full max-w-[1576px] flex-1 flex-col px-6 pt-[108px] pb-24", className)}
      {...props}
    />
  );
}

export function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 className={cn("text-4xl font-bold tracking-tight", className)} {...props} />;
}

/** 아직 데이터가 없는 영역 */
export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-40 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}
