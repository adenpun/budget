import type { BudgetType, Category, Transaction } from "./budget.d.ts";
export type * from "./budget.d.ts";

export class Budget {
    private m_budget: BudgetType = {
        categories: [],
        transactions: [],
        version: 0,
    };

    public addCategory(categoryGroup: string, config: Category) {
        let group = this.m_budget.categories.find((v) => v.name === categoryGroup);
        if (typeof group?.categories.find((v) => v.name === config.name) === "undefined")
            group?.categories.push(config);
    }

    public addCategoryGroup(name: string) {
        if (typeof this.m_budget.categories.find((v) => v.name === name) === "undefined")
            this.m_budget.categories.push({
                categories: [],
                name,
            });
    }

    public assign(categoryGroup: string, category: string, amount: number) {
        let cat = this.getCategory(categoryGroup, category);
        if (typeof cat !== "undefined") {
            cat.target.assigned = amount;
        }
    }

    public deleteCategory(categoryGroup: string, name: string) {
        let group = this.m_budget.categories.find((v) => v.name === categoryGroup);
        if (typeof group !== "undefined")
            group.categories = group.categories.filter((v) => v.name !== name);
    }

    public deleteCategoryGroup(name: string) {
        this.m_budget.categories = this.m_budget.categories.filter((v) => v.name !== name);
    }

    public deleteTransaction(id: string) {
        this.m_budget.transactions = this.m_budget.transactions.filter((v) => v.id !== id);
    }

    public getAssigned(categoryGroup: string, category: string) {
        return this.getCategory(categoryGroup, category)?.target.assigned;
    }

    public toJSON() {
        return this.m_budget;
    }

    public transact(transaction: Transaction) {
        this.m_budget.transactions.push({ ...transaction });
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

    private getCategory(categoryGroup: string, category: string) {
        return this.m_budget.categories
            .find((v) => v.name === categoryGroup)
            ?.categories.find((v) => v.name === category);
    }

    public static fromJSON(json: BudgetType) {
        let budget = new Budget();
        budget.m_budget = json;
        return budget;
    }
}
