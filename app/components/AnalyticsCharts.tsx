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

  return (
    <div className="row g-4">
      {/* Category Pie Chart */}
      <div className="col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title h6 mb-4">Expense Distribution by Category</h5>
            {categoryData.length === 0 ? (
              <p className="text-muted text-center my-5">No expense data available.</p>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹ ${Number(value).toLocaleString()}`} />
                    <Legend />
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
