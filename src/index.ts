import type {
    BudgetType as BudgetType1,
    Category as Category1,
    CategoryGroup as CategoryGroup1,
    Month,
    Transaction as Transaction1,
    TransactionType as TransactionType1,
} from "./budget-version-1.d.ts";
import { randomUUID } from "node:crypto";
import { TransactOptions } from "./types.js";
export type * from "./budget-version-1.d.ts";

export class Budget {
    private m_budget: BudgetType1 = {
        categories: [],
        transactions: [],
        version: 1,
    };

    public addCategory(categoryGroupId: string, name: string, id?: string): string | null {
        let group = this.m_budget.categories.find((v) => v.id === categoryGroupId);
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
            this.m_budget.categories.push({
                categories: [],
                id,
                name,
            });
            return id;
        }
        return null;
    }

    public assign(id: string, month: Month, amount: number): void {
        let cat = this.getCategory(id);
        if (cat !== null) cat.assigned[month] = amount;
    }

    public deleteCategory(id: string): void {
        let group = this.m_budget.categories.find((v) => v.categories.find((v) => v.id === id));
        if (typeof group !== "undefined")
            group.categories = group.categories.filter((v) => v.id !== id);
    }

    public deleteCategoryGroup(id: string): void {
        this.m_budget.categories = this.m_budget.categories.filter((v) => v.id !== id);
    }

    public deleteTransaction(id: string): void {
        this.m_budget.transactions = this.m_budget.transactions.filter((v) => v.id !== id);
    }

    public getAssigned(id: string, month: Month): number | null {
        return this.getCategory(id)?.assigned[month] ?? null;
    }

    public getCategory(id: string): Category1 | null {
        return (
            this.m_budget.categories
                .find((v) => v.categories.find((v) => v.id === id))
                ?.categories.find((v) => v.id === id) ?? null
        );
    }

    public getCategoryGroup(id: string): CategoryGroup1 | null {
        return this.m_budget.categories.find((v) => v.id === id) ?? null;
    }

    public getTransaction(id: string): Transaction1 | null {
        return this.m_budget.transactions.find((v) => v.id === id) ?? null;
    }

    public setTarget(id: string, options: any): void {}

    public toJSON() {
        return structuredClone(this.m_budget);
    }

    public transact(options: TransactOptions): string | null {
        options.date ??= Date.now();
        options.id ??= randomUUID();

        if (this.getTransaction(options.id) !== null) return null;

        if (options.type === "inflow") {
            this.m_budget.transactions.push({
                amount: options.amount,
                date: options.date,
                description: options.description,
                id: options.id,
                type: options.type,
            });
            return options.id;
        } else {
            this.m_budget.transactions.push({
                amount: options.amount,
                categoryId: options.categoryId,
                date: options.date,
                description: options.description,
                id: options.id,
                type: options.type,
            });
            return options.id;
        }
    }

    public get balance() {
        let a = this.m_budget.transactions.map((v) => {
            return v.type === "inflow" ? v.amount : -v.amount;
        });
        return a.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    public static fromJSON(json: BudgetType1) {
        let budget = new Budget();
        budget.m_budget = json;
        return budget;
    }
}
