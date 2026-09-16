"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/", label: "예가율 테스트", match: (p: string) => p === "/" || p.startsWith("/test") },
  { href: "/history", label: "전체 내역", match: (p: string) => p.startsWith("/history") },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="relative mx-auto flex h-14 w-full max-w-[1576px] items-center justify-center px-6">
        <nav className="flex items-center gap-12">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[17px] font-semibold transition-colors",
                item.match(pathname) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="absolute right-6" aria-label="메뉴 열기" />}
          >
            <MenuIcon className="size-6" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-2">
              {NAV.map((item) => (
                <SheetClose
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
