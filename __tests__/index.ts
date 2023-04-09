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
    budget.addCategoryGroup("Subscriptions");

    let a = budget.toJSON();

    budget.addCategoryGroup("Subscriptions");

    expect(budget.toJSON()).toMatchObject(a);

    budget.addCategory("Subscriptions", {
        assigned: {},
        name: "Spotify",
        target: { amount: 100, day: 14, type: "monthly" },
    });

    let b = budget.toJSON();

    budget.addCategory("Subscriptions", {
        assigned: {},
        name: "Spotify",
        target: { amount: 100, day: 14, type: "monthly" },
    });

    expect(budget.toJSON()).toMatchObject(b);

    expect(budget.toJSON().categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].name).toBe("Subscriptions");
    expect(budget.toJSON().categories[0].categories).toHaveLength(1);
    expect(budget.toJSON().categories[0].categories[0].name).toBe("Spotify");

    budget.deleteCategory("Subscriptions", "Spotify");

    expect(budget.toJSON().categories[0].categories).toHaveLength(0);

    budget.deleteCategoryGroup("Subscriptions");

    expect(budget.toJSON().categories).toMatchObject([]);
    expect(budget.toJSON().categories).toHaveLength(0);
});

test("Assigning", () => {
    budget.assign("Subscriptions", "Spotify", "2023-03", 100);
    budget.assign("Subscriptions", "Spotify", "2023-03", 100);
});

test("Transaction", () => {
    budget.transact({
        amount: 100,
        date: Date.now(),
        description: "Allowance given by mom",
        id: "random-id-lol",
        type: "inflow",
    });

    expect(budget.toJSON().transactions).toHaveLength(1);
    expect(budget.balance).toBe(100);

    budget.transact({
        amount: 100,
        date: Date.now(),
        description: "Allowance given by dad",
        id: "2nd-random-id",
        type: "inflow",
    });

    expect(budget.balance).toBe(200);

    budget.transact({
        amount: 100000,
        category: "Spotify",
        categoryGroup: "Subscriptions",
        date: Date.now(),
        description: "Spotify",
        id: "3rd-random-id",
        type: "outflow",
    });

    expect(budget.balance).toBe(-99800);
    budget.deleteTransaction("3rd-random-id");
    expect(budget.balance).toBe(200);
});
