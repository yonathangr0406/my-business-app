import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, Database, UploadCloud, Plus } from 'lucide-react';
import type { SalesData } from '../types/sales';
import { SalesDashboard } from '../components/sales/SalesDashboard';
import { SalesFilters } from '../components/sales/SalesFilters';
import { SalesTable } from '../components/sales/SalesTable';
import { supabase } from '../lib/supabase';
import { importDealsToSupabase } from '../utils/importDeals';
import { AddSaleModal } from '../components/sales/AddSaleModal';

export default function SalesReport() {
    const [salesData, setSalesData] = useState<SalesData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [showImportPrompt, setShowImportPrompt] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSale, setEditingSale] = useState<SalesData | null>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const loadFromSupabase = async () => {
        const { data, error } = await supabase.from('deals').select('*');
        if (error) throw error;

        // Map Supabase DB rows back to SalesData interface for UI compatibility
        return data.map((d: any) => ({
            id: d.id,
            fecha: d.deal_date,
            client: d.client_name,
            property: d.property_description,
            type: d.deal_type,
            volume: Number(d.volume),
            commissionPercentage: Number(d.commission_pct),
            commissionBeforeSplit: Number(d.commission_gross),
            split: d.split_details,
            netCommission: Number(d.commission_net),
            status: d.status,
            paymentDate: d.payment_date,
            comments: d.comments,
            campaign: d.campaign_source,
            campaignInvestment: Number(d.campaign_cost),
            firstContact: d.first_contact_date,
            closingDate: d.closing_date,
            closingCycle: Number(d.closing_cycle_days),
            daysPassed: 0
        })) as SalesData[];
    };

    const importData = async () => {
        if (!salesData) return;
        setIsImporting(true);
        try {
            await importDealsToSupabase(salesData);
            setShowImportPrompt(false);
            // Reload from DB to verify
            const dbData = await loadFromSupabase();
            setSalesData(dbData);
        } catch (err: any) {
            alert('Failed to import: ' + err.message);
        } finally {
            setIsImporting(false);
        }
    };

    // Reload function to be passed to modal
    const reloadData = async () => {
        setIsLoading(true);
        try {
            const dbData = await loadFromSupabase();
            setSalesData(dbData);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Check Supabase first
                const dbData = await loadFromSupabase();

                if (dbData && dbData.length > 0) {
                    setSalesData(dbData);
                } else {
                    // 2. If empty, load Excel and prompt for import
                    const response = await fetch('/sales_data.xlsx');
                    if (!response.ok) throw new Error('Failed to fetch sales data file');

                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = 'Sales';

                    if (!workbook.SheetNames.includes(sheetName)) {
                        throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
                    } else {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        const rows = jsonData.slice(1) as any[];

                        const parsedData: SalesData[] = rows.map((row) => ({
                            fecha: row[0],
                            client: row[1],
                            property: row[2],
                            type: row[3],
                            volume: Number(row[4]) || 0,
                            commissionPercentage: Number(row[5]) || 0,
                            commissionBeforeSplit: Number(row[6]) || 0,
                            split: row[7],
                            netCommission: Number(row[8]) || 0,
                            status: row[9],
                            paymentDate: row[10],
                            comments: row[11],
                            campaign: row[12],
                            campaignInvestment: Number(row[13]) || 0,
                            firstContact: row[14],
                            closingDate: row[15],
                            closingCycle: Number(row[16]) || 0,
                            daysPassed: Number(row[17]) || 0,
                        })).filter(item => item.client && item.volume > 0);

                        setSalesData(parsedData);
                        setShowImportPrompt(true); // Offer import
                    }
                }
            } catch (err: any) {
                console.error("Error loading data:", err);
                setError(err.message || "Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        if (!salesData) return [];

        return salesData.filter(item => {
            // Search Term (Client or Property)
            const matchesSearch =
                (item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.property?.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status
            const matchesStatus = statusFilter ? item.status === statusFilter : true;

            // Date Range
            let matchesDate = true;
            if (dateRange.start || dateRange.end) {
                let itemDateStr = '';
                if (typeof item.fecha === 'number') {
                    // Convert Excel Number to ISO YYYY-MM-DD for comparison
                    const dateObj = new Date((item.fecha - 25569) * 86400 * 1000);
                    itemDateStr = dateObj.toISOString().split('T')[0];
                } else {
                    // Try to parse string
                    const dateObj = new Date(item.fecha);
                    if (!isNaN(dateObj.getTime())) {
                        itemDateStr = dateObj.toISOString().split('T')[0];
                    }
                }

                if (dateRange.start && itemDateStr < dateRange.start) matchesDate = false;
                if (dateRange.end && itemDateStr > dateRange.end) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [salesData, searchTerm, statusFilter, dateRange]);

    // Derived Statuses for Dropdown
    const availableStatuses = useMemo(() => {
        if (!salesData) return [];
        return Array.from(new Set(salesData.map(d => d.status).filter(Boolean)));
    }, [salesData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-remax-blue" />
                <span className="ml-2 text-gray-500">Loading sales data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">Error loading report</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const handleEdit = (sale: SalesData) => {
        setEditingSale(sale);
        setShowAddModal(true);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500 mt-2">Sales performance overview</p>
            </div>

            {salesData && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        {showImportPrompt ? (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between flex-1 mr-4">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">Migrate to Database</h3>
                                        <p className="text-sm text-blue-700">Import your Excel data to the database to enable editing and new entries.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={importData}
                                    disabled={isImporting}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                    Import Data
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        {!showImportPrompt && (
                            <button
                                onClick={() => {
                                    setEditingSale(null);
                                    setShowAddModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-remax-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm h-fit"
                            >
                                <Plus className="w-4 h-4" />
                                New Sale
                            </button>
                        )}
                    </div>

                    <SalesFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setDateRange({ start: '', end: '' });
                        }}
                        statuses={availableStatuses}
                    />

                    <SalesDashboard
                        data={filteredData}
                        onReset={() => { }}
                    />

                    <SalesTable
                        data={filteredData}
                        onEdit={handleEdit}
                    />

                    {showAddModal && (
                        <AddSaleModal
                            onClose={() => {
                                setShowAddModal(false);
                                setEditingSale(null);
                            }}
                            onSuccess={reloadData}
                            initialData={editingSale}
                        />
                    )}
                </>
            )}
        </div>
    );
}
