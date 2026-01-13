import { supabase } from '../lib/supabase';
import type { SalesData } from '../types/sales';

export async function importDealsToSupabase(data: SalesData[]) {
    const deals = data.map(item => {
        // Helper to convert Excel date (num or string) to ISO string
        const toDate = (val: string | number | undefined): string | null => {
            if (!val) return null;
            if (typeof val === 'number') {
                const dateObj = new Date((val - 25569) * 86400 * 1000);
                return dateObj.toISOString();
            }
            const dateObj = new Date(val);
            return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : null;
        };

        return {
            deal_date: toDate(item.fecha),
            client_name: item.client,
            property_description: item.property,
            deal_type: item.type,
            volume: item.volume,
            commission_pct: item.commissionPercentage,
            commission_gross: item.commissionBeforeSplit,
            split_details: item.split,
            commission_net: item.netCommission,
            status: item.status,
            payment_date: toDate(item.paymentDate),
            comments: item.comments,
            campaign_source: item.campaign,
            campaign_cost: item.campaignInvestment,
            first_contact_date: toDate(item.firstContact),
            closing_date: toDate(item.closingDate),
            closing_cycle_days: item.closingCycle,
        };
    });

    const { error } = await supabase.from('deals').insert(deals);

    if (error) {
        console.error('Error importing deals:', error);
        throw error;
    }

    return true;
}
