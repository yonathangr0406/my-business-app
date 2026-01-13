import { useMemo } from 'react';
import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import type { SalesData } from '../../types/sales';
import { KPICard } from './KPICard';
import { SalesOverTime } from './charts/SalesOverTime';
import { SalesByStatus } from './charts/SalesByStatus';

interface SalesDashboardProps {
    data: SalesData[];
    onReset: () => void;
}

export function SalesDashboard({ data, onReset }: SalesDashboardProps) {
    const stats = useMemo(() => {
        const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);
        const totalCommission = data.reduce((acc, curr) => acc + curr.netCommission, 0);
        const totalSales = data.length;

        // Sort by date to get growth (very basic implementation)
        // Assuming data is somewhat ordered or we sort it.
        // For now showing simple aggregates.

        return {
            volume: totalVolume,
            commission: totalCommission,
            count: totalSales,
            averageTicket: totalVolume / totalSales
        };
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">Sales Dashboard</h2>
                <div className="flex gap-4 items-center">
                    <span className="text-sm text-gray-500">{data.length} records loaded</span>
                    <button
                        onClick={onReset}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        Reset Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Volume"
                    value={`$${stats.volume.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    trend={{ value: 12, label: "vs last month" }}
                />
                <KPICard
                    title="Total Commission"
                    value={`$${stats.commission.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6" />}
                />
                <KPICard
                    title="Total Sales"
                    value={stats.count}
                    icon={<FileText className="w-6 h-6" />}
                />
                <KPICard
                    title="Avg. Ticket"
                    value={`$${Math.round(stats.averageTicket).toLocaleString()}`}
                    icon={<Users className="w-6 h-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesOverTime data={data} />
                <SalesByStatus data={data} />
            </div>
        </div>
    );
}
