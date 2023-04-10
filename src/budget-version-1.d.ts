/** `${year}-${month}` */
export type Month = `${number}-${number}`;

/** `${month}-${day}` */
export type DayOfYear = `${number}-${number}`;

export interface BudgetType {
    categories: CategoryGroup[];
    transactions: Transaction[];
    version: 1;
}

export interface CategoryGroup {
    categories: Category[];
    id: string;
    name: string;
}

export interface Category {
    assigned: Record<Month, number>;
    id: string;
    name: string;
    target: Record<Month, Target>;
}

export type Transaction = InflowTransaction | OutflowTransaction;

export type TransactionType = "inflow" | "outflow";

export interface TransactionBase {
    amount: number;
    date: number;
    description: string;
    id: string;
    type: TransactionType;
}

export interface InflowTransaction extends TransactionBase {
    type: "inflow";
}

export interface OutflowTransaction extends TransactionBase {
    categoryId: string;
    type: "outflow";
}

export type Target = PeriodicTarget;

export interface TargetBase {
    amount: number;
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
    day: number;
}

export interface MonthlyTarget extends PeriodicTargetBase {
    type: "monthly";
    day: number;
}

export interface YearlyTarget extends PeriodicTargetBase {
    type: "yearly";
    date: DayOfYear;
}
