import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { SalesData } from '../../../types/sales';

interface SalesOverTimeProps {
    data: SalesData[];
}

export function SalesOverTime({ data }: SalesOverTimeProps) {
    const chartData = useMemo(() => {
        // Group by Month (using the Excel date number or string)
        const grouped = data.reduce((acc, curr) => {
            // Assuming 'fecha' is an Excel serial number for now as seen in the sample data (e.g., 45518)
            // Excel base date is Dec 30 1899
            let dateObj: Date;

            if (typeof curr.fecha === 'number') {
                dateObj = new Date((curr.fecha - 25569) * 86400 * 1000);
            } else {
                // Fallback or string parsing attempt
                dateObj = new Date(curr.fecha);
            }

            if (isNaN(dateObj.getTime())) return acc;

            const monthKey = format(dateObj, 'MMM yyyy');

            if (!acc[monthKey]) {
                acc[monthKey] = { name: monthKey, volume: 0, commission: 0, date: dateObj };
            }
            acc[monthKey].volume += curr.volume;
            acc[monthKey].commission += curr.netCommission;

            return acc;
        }, {} as Record<string, { name: string; volume: number; commission: number; date: Date }>);

        return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [data]);

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Volume Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        formatter={(value: any, name: any) => [
                            `$${(Number(value) || 0).toLocaleString()}`,
                            name
                        ]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 8 }}
                        name="Volume"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
