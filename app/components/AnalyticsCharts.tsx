"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface AnalyticsChartsProps {
  categoryData: { name: string; value: number }[];
  projectData: { name: string; income: number; expense: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

export default function AnalyticsCharts({ categoryData, projectData }: AnalyticsChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="p-5 text-center text-muted">Loading charts...</div>;

  const categoryTotal = categoryData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="row g-4">
      {/* Category Pie Chart */}
      <div className="col-md-6">
        <div className="card shadow-sm h-100 overflow-visible">
          <div className="card-body overflow-visible">
            <h5 className="card-title h6 mb-4">Expense Distribution by Category</h5>
            {categoryData.length === 0 ? (
              <p className="text-muted text-center my-5">No expense data available.</p>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 380,
                  minHeight: 380,
                  overflow: "visible",
                  padding: "8px 12px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 16, right: 24, bottom: 8, left: 24 }}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ percent, x, y, textAnchor }) => (
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                          fill="#1e293b"
                          fontSize={13}
                          fontWeight={600}
                        >
                          {`${((percent || 0) * 100).toFixed(0)}%`}
                        </text>
                      )}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => [
                        `₹ ${Number(value ?? 0).toLocaleString()}`,
                        (item as { payload?: { name?: string } })?.payload?.name ?? "Category",
                      ]}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: 16, fontSize: 12, lineHeight: "1.6" }}
                      content={() => (
                        <ul className="list-unstyled mb-0 text-center small">
                          {categoryData.map((entry, index) => (
                            <li key={entry.name} className="mb-1">
                              <span
                                className="d-inline-block rounded-1 me-2 align-middle"
                                style={{
                                  width: 10,
                                  height: 10,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              {entry.name} —{" "}
                              {categoryTotal > 0
                                ? ((entry.value / categoryTotal) * 100).toFixed(0)
                                : 0}
                              %
                            </li>
                          ))}
                        </ul>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Bar Chart */}
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title h6 mb-4">Project Overview: Income vs Expense</h5>
            {projectData.length === 0 ? (
              <p className="text-muted text-center my-5">No project data available.</p>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={projectData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₹ ${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#00C49F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#FF8042" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
