import type { IntRange } from "./utils.d.ts";

export interface BudgetType {
    categories: CategoryGroup[];
    transactions: Transaction[];
    version: 0;
}

export interface CategoryGroup {
    categories: Category[];
    name: string;
}

export interface Category {
    name: string;
    target: Target;
}

export type Transaction = InflowTransaction | OutflowTransaction;

export interface TransactionBase {
    amount: number;
    date: number;
    description: string;
    id: string;
    type: string;
}

export interface InflowTransaction extends TransactionBase {
    type: "inflow";
}

export interface OutflowTransaction extends TransactionBase {
    category: string;
    categoryGroup: string;
    type: "outflow";
}

export type Target = PeriodicTarget;

export interface TargetBase {
    amount: number;
    assigned: number;
}

export type PeriodicTarget = WeeklyTarget | MonthlyTarget | YearlyTarget;

export interface PeriodicTargetBase extends TargetBase {
    type: string;
}

export interface DailyTarget extends PeriodicTargetBase {
    type: "daily";
}

export interface WeeklyTarget extends PeriodicTargetBase {
    type: "weekly";
    day: IntRange<1, 8>;
}

export interface MonthlyTarget extends PeriodicTargetBase {
    type: "monthly";
    day: IntRange<1, 32>;
}

export interface YearlyTarget extends PeriodicTargetBase {
    type: "yearly";
    date: number;
}
