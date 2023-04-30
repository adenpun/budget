import { v4 as randomUUID } from "uuid";
import { z } from "zod";
import {
    Account as Account2,
    BudgetType as BudgetType2,
    Category as Category2,
    CategoryGroup as CategoryGroup2,
    Month,
    Target as Target2,
    Transaction as Transaction2,
} from "./budget-version-2";
import type {
    SetTargetOptions as SetTargetOptions2,
    TransactOptions as TransactOptions2,
} from "./options-version-2";
import { DateToMonth, FilterKeys, GetClosestLastMonth, MonthCompare } from "./utils";
import { BudgetType as BudgetType1 } from "./budget-version-1";

export class Budget {
    private m_budget: z.infer<typeof BudgetType2> = {
        accounts: [],
        categoryGroups: [],
        version: 2,
    };

    public addAccount(name: string, id?: string) {
        id ??= randomUUID();
        if (this.getAccount(id) === null) {
            this.m_budget.accounts.push({
                id,
                name,
                transactions: [],
            });
            return id;
        }
        return null;
    }

    public addCategory(categoryGroupId: string, name: string, id?: string): string | null {
        let group = this.m_budget.categoryGroups.find((v) => v.id === categoryGroupId);
        id ??= randomUUID();
        if (this.getCategory(id) === null) {
            group?.categories.push({
                assigned: {
                    "20-2": 0,
                },
                id,
                name,
                target: {},
            });
            return id;
        }
        return null;
    }

    public addCategoryGroup(name: string, id?: string): string | null {
        id ??= randomUUID();
        if (this.getCategoryGroup(id) === null) {
            this.m_budget.categoryGroups.push({
                categories: [],
                id,
                name,
            });
            return id;
        }
        return null;
    }

    public assign(id: string, month: z.infer<typeof Month>, amount: number): void {
        let cat = this.getCategory(id);
        if (cat !== null) cat.assigned[month] = amount;
    }

    public deleteCategory(id: string): void {
        let group = this.m_budget.categoryGroups.find((v) => v.categories.find((v) => v.id === id));
        if (typeof group !== "undefined")
            group.categories = group.categories.filter((v) => v.id !== id);
    }

    public deleteCategoryGroup(id: string): void {
        this.m_budget.categoryGroups = this.m_budget.categoryGroups.filter((v) => v.id !== id);
    }

    public deleteTarget(id: string, month: z.infer<typeof Month>): void {
        let cat = this.getCategory(id);
        if (cat === null) return;
        cat.target = FilterKeys(this.getCategory(id)?.target!, (v) => v !== month) as any;
    }

    public deleteTransaction(id: string): void {
        let account = this.getAccountByTransaction(id);
        if (account !== null)
            account.transactions = account.transactions.filter((v) => v.id !== id);
    }

    public getAccount(id: string): z.infer<typeof Account2> | null {
        return this.m_budget.accounts.find((v) => v.id === id) ?? null;
    }

    public getAccountByTransaction(id: string): z.infer<typeof Account2> | null {
        return this.m_budget.accounts.find((v) => v.transactions.find((v) => v.id === id)) ?? null;
    }

    public getAssigned(
        id: string,
        month: z.infer<typeof Month>,
        allowPast?: boolean,
        includePast?: boolean
    ): number | null {
        let cat = this.getCategory(id);
        if (typeof cat?.assigned === "undefined") return null;
        if (allowPast) {
            const months = Object.keys(cat.assigned) as z.infer<typeof Month>[];
            if (includePast) {
                return months
                    .filter((v) => MonthCompare(v, month) <= 0)
                    .reduce((p, c) => p + (cat?.assigned[c as z.infer<typeof Month>] ?? 0), 0);
            } else {
                return cat.assigned[GetClosestLastMonth(months, month)] ?? null;
            }
        } else {
            return cat.assigned[month] ?? null;
        }
    }

    public getAssignedSum(month: z.infer<typeof Month>, includePast?: boolean): number {
        const assigneds = this.m_budget.categoryGroups.flatMap((v) =>
            v.categories.map((v) => this.getAssigned(v.id, month, includePast, includePast) ?? 0)
        );
        return assigneds.reduce((p, v) => p + v, 0);
    }

    public getAssignLimit(month: z.infer<typeof Month>): number {
        return this.getTransactionInflowSum(month) - this.getAssignedSum(month, true);
    }

    public getAvailable(id: string, month: z.infer<typeof Month>): number {
        return (
            (this.getAssigned(id, month, true) ?? 0) -
            this.getTransactionsOfCategory(id, month)
                .map((v) => v.amount)
                .reduce((p, c) => p + c, 0)
        );
    }

    public getBalance(month: z.infer<typeof Month>, account?: string): number {
        let transactions =
            this.getTransactions(account)
                .filter((v) => {
                    return MonthCompare(DateToMonth(v.date), month) <= 0;
                })
                .map((v) => {
                    return v.type === "inflow" ? v.amount : -v.amount;
                }) ?? [];
        return transactions.reduce((p, c) => p + c, 0);
    }

    public getCategory(id: string): z.infer<typeof Category2> | null {
        return (
            this.m_budget.categoryGroups
                .find((v) => v.categories.find((v) => v.id === id))
                ?.categories.find((v) => v.id === id) ?? null
        );
    }

    public getCategoryGroup(id: string): z.infer<typeof CategoryGroup2> | null {
        return this.m_budget.categoryGroups.find((v) => v.id === id) ?? null;
    }

    public getTarget(id: string, month: z.infer<typeof Month>): z.infer<typeof Target2> | null {
        const target = this.getCategory(id)?.target;
        if (typeof target === "undefined") return null;
        const months = Object.keys(target) as z.infer<typeof Month>[];
        return target[GetClosestLastMonth(months, month)] ?? null;
    }

    public getTransaction(id: string): z.infer<typeof Transaction2> | null {
        return (
            this.m_budget.accounts.flatMap((v) => v.transactions).find((v) => v.id === id) ?? null
        );
    }

    public getTransactions(account?: string): z.infer<typeof Transaction2>[] {
        if (typeof account !== "undefined")
            return this.m_budget.accounts.find((v) => v.id === account)?.transactions ?? [];
        else return this.m_budget.accounts.flatMap((v) => v.transactions);
    }

    public getTransactionInflowSum(month: z.infer<typeof Month>, account?: string): number {
        let transactions =
            this.getTransactions(account)
                .filter((v) => {
                    return v.type === "inflow" && MonthCompare(DateToMonth(v.date), month) <= 0;
                })
                .map((v) => v.amount) ?? [];
        return transactions.reduce((p, c) => p + c, 0);
    }

    public getTransactionsOfCategory(
        id: string,
        month: z.infer<typeof Month>
    ): z.infer<typeof Transaction2>[] {
        return this.getTransactions().filter(
            (v) =>
                v.type === "outflow" &&
                v.categoryId === id &&
                MonthCompare(DateToMonth(v.date), month) <= 0
        );
    }

    public getTransactionOutflowSum(month: z.infer<typeof Month>, account?: string): number {
        let transactions =
            this.getTransactions(account)
                .filter((v) => {
                    return v.type === "outflow" && MonthCompare(DateToMonth(v.date), month) <= 0;
                })
                .map((v) => v.amount) ?? [];
        return transactions.reduce((p, c) => p + c, 0);
    }

    public setTarget(
        id: string,
        month: z.infer<typeof Month>,
        options: z.infer<typeof SetTargetOptions2>
    ): void {
        const cat = this.getCategory(id);
        if (cat === null) return;
        // @ts-ignore
        cat.target[month] = options;
    }

    public toJSON(): z.infer<typeof BudgetType2> {
        return structuredClone(this.m_budget);
    }

    public transact(options: z.infer<typeof TransactOptions2>): string | null {
        options.date ??= Date.now();
        options.id ??= randomUUID();

        if (this.getTransaction(options.id) !== null) return null;

        if (options.type === "inflow") {
            this.getAccount(options.account)?.transactions.push({
                amount: options.amount,
                date: options.date,
                description: options.description,
                id: options.id,
                type: options.type,
            });
            return options.id;
        } else if (options.type === "outflow") {
            this.getAccount(options.account)?.transactions.push({
                amount: options.amount,
                categoryId: options.categoryId,
                date: options.date,
                description: options.description,
                id: options.id,
                type: options.type,
            });
            return options.id;
        } else if (options.type === "transfer") {
            // return null;
        }
        return null;
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    public update() {
        let version = this.m_budget.version as number;

        if (version === 1) {
            let budget = BudgetType1.parse(this.m_budget);
            this.m_budget.version = 2;
            // TODO
        }
    }

    public static fromJSON(json: z.infer<typeof BudgetType2>): Budget {
        BudgetType2.parse(json);
        let budget = new Budget();
        budget.m_budget = json;
        return budget;
    }
}
