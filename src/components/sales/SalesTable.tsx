import { Pencil } from 'lucide-react';
import type { SalesData } from '../../types/sales';

interface SalesTableProps {
    data: SalesData[];
    onEdit?: (sale: SalesData) => void;
}

export function SalesTable({ data, onEdit }: SalesTableProps) {
    if (!data || data.length === 0) {
        return <div className="text-gray-500 text-center py-8">No data available</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Detailed Sales Report</h2>
                <span className="text-sm text-gray-500">{data.length} records found</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Property</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-right">Volume</th>
                            <th className="px-6 py-4 text-right">Comm %</th>
                            <th className="px-6 py-4 text-right">Gross Comm</th>
                            <th className="px-6 py-4">Split</th>
                            <th className="px-6 py-4 text-right">Net Comm</th>
                            <th className="px-6 py-4">Payment Date</th>
                            <th className="px-6 py-4">Campaign</th>
                            <th className="px-6 py-4 text-right">Inv. Camp</th>
                            <th className="px-6 py-4">1st Contact</th>
                            <th className="px-6 py-4">Closing</th>
                            <th className="px-6 py-4 text-center">Cycle (Days)</th>
                            <th className="px-6 py-4">Comments</th>
                            {onEdit && <th className="px-6 py-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row, index) => {
                            // Safe parsing for date
                            let displayDate = typeof row.fecha === 'string' ? row.fecha : '';
                            if (typeof row.fecha === 'number') {
                                const d = new Date((row.fecha - 25569) * 86400 * 1000);
                                displayDate = d.toLocaleDateString();
                            } else if (row.fecha) {
                                const d = new Date(row.fecha);
                                if (!isNaN(d.getTime())) displayDate = d.toLocaleDateString();
                            }

                            return (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{displayDate}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${row.status === 'Pagado' ? 'bg-green-100 text-green-700' :
                                                    row.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }
                      `}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.client}</td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={row.property}>{row.property}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.type}</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        ${(Number(row.volume) || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600">
                                        {Number(row.commissionPercentage) > 1
                                            ? (Number(row.commissionPercentage)).toFixed(2) + '%'
                                            : (Number(row.commissionPercentage) * 100).toFixed(2) + '%'
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600">
                                        ${(Number(row.commissionBeforeSplit) || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{row.split}</td>
                                    <td className="px-6 py-4 text-right font-medium text-remax-blue">
                                        ${(Number(row.netCommission) || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.paymentDate}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.campaign}</td>
                                    <td className="px-6 py-4 text-right text-gray-600">
                                        ${(Number(row.campaignInvestment) || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.firstContact}</td>
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.closingDate}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">{row.closingCycle}</td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={row.comments}>{row.comments}</td>
                                    {onEdit && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="text-gray-400 hover:text-remax-blue transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
