import {
    Budget,
    BudgetType,
    GetClosestLastMonth,
    Month,
    NextMonth,
    PreviousMonth,
    Target,
    Transaction,
    z,
} from "../src/index";
import type { BudgetType as BudgetType1 } from "../src/budget-version-1";

// * Initialization
let budget = new Budget();

test("Default budget", () => {
    // * Checks
    expect(budget.toJSON()).toMatchObject<z.infer<typeof BudgetType>>({
        accounts: [],
        categoryGroups: [],
        version: 2,
    });
});

test("Update", () => {
    let updated = Budget.Update({
        categories: [
            {
                categories: [
                    {
                        assigned: { "2023-4": 150 },
                        id: "8e680180-7933-4f86-9ac4-097a75c1f065",
                        name: "Transport",
                        target: { "2023-4": { amount: 75, day: 1, type: "weekly" } },
                    },
                    {
                        assigned: { "2023-4": 188 },
                        id: "dbd1ed7b-4975-4786-8fac-2259dc4aa08f",
                        name: "Subscription",
                        target: { "2023-4": { amount: 188, day: 1, type: "monthly" } },
                    },
                    {
                        assigned: { "2023-4": 292 },
                        id: "67e8e89c-b9d3-489d-9733-df8e04f6bb7b",
                        name: "Food",
                        target: { "2023-4": { amount: 250, day: 1, type: "weekly" } },
                    },
                ],
                id: "e2e3f107-3ba9-40ad-ac3c-547c91214b50",
                name: "Fixed",
            },
            {
                categories: [
                    {
                        assigned: { "2023-4": 13900 },
                        id: "72cf2907-aee2-4396-994b-a46d7f7cfe64",
                        name: "Others",
                        target: {},
                    },
                ],
                id: "b2b07782-c497-4b5e-985e-9057a7f6134e",
                name: "Non-Monthly",
            },
        ],
        transactions: [
            {
                amount: 6.5,
                categoryId: "8e680180-7933-4f86-9ac4-097a75c1f065",
                date: 1682499988841,
                description: "mtr",
                id: "d6773242-974a-4ed4-950b-927d072309a5",
                type: "outflow",
            },
            {
                amount: 20,
                categoryId: "67e8e89c-b9d3-489d-9733-df8e04f6bb7b",
                date: 1682498788376,
                description: "sandwich and chicken",
                id: "3dad8b2d-72b3-4de7-9457-b1852cf41f2f",
                type: "outflow",
            },
            {
                amount: 95,
                categoryId: "dbd1ed7b-4975-4786-8fac-2259dc4aa08f",
                date: 1682462505685,
                description: "nord",
                id: "13e8556b-29cb-4092-9683-7dc4a7b7da1e",
                type: "outflow",
            },
            {
                amount: 300,
                date: 1682462054325,
                description: "mom money",
                id: "e1abd776-96aa-43a6-9bbb-9bebcf1cad99",
                type: "inflow",
            },
        ],
        version: 1,
    } as z.infer<typeof BudgetType1>)!;

    // * Checks
    expect(updated.version).toBe(2);
    expect(updated.categoryGroups).toHaveLength(2);
    expect(updated.accounts).toHaveLength(1);
    expect(updated.accounts[0].name).toBe("Main");
    expect(updated.accounts[0].transactions[0]).toMatchObject<z.infer<typeof Transaction>>({
        amount: 6.5,
        categoryId: "8e680180-7933-4f86-9ac4-097a75c1f065",
        date: 1682499988841,
        description: "mtr",
        id: "d6773242-974a-4ed4-950b-927d072309a5",
        type: "outflow",
    });
});

test("FromJSON", () => {
    expect(() =>
        // @ts-expect-error
        Budget.FromJSON({
            categoryGroups: [],
            version: 2,
        })
    ).toThrow();
    expect(() =>
        Budget.FromJSON({
            accounts: [],
            categoryGroups: [],
            version: 2,
        })
    ).not.toThrow();
});

test("Category", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    // * Checks
    expect(budget.toJSON().categoryGroups).toHaveLength(1);
    expect(budget.toJSON().categoryGroups[0].name).toBe("Subscriptions");
    expect(budget.toJSON().categoryGroups[0].categories).toHaveLength(1);
    expect(budget.toJSON().categoryGroups[0].categories[0].name).toBe("Spotify");

    // * Delete Category
    budget.deleteCategory(catId);

    // * Checks
    expect(budget.toJSON().categoryGroups[0].categories).toHaveLength(0);

    // * Delete CategoryGroup
    budget.deleteCategoryGroup(groupId);

    // * Checks
    expect(budget.toJSON().categoryGroups).toHaveLength(0);
});

test("Assign", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    // * Assign $10 in 2010-2
    budget.assign(catId, "2010-2", 10);
    // * Assign $100 in 2023-3
    budget.assign(catId, "2023-3", 100);

    // * Checks
    expect(budget.getAssigned(catId, "2023-3")).toBe(100);
    expect(budget.getAssigned(catId, "2023-5")).toBeNull();
    expect(budget.getAssigned(catId, "2035-12", true)).toBe(100);
    expect(budget.getAssigned(catId, "2035-12", true, true)).toBe(110);
    expect(budget.getAssigned(catId, "2020-1", true)).toBe(10);
    expect(budget.getAssignLimit("2023-2")).toBe(-10);
    expect(budget.getAssignLimit("2023-3")).toBe(-110);

    // * Delete CategoryGroup
    budget.deleteCategoryGroup(groupId);
});

test("Target", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    const target = {
        amount: 100,
        dayOfMonth: 23,
        every: 1,
        type: "every_x_month",
    } as z.infer<typeof Target>;

    const target2 = {
        amount: 1000,
        dayOfMonth: 23,
        every: 1,
        type: "every_x_month",
    } as z.infer<typeof Target>;

    // * Set target to target in 2023-3
    budget.setTarget(catId, "2023-3", target);
    // * Set target to target2 in 2023-10
    budget.setTarget(catId, "2023-10", target2);
    // * Set target to target in 2024-10
    budget.setTarget(catId, "2024-10", target);

    // * Checks
    expect(budget.getTarget(catId, "2023-3")).toMatchObject(target);
    expect(budget.getTarget(catId, "2023-12")).toMatchObject(target2);

    // * Delete Target
    budget.deleteTarget(catId, "2024-10");

    // * Checks
    expect(budget.getTarget(catId, "2024-10")).toMatchObject(target2);
});

test("Transaction", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    let account1 = budget.addAccount("Checking")!;
    let account2 = budget.addAccount("Savings")!;

    // * Transact $100 to me in 2021-11-30
    budget.transact({
        account: account1,
        amount: 100,
        date: new Date("2021-11-30").getTime(),
        description: "Allowance given by mom",
        type: "inflow",
    });

    // * Checks
    expect(budget.getBalance("2022-1")).toBe(100);

    // * Transact $100 to me in 2022-03-09
    budget.transact({
        account: account2,
        amount: 100,
        date: new Date("2022-03-09").getTime(),
        description: "Allowance given by dad",
        type: "inflow",
    });

    // * Checks
    expect(budget.getBalance("2022-2")).toBe(100);
    expect(budget.getBalance("2022-2", account1)).toBe(100);
    expect(budget.getBalance("2022-2", account2)).toBe(0);
    expect(budget.getBalance("2022-12")).toBe(200);

    // * Assign $50 in 2022-1
    budget.assign(catId, "2021-11", 50);

    // * Checks
    expect(budget.getAssignLimit("2021-11")).toBe(50);
    expect(budget.getAssignLimit("2023-1")).toBe(150);
    expect(budget.getAssignLimit("2024-1")).toBe(150);
    expect(budget.getAvailable(catId, "2021-11")).toBe(50);

    // * Transact $100000 to Spotify in Date.now()
    let transId = budget.transact({
        account: account1,
        amount: 100_000,
        categoryId: catId,
        date: new Date("2022-10-09").getTime(),
        description: "Spotify 1000-year-subscription",
        type: "outflow",
    })!;

    // * Checks
    expect(budget.getAvailable(catId, "2022-11")).toBe(-99950);
    expect(budget.getBalance("2022-10")).toBe(-99800);
    expect(budget.getTransactionsOfCategory("random-id-lol", "2022-10")).toHaveLength(0);
    expect(budget.getTransactionsOfCategory(catId, "2022-10")).toHaveLength(1);

    // * Delete transaction
    budget.deleteTransaction(transId);

    // * Checks
    expect(budget.getBalance("2022-10")).toBe(200);
});

test("Utils", () => {
    const months: z.infer<typeof Month>[] = ["2022-2", "2023-4", "2025-3", "2025-7"];
    expect(GetClosestLastMonth(months, "2022-2")).toBe("2022-2");
    expect(GetClosestLastMonth(months, "2023-2")).toBe("2022-2");
    expect(GetClosestLastMonth(months, "2023-5")).toBe("2023-4");
    expect(GetClosestLastMonth(months, "2025-3")).toBe("2025-3");
    expect(GetClosestLastMonth(months, "2025-5")).toBe("2025-3");
    expect(GetClosestLastMonth(months, "2025-9")).toBe("2025-7");

    expect(NextMonth("2022-1")).toBe("2022-2");
    expect(NextMonth("2022-2")).toBe("2022-3");
    expect(NextMonth("2022-12")).toBe("2023-1");
    expect(NextMonth("2029-12")).toBe("2030-1");
    expect(PreviousMonth("2022-12")).toBe("2022-11");
    expect(PreviousMonth("2022-1")).toBe("2021-12");
    expect(PreviousMonth("2022-3")).toBe("2022-2");
    expect(PreviousMonth("1997-7")).toBe("1997-6");
});
