"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

export function FaqManager({ initial }: { initial: FaqItem[] }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function addFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, sortOrder: initial.length }),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error ?? "เพิ่มไม่สำเร็จ");
      else {
        setQuestion("");
        setAnswer("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("ลบ FAQ นี้?")) return;
    const res = await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) alert(data.error ?? "ลบไม่สำเร็จ");
    else router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการ FAQ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={addFaq} className="space-y-3 rounded-xl border p-4">
          <div>
            <Label>คำถาม</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div>
            <Label>คำตอบ</Label>
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>
            + เพิ่ม FAQ
          </Button>
        </form>

        {initial.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มี FAQ</p>
        ) : (
          <div className="space-y-2">
            {initial.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-xl border p-3">
                <div>
                  <p className="font-semibold">{f.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                  <Badge variant="muted" className="mt-2">
                    ลำดับ {f.sortOrder}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => remove(f.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
