import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100',
  subtitle,
  trend,
  trendUp
}) {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-sm font-medium mt-2",
                trendUp ? "text-green-600" : "text-red-600"
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}