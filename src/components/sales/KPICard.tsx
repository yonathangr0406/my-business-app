import React from 'react';
import { cn } from '../../utils/cn';

interface KPICardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
}

export function KPICard({ title, value, icon, trend, className }: KPICardProps) {
    return (
        <div className={cn("bg-white p-6 rounded-xl shadow-sm border border-gray-100", className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                {icon && (
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn(
                        "font-medium",
                        trend.value >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </span>
                    <span className="text-gray-500 ml-2">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
