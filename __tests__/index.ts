import { Budget, BudgetType, GetClosestLastMonth, Month } from "../src/index";

let budget = new Budget();

test("Default budget", () => {
    expect(budget.toJSON()).toMatchObject<BudgetType>({
        categories: [],
        transactions: [],
        version: 1,
    });
});

test("Category", () => {
    let groupId = budget.addCategoryGroup("Subscriptions")!;

    let json1 = budget.toJSON();

    budget.addCategoryGroup("Subscriptions", groupId);

    expect(budget.toJSON()).toMatchObject(json1);

    let catId = budget.addCategory(groupId, "Spotify")!;

    let json2 = budget.toJSON();

    budget.addCategory(groupId, "Spotify", catId);

    expect(budget.toJSON()).toMatchObject(json2);

    expect(budget.toJSON().categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].name).toBe("Subscriptions");
    expect(budget.toJSON().categories[0].categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].categories[0].name).toBe("Spotify");

    budget.deleteCategory(catId);

    expect(budget.toJSON().categories[0].categories).toHaveLength(0);

    budget.deleteCategoryGroup(groupId);

    expect(budget.toJSON().categories).toMatchObject([]);
    expect(budget.toJSON().categories).toHaveLength(0);
});

test("Assigning", () => {
    let groupId = budget.addCategoryGroup("Subscriptions")!;

    let catId = budget.addCategory(groupId, "Spotify")!;

    budget.assign(catId, "2023-3", 100);
    budget.assign(catId, "2010-2", 10);
    expect(budget.getAssigned(catId, "2023-3")).toBe(100);
    expect(budget.getAssigned(catId, "2023-4")).toBe(100);
    expect(budget.getAssigned(catId, "2035-12")).toBe(100);
    expect(budget.getAssigned(catId, "2020-1")).toBe(10);

    budget.deleteCategoryGroup(groupId);
});

test("Targets", () => {
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

    budget.setTarget(catId, "2023-3", target);

    expect(budget.getTarget(catId, "2023-3")).toMatchObject(target);

    expect(budget.getTarget(catId)).toMatchObject(target);

    budget.setTarget(catId, "2023-10", target2);

    expect(budget.getTarget(catId)).not.toMatchObject(target);
    expect(budget.getTarget(catId)).toMatchObject(target2);

    budget.setTarget(catId, "2024-10", target);
    expect(budget.getTarget(catId)).toMatchObject(target);

    expect(budget.getTarget(catId, "2023-12")).toMatchObject(target2);

    budget.deleteTarget(catId, "2024-10");
    expect(budget.getTarget(catId)).toMatchObject(target2);
});

test("Transaction", () => {
    budget.transact({
        amount: 100,
        description: "Allowance given by mom",
        type: "inflow",
    });

    expect(budget.toJSON().transactions).toHaveLength(1);
    expect(budget.balance).toBe(100);

    budget.transact({
        amount: 100,
        description: "Allowance given by dad",
        type: "inflow",
    });

    expect(budget.balance).toBe(200);

    let spotifyId = budget.transact({
        amount: 100000,
        categoryId: "Spotify",
        date: Date.now(),
        description: "Spotify",
        type: "outflow",
    })!;

    expect(budget.balance).toBe(-99800);
    budget.deleteTransaction(spotifyId);
    expect(budget.balance).toBe(200);
});

test("utils", () => {
    const months: Month[] = ["2022-2", "2023-4", "2025-3", "2025-7"];
    expect(GetClosestLastMonth(months, "2022-2")).toBe("2022-2");
    expect(GetClosestLastMonth(months, "2023-2")).toBe("2022-2");
    expect(GetClosestLastMonth(months, "2023-5")).toBe("2023-4");
    expect(GetClosestLastMonth(months, "2025-3")).toBe("2025-3");
    expect(GetClosestLastMonth(months, "2025-5")).toBe("2025-3");
    expect(GetClosestLastMonth(months, "2025-9")).toBe("2025-7");
});
