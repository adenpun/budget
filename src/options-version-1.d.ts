import { Month as Month1, Target as Target1 } from "./budget-version-1";

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

export type TransactOptions = TransactOptionsInflow | TransactOptionsOutflow;

export type SetTargetOptions = Target1;
