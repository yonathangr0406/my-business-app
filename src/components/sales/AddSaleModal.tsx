import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, DollarSign, User, Building, Tag, FileText, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SalesData } from '../../types/sales';

interface AddSaleModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: SalesData | null;
}

export function AddSaleModal({ onClose, onSuccess, initialData }: AddSaleModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        deal_date: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
        deal_type: 'Reventa',
        client_name: '',
        property_description: '',

        // Financials
        volume: '',
        commission_pct: '0.05',
        commission_gross: '', // Calculated: Vol * Pct
        split_details: '',    // Text
        commission_net: '',   // Editable

        // Dates
        payment_date: '',
        first_contact_date: '',
        closing_date: '',
        closing_cycle_days: '', // Auto-calc

        // Marketing
        campaign_source: '',
        campaign_cost: '',

        comments: ''
    });

    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (val: string | number | undefined) => {
        if (!val) return '';
        if (typeof val === 'number') {
            const d = new Date((val - 25569) * 86400 * 1000);
            return d.toISOString().split('T')[0];
        }
        const d = new Date(val);
        return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                deal_date: formatDateForInput(initialData.fecha) || new Date().toISOString().split('T')[0],
                status: initialData.status || 'Pendiente',
                deal_type: initialData.type || 'Reventa',
                client_name: initialData.client || '',
                property_description: initialData.property || '',

                volume: String(initialData.volume || ''),
                commission_pct: String(initialData.commissionPercentage || '0.05'),
                commission_gross: String(initialData.commissionBeforeSplit || ''),
                split_details: initialData.split || '',
                commission_net: String(initialData.netCommission || ''),

                payment_date: formatDateForInput(initialData.paymentDate),
                first_contact_date: formatDateForInput(initialData.firstContact),
                closing_date: formatDateForInput(initialData.closingDate),
                closing_cycle_days: String(initialData.closingCycle || ''),

                campaign_source: initialData.campaign || '',
                campaign_cost: String(initialData.campaignInvestment || ''),

                comments: initialData.comments || ''
            });
        }
    }, [initialData]);

    // Auto-calculate Gross Commission when Volume or % changes
    useEffect(() => {
        const vol = parseFloat(formData.volume) || 0;
        const pct = parseFloat(formData.commission_pct) || 0;
        if (vol && pct) {
            const gross = (vol * pct).toFixed(2);
            // Only auto-update gross if it wasn't manually set? 
            // Actually gross is strictly vol * pct usually.
            setFormData(prev => ({ ...prev, commission_gross: gross }));
        }
    }, [formData.volume, formData.commission_pct]);

    // Auto-calculate Cycle Days
    useEffect(() => {
        if (formData.first_contact_date && formData.closing_date) {
            const start = new Date(formData.first_contact_date);
            const end = new Date(formData.closing_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setFormData(prev => ({ ...prev, closing_cycle_days: String(diffDays) }));
        }
    }, [formData.first_contact_date, formData.closing_date]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                deal_date: formData.deal_date,
                status: formData.status,
                deal_type: formData.deal_type,
                client_name: formData.client_name,
                property_description: formData.property_description,

                volume: Number(formData.volume) || 0,
                commission_pct: Number(formData.commission_pct) || 0,
                commission_gross: Number(formData.commission_gross) || 0,
                split_details: formData.split_details,
                commission_net: Number(formData.commission_net) || 0,

                payment_date: formData.payment_date || null,
                first_contact_date: formData.first_contact_date || null,
                closing_date: formData.closing_date || null,
                closing_cycle_days: Number(formData.closing_cycle_days) || 0,

                campaign_source: formData.campaign_source,
                campaign_cost: Number(formData.campaign_cost) || 0,

                comments: formData.comments
            };

            let error;
            if (initialData?.id) {
                const res = await supabase.from('deals').update(payload).eq('id', initialData.id);
                error = res.error;
            } else {
                const res = await supabase.from('deals').insert([payload]);
                error = res.error;
            }

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving deal:', err);
            alert('Error saving deal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Sales Record' : 'New Sales Record'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.deal_date}
                                    onChange={e => setFormData({ ...formData, deal_date: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Caido">Caido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.deal_type}
                                onChange={e => setFormData({ ...formData, deal_type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                            >
                                <option value="Reventa">Reventa</option>
                                <option value="Alquiler">Alquiler</option>
                                <option value="Proyecto">Proyecto</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Client Name"
                                    value={formData.client_name}
                                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Property Description"
                                    value={formData.property_description}
                                    onChange={e => setFormData({ ...formData, property_description: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Volume ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.volume}
                                    onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comm % (avg 0.05)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.commission_pct}
                                onChange={e => setFormData({ ...formData, commission_pct: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Comm ($)</label>
                            <input
                                type="number"
                                disabled
                                value={formData.commission_gross}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Split Details</label>
                            <input
                                type="text"
                                placeholder="e.g. 50/50"
                                value={formData.split_details}
                                onChange={e => setFormData({ ...formData, split_details: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Net Commission ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Final amount"
                                value={formData.commission_net}
                                onChange={e => setFormData({ ...formData, commission_net: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20 font-semibold text-remax-blue"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Dates & Cycle */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">First Contact</label>
                            <input
                                type="date"
                                value={formData.first_contact_date}
                                onChange={e => setFormData({ ...formData, first_contact_date: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Closing Date</label>
                            <input
                                type="date"
                                value={formData.closing_date}
                                onChange={e => setFormData({ ...formData, closing_date: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cycle (Days)</label>
                            <input
                                type="number"
                                readOnly
                                value={formData.closing_cycle_days}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
                            <input
                                type="date"
                                value={formData.payment_date}
                                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                            />
                        </div>
                    </div>

                    {/* Marketing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign/Source</label>
                            <div className="relative">
                                <Megaphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Facebook Ads"
                                    value={formData.campaign_source}
                                    onChange={e => setFormData({ ...formData, campaign_source: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Cost ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.campaign_cost}
                                onChange={e => setFormData({ ...formData, campaign_cost: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                        <textarea
                            rows={3}
                            value={formData.comments}
                            onChange={e => setFormData({ ...formData, comments: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue/20"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-remax-blue text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {initialData ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
