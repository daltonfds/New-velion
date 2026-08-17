"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Day 1", sales: 0, profit: 0 },
  { name: "Day 5", sales: 120, profit: 10 },
  { name: "Day 10", sales: 210, profit: 45 },
  { name: "Day 15", sales: 340, profit: 80 },
  { name: "Day 20", sales: 280, profit: 65 },
  { name: "Day 25", sales: 410, profit: 90 },
  { name: "Day 30", sales: 550, profit: 120 },
];

export default function TrendChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
          <Line type="monotone" dataKey="sales" stroke="#5946E6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
