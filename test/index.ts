import { Budget } from "../src/index";

let a = new Budget();

console.log(a.toString());

a.addCategoryGroup("Subscriptions");
a.addCategory("Subscriptions", {
    name: "Spotify",
    target: { amount: 100, assigned: 0, day: 14, type: "monthly" },
});

a.transact({
    amount: 100,
    date: Date.now(),
    description: "Allowance given by mom",
    id: "hidfgsdf",
    type: "inflow",
});

a.transact({
    amount: 100,
    date: Date.now(),
    description: "Allowance given by dad",
    id: "12h8eqfh",
    type: "inflow",
});

a.transact({
    amount: 100000,
    category: "Spotify",
    categoryGroup: "Subscriptions",
    date: Date.now(),
    description: "Spotify",
    id: "asdhadf",
    type: "outflow",
});

console.log(a.balance);
a.removeTransaction("asdhadf");
console.log(a.balance);

console.log(a.toString());
