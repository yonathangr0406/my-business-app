import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SalesData } from '../../../types/sales';

interface SalesByStatusProps {
    data: SalesData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function SalesByStatus({ data }: SalesByStatusProps) {
    const chartData = useMemo(() => {
        const grouped = data.reduce((acc, curr) => {
            const status = curr.status || 'Unknown';
            if (!acc[status]) {
                acc[status] = { name: status, count: 0, volume: 0 };
            }
            acc[status].count += 1;
            acc[status].volume += curr.volume;
            return acc;
        }, {} as Record<string, { name: string; count: number; volume: number }>);

        return Object.values(grouped).sort((a, b) => b.volume - a.volume);
    }, [data]);

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Status</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
