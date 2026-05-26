'use client';

import * as React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

// 1. RevenueTrendChart
export function RevenueTrendChart({ monthlyRevenue }: { monthlyRevenue: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={monthlyRevenue} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => '₹' + value.toLocaleString('en-IN')}
        />
        <RechartsTooltip 
          formatter={(value: any) => ['₹' + Number(value).toLocaleString('en-IN'), 'Revenue']}
          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#8b5cf6" 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#8b5cf6' }} 
          activeDot={{ r: 6 }} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// 2. StaffRevenueChart
export function StaffRevenueChart({ staffRevenue }: { staffRevenue: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={staffRevenue} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
        <RechartsTooltip 
          formatter={(value: any) => ['₹' + Number(value).toLocaleString('en-IN'), 'Revenue']}
          cursor={false}
          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={false}>
          {staffRevenue.map((entry: any, index: number) => {
            const colors = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6'];
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// 3. PatientRetentionChart
export function PatientRetentionChart({ patientRetention }: { patientRetention: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={patientRetention}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={false}
        >
          {patientRetention.map((entry: any, index: number) => {
            const colors = ['#14b8a6', '#f43f5e']; // Teal for New, Rose for Returning
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 4. AppointmentStatusChart
export function AppointmentStatusChart({ appointmentStatus }: { appointmentStatus: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={appointmentStatus}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={false}
        >
          {appointmentStatus.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 5. TopTreatmentsChart
export function TopTreatmentsChart({ topTreatmentsByRevenue }: { topTreatmentsByRevenue: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={topTreatmentsByRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => '₹' + value.toLocaleString('en-IN')} 
        />
        <RechartsTooltip 
          formatter={(value: any) => ['₹' + Number(value).toLocaleString('en-IN'), 'Revenue']}
          cursor={false}
          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {topTreatmentsByRevenue.map((entry: any, index: number) => {
             const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];
             return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
