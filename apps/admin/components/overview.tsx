"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Mon",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Tue",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Wed",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Thu",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Fri",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Sat",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "Sun",
    total: Math.floor(Math.random() * 5) + 1,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}