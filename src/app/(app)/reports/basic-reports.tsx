'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

interface BasicReportsProps {
  data: {
    revenue: { current: number; change: number };
    patients: { current: number; change: number };
    appointments: { current: number; change: number };
    topTreatments: { name: string; count: number }[];
  } | null;
  isLoading: boolean;
}

export function BasicReports({ data, isLoading }: BasicReportsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                <div className="h-3 w-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 w-48 bg-muted rounded"></div>
          </CardHeader>
          <CardContent className="h-[350px] bg-muted/50 rounded-xl m-4"></CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const MetricCard = ({ title, value, change, icon: Icon, prefix = "" }: any) => {
    const isPositive = change >= 0;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{prefix}{value.toLocaleString('en-IN')}</div>
          <div className="flex items-center text-xs mt-1">
            <span className={`flex items-center ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-2">from previous period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" id="basic-reports-content">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Total Revenue" 
          value={data.revenue.current} 
          change={data.revenue.change} 
          icon={IndianRupee} 
          prefix="₹" 
        />
        <MetricCard 
          title="New Patients Registered" 
          value={data.patients.current} 
          change={data.patients.change} 
          icon={Users} 
        />
        <MetricCard 
          title="Total Appointments" 
          value={data.appointments.current} 
          change={data.appointments.change} 
          icon={Calendar} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Treatments by Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topTreatments.length > 0 ? (
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTreatments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => Math.floor(v).toString()} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.topTreatments.map((entry, index) => {
                      const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
              Not enough data available for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
