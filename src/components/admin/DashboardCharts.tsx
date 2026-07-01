"use client";

import * as React from "react";
import { BarChart3, LineChart, Trophy, UserPlus, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PRIMARY = "#FF6FB3";
const SECONDARY = "#6CB8FF";
const PIE_COLORS = ["#FF6FB3", "#6CB8FF", "#A06BFF", "#F59E0B", "#22C55E", "#EF4444", "#14B8A6"];

export type ChartTab = "revenue" | "newUsers" | "topup" | "topProducts" | "categories";

export interface DashboardChartsProps {
  tab: ChartTab;
  revenue: { date: string; orders: number; revenue: number }[];
  newUsers: { date: string; count: number }[];
  topup: { date: string; amount: number }[];
  topProducts: { name: string; count: number }[];
  categories: { name: string; value: number }[];
}

function TooltipBox({
  label,
  rows,
}: {
  label?: string;
  rows: { color: string; name: string; value: string }[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm shadow-xl">
      {label && <p className="mb-1 font-bold text-white">{label}</p>}
      {rows.map((r, i) => (
        <p key={i} className="flex items-center gap-2 text-slate-200">
          <span className="inline-block size-2.5 rounded-full" style={{ background: r.color }} />
          <span className="text-slate-400">{r.name}</span>
          <span className="ml-auto font-semibold text-white">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

const EMPTY = (
  <div className="grid h-[320px] place-items-center text-sm text-slate-400">
    ยังไม่มีข้อมูลสำหรับช่วงเวลานี้
  </div>
);

export function DashboardCharts(props: DashboardChartsProps) {
  const { tab } = props;

  // ===== รายได้ — dark area chart (image2) =====
  if (tab === "revenue") {
    const data = props.revenue ?? [];
    return (
      <div className="rounded-3xl bg-slate-900 p-4 shadow-soft md:p-6">
        {data.length === 0 ? (
          EMPTY
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SECONDARY} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={SECONDARY} stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => "฿" + (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload && payload.length ? (
                    <TooltipBox
                      label={label as string}
                      rows={[
                        {
                          color: PRIMARY,
                          name: "จำนวนออเดอร์",
                          value: `${payload.find((p) => p.dataKey === "orders")?.value ?? 0}`,
                        },
                        {
                          color: SECONDARY,
                          name: "รายได้",
                          value:
                            "฿" +
                            Number(
                              payload.find((p) => p.dataKey === "revenue")?.value ?? 0,
                            ).toLocaleString("th-TH"),
                        },
                      ]}
                    />
                  ) : null
                }
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke={PRIMARY}
                strokeWidth={2}
                fill="url(#gOrders)"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke={SECONDARY}
                strokeWidth={2.5}
                fill="url(#gRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  // ===== ผู้ใช้ใหม่ =====
  if (tab === "newUsers") {
    const data = props.newUsers ?? [];
    return (
      <div className="rounded-3xl bg-slate-900 p-4 shadow-soft md:p-6">
        {data.length === 0 ? (
          EMPTY
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload && payload.length ? (
                    <TooltipBox
                      label={label as string}
                      rows={[
                        { color: PRIMARY, name: "ผู้ใช้ใหม่", value: `${payload[0].value} คน` },
                      ]}
                    />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={PRIMARY}
                strokeWidth={2.5}
                fill="url(#gUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  // ===== เติมเงิน =====
  if (tab === "topup") {
    const data = props.topup ?? [];
    return (
      <div className="rounded-3xl bg-slate-900 p-4 shadow-soft md:p-6">
        {data.length === 0 ? (
          EMPTY
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gTopup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SECONDARY} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={SECONDARY} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => "฿" + (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload && payload.length ? (
                    <TooltipBox
                      label={label as string}
                      rows={[
                        {
                          color: SECONDARY,
                          name: "ยอดเติมเงิน",
                          value: "฿" + Number(payload[0].value).toLocaleString("th-TH"),
                        },
                      ]}
                    />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={SECONDARY}
                strokeWidth={2.5}
                fill="url(#gTopup)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  // ===== สินค้าขายดี — bar chart (light card) =====
  if (tab === "topProducts") {
    const data = props.topProducts ?? [];
    return (
      <div className="glass-panel rounded-3xl border p-4 shadow-soft md:p-6">
        {data.length === 0 ? (
          <div className="grid h-[320px] place-items-center text-sm text-muted-foreground">
            ยังไม่มีข้อมูลสินค้าขายดี
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data} layout="vertical" margin={{ top: 6, right: 24, left: 8, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                width={140}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#FF6FB310" }}
                content={({ active, payload, label }) =>
                  active && payload && payload.length ? (
                    <TooltipBox
                      label={label as string}
                      rows={[{ color: PRIMARY, name: "ขายไป", value: `${payload[0].value} ชิ้น` }]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={PRIMARY} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  // ===== หมวดหมู่ — pie chart (light card) =====
  const data = props.categories ?? [];
  return (
    <div className="glass-panel rounded-3xl border p-4 shadow-soft md:p-6">
      {data.length === 0 ? (
        <div className="grid h-[320px] place-items-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลหมวดหมู่
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Tooltip
              content={({ active, payload }) =>
                active && payload && payload.length ? (
                  <TooltipBox
                    rows={[
                      {
                        color: (payload[0].payload as { fill?: string }).fill ?? PRIMARY,
                        name: (payload[0].payload as { name: string }).name,
                        value: `${payload[0].value} ชิ้น`,
                      },
                    ]}
                  />
                ) : null
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
              label={(entry) => (entry as { name: string }).name}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const TAB_META: { value: ChartTab; label: string; icon: React.ReactNode }[] = [
  { value: "revenue", label: "รายได้", icon: <LineChart className="size-4" /> },
  { value: "newUsers", label: "ผู้ใช้ใหม่", icon: <UserPlus className="size-4" /> },
  { value: "topup", label: "เติมเงิน", icon: <Wallet className="size-4" /> },
  { value: "topProducts", label: "สินค้าขายดี", icon: <Trophy className="size-4" /> },
  { value: "categories", label: "หมวดหมู่", icon: <BarChart3 className="size-4" /> },
];

const TAB_HEADING: Record<ChartTab, string> = {
  revenue: "กราฟรายได้ (30 วันล่าสุด)",
  newUsers: "ผู้ใช้ใหม่ (30 วันล่าสุด)",
  topup: "ยอดเติมเงิน (30 วันล่าสุด)",
  topProducts: "สินค้าขายดี",
  categories: "สัดส่วนตามหมวดหมู่",
};

/** ส่วนกราฟทั้งหมด: แท็บเลือกกราฟ + หัวข้อ + กราฟที่เลือก (owns client state) */
export function DashboardChartsSection(props: Omit<DashboardChartsProps, "tab">) {
  const [tab, setTab] = React.useState<ChartTab>("revenue");

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as ChartTab)}>
        <TabsList className="glass-panel w-full justify-start overflow-x-auto rounded-2xl border p-2 shadow-soft">
          {TAB_META.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 pt-2 text-lg font-bold text-primary">
        <LineChart className="size-5" />
        {TAB_HEADING[tab]}
      </div>

      <DashboardCharts tab={tab} {...props} />
    </div>
  );
}
