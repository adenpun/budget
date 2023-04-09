export interface TransactOptionsBase {
    amount: number;
    description: string;
    type: TransactionType1;
    date?: number;
    id?: string;
}

export interface TransactOptionsInflow extends TransactOptionsBase {
    type: "inflow";
}

export interface TransactOptionsOutflow extends TransactOptionsBase {
    type: "outflow";
    categoryId: string;
}

type TransactOptions = TransactOptionsInflow | TransactOptionsOutflow;
