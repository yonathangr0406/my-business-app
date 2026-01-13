export interface SalesData {
    id?: string;
    fecha: string; // Excel serial date or string
    client: string;
    property: string;
    type: string;
    volume: number;
    commissionPercentage: number;
    commissionBeforeSplit: number;
    split: string;
    netCommission: number;
    status: string;
    paymentDate?: string;
    comments?: string;
    campaign?: string;
    campaignInvestment?: number;
    firstContact?: string;
    closingDate?: string;
    closingCycle?: number;
    daysPassed?: number;
}
