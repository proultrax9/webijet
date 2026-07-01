"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/20 bg-white/60 p-8 text-center text-sm text-muted-foreground">
        ยังไม่มีคำถามที่พบบ่อยในขณะนี้
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-white/70 bg-card shadow-soft"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="size-4.5" />
              </span>
              <span className="flex-1 font-semibold text-foreground">{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-primary transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-4 pl-16 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
