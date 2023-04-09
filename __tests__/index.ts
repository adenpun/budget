import { Budget, BudgetType } from "../src/index";

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
    budget.assign(catId, "2023-3", 100);
    expect(budget.getAssigned(catId, "2023-3")).toBe(100);
    expect(budget.getAssigned(catId, "2023-4")).toBe(null);
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
