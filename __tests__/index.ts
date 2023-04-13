import {
    Budget,
    BudgetType,
    GetClosestLastMonth,
    Month,
    NextMonth,
    PreviousMonth,
} from "../src/index";

// * Initialization
let budget = new Budget();

test("Default budget", () => {
    // * Checks
    expect(budget.toJSON()).toMatchObject<BudgetType>({
        categories: [],
        transactions: [],
        version: 1,
    });
});

test("Category", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    // * Checks
    expect(budget.toJSON().categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].name).toBe("Subscriptions");
    expect(budget.toJSON().categories[0].categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].categories[0].name).toBe("Spotify");

    // * Delete Category
    budget.deleteCategory(catId);

    // * Checks
    expect(budget.toJSON().categories[0].categories).toHaveLength(0);

    // * Delete CategoryGroup
    budget.deleteCategoryGroup(groupId);

    // * Checks
    expect(budget.toJSON().categories).toHaveLength(0);
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
    expect(budget.getAssigned(catId, "2023-4")).toBe(100);
    expect(budget.getAssigned(catId, "2035-12")).toBe(100);
    expect(budget.getAssigned(catId, "2020-1")).toBe(10);

    // * Delete CategoryGroup
    budget.deleteCategoryGroup(groupId);
});

test("Target", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    const target = {
        amount: 100,
        day: 23,
        type: "monthly",
    } as const;

    const target2 = {
        amount: 1000,
        day: 14,
        type: "monthly",
    } as const;

    // * Set target to target in 2023-3
    budget.setTarget(catId, "2023-3", target);
    // * Set target to target2 in 2023-10
    budget.setTarget(catId, "2023-10", target2);
    // * Set target to target in 2024-10
    budget.setTarget(catId, "2024-10", target);

    // * Checks
    expect(budget.getTarget(catId)).toMatchObject(target);
    expect(budget.getTarget(catId, "2023-3")).toMatchObject(target);
    expect(budget.getTarget(catId, "2023-12")).toMatchObject(target2);

    // * Delete Target
    budget.deleteTarget(catId, "2024-10");

    // * Checks
    expect(budget.getTarget(catId)).toMatchObject(target2);
});

test("Transaction", () => {
    // * Create CategoryGroup & Category
    let groupId = budget.addCategoryGroup("Subscriptions")!;
    let catId = budget.addCategory(groupId, "Spotify")!;

    // * Transact $100 to me in 2021-11-30
    budget.transact({
        amount: 100,
        date: new Date("2021-11-30").getTime(),
        description: "Allowance given by mom",
        type: "inflow",
    });

    // * Checks
    expect(budget.getBalance()).toBe(100);

    // * Transact $100 to me in 2022-03-09
    budget.transact({
        amount: 100,
        date: new Date("2022-03-09").getTime(),
        description: "Allowance given by dad",
        type: "inflow",
    });

    // * Checks
    expect(budget.getBalance()).toBe(200);
    expect(budget.getBalance("2022-2")).toBe(100);
    expect(budget.getBalance("2022-12")).toBe(200);

    // * Assign $50 in 2022-1
    budget.assign(catId, "2021-11", 50);

    // * Checks
    expect(budget.getAvailable("2021-11")).toBe(50);
    expect(budget.getAvailable("2023-1")).toBe(150);
    expect(budget.getAvailable("2024-1")).toBe(150);

    // * Transact $100000 to Spotify in Date.now()
    let transId = budget.transact({
        amount: 100_000,
        categoryId: catId,
        date: Date.now(),
        description: "Spotify",
        type: "outflow",
    })!;

    // * Checks
    expect(budget.getBalance()).toBe(-99800);

    // * Delete transaction
    budget.deleteTransaction(transId);

    // * Checks
    expect(budget.getBalance()).toBe(200);
});

test("Utils", () => {
    const months: Month[] = ["2022-2", "2023-4", "2025-3", "2025-7"];
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
