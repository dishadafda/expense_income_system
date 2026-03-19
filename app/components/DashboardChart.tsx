"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";

type Point = {
  amount: number;
  date: string; // ISO string or anything parsable by Date
};

type ChartProps = {
  incomes: Point[];
  expenses: Point[];
};

type ViewMode = "monthly" | "yearly";

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (Math.abs(value) >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

function buildChartData(
  incomes: Point[],
  expenses: Point[],
  viewMode: ViewMode,
) {
  const now = new Date();
  const thisYear = now.getFullYear();

  if (viewMode === "monthly") {
    const months = Array.from({ length: 12 }).map((_, idx) => ({
      key: idx,
      label: new Date(thisYear, idx, 1).toLocaleString("default", {
        month: "short",
      }),
      income: 0,
      expense: 0,
    }));

    incomes.forEach((p) => {
      const d = new Date(p.date);
      if (d.getFullYear() !== thisYear) return;
      const m = d.getMonth();
      months[m].income += p.amount;
    });

    expenses.forEach((p) => {
      const d = new Date(p.date);
      if (d.getFullYear() !== thisYear) return;
      const m = d.getMonth();
      months[m].expense += p.amount;
    });

    return months;
  }

  // yearly: last 5 years including current year
  const yearsRange = Array.from({ length: 5 }).map((_, idx) => thisYear - 4 + idx);

  const years = yearsRange.map((year) => ({
    key: year,
    label: String(year),
    income: 0,
    expense: 0,
  }));

  incomes.forEach((p) => {
    const d = new Date(p.date);
    const y = d.getFullYear();
    const bucket = years.find((yr) => yr.key === y);
    if (bucket) bucket.income += p.amount;
  });

  expenses.forEach((p) => {
    const d = new Date(p.date);
    const y = d.getFullYear();
    const bucket = years.find((yr) => yr.key === y);
    if (bucket) bucket.expense += p.amount;
  });

  return years;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const income = payload.find((p: any) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p: any) => p.dataKey === "expense")?.value ?? 0;

  return (
    <div className="card shadow-sm border-0 rounded-4 px-3 py-2" style={{ minWidth: 180 }}>
      <div className="fw-semibold mb-1">{label}</div>
      <div className="d-flex flex-column gap-1 small">
        <span className="d-flex justify-content-between align-items-center">
          <span className="d-flex align-items-center gap-1">
            <span
              className="rounded-circle"
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                backgroundColor: "#0056A3",
              }}
            />
            Income
          </span>
          <span className="fw-semibold text-success">
            {formatCurrency(Number(income))}
          </span>
        </span>
        <span className="d-flex justify-content-between align-items-center">
          <span className="d-flex align-items-center gap-1">
            <span
              className="rounded-circle"
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                backgroundColor: "#80cfff",
              }}
            />
            Expense
          </span>
          <span className="fw-semibold text-danger">
            {formatCurrency(Number(expense))}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function DashboardChart({ incomes, expenses }: ChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  const chartData = useMemo(
    () => buildChartData(incomes, expenses, viewMode),
    [incomes, expenses, viewMode],
  );

  const maxVal =
    chartData.length === 0
      ? 0
      : Math.max(
          ...chartData.map((d) => Math.max(d.income || 0, d.expense || 0)),
        );

  return (
    <div className="card shadow-sm p-4 h-100" style={{ minHeight: 300 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h6 className="fw-bold mb-1">Money flow</h6>
          <small className="text-muted">
            {viewMode === "monthly"
              ? "This year's monthly income and expenses"
              : "Yearly trend for the last 5 years"}
          </small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1 small text-muted">
              <span
                className="rounded-circle"
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  backgroundColor: "#0056A3",
                }}
              />
              Income
            </div>
            <div className="d-flex align-items-center gap-1 small text-muted">
              <span
                className="rounded-circle"
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  backgroundColor: "#80cfff",
                }}
              />
              Expense
            </div>
          </div>

          <select
            className="form-select form-select-sm border-0 bg-light fw-semibold"
            style={{ width: 190 }}
            value={viewMode}
            onChange={(e) =>
              setViewMode(e.target.value === "yearly" ? "yearly" : "monthly")
            }
          >
            <option value="monthly">This Year (Monthly)</option>
            <option value="yearly">Yearly (Last 5 Years)</option>
          </select>
        </div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            barGap={8}
            barCategoryGap="35%"
          >
            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(v) => formatCurrency(Number(v))}
              domain={[0, maxVal === 0 ? 1 : maxVal * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
            <Bar
              dataKey="income"
              fill="#0056A3"
              radius={[8, 8, 0, 0]}
              maxBarSize={26}
            />
            <Bar
              dataKey="expense"
              fill="#80cfff"
              radius={[8, 8, 0, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

