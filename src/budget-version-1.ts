import { z } from "zod";

export const Month = z.custom<`${number}-${number}`>((data) => {
    return (
        Array.isArray(data) &&
        data.length === 2 &&
        typeof data[0] === "number" &&
        typeof data[1] === "number"
    );
});

export const TargetTypes = z.union([
    z.literal("every_x_week"),
    z.literal("every_x_month"),
    z.literal("every_x_year"),
    z.literal("builder"),
    z.literal("saving"),
]);

export const TargetBase = z.object({ amount: z.number().gt(0) });

export const PeriodicTargetBase = TargetBase.extend({
    every: z.number(),
});

export const WeeklyTarget = PeriodicTargetBase.extend({
    day: z.number().min(1).max(7),
    type: z.literal("weekly"),
});

export const MonthlyTarget = PeriodicTargetBase.extend({
    day: z.number().min(1).max(31),
    type: z.literal("monthly"),
});

export const DayOfYear = Month;

export const YearlyTarget = TargetBase.extend({
    date: DayOfYear,
    type: z.literal("yearly"),
});

export const PeriodicTarget = z.union([WeeklyTarget, MonthlyTarget, YearlyTarget]);

export const Target = PeriodicTarget;

export const Category = z.object({
    assigned: z.record(Month, z.number().gt(0)),
    id: z.string().uuid(),
    name: z.string(),
    target: z.record(Month, Target),
});

export const CategoryGroup = z.object({
    categories: z.array(Category),
    id: z.string().uuid(),
    name: z.string(),
});

export const TransactionBase = z.object({
    amount: z.number(),
    date: z.number(),
    description: z.string(),
    id: z.string().uuid(),
    type: z.string(),
});

export const InflowTransaction = TransactionBase.extend({
    type: z.literal("inflow"),
});

export const OutflowTransaction = TransactionBase.extend({
    categoryId: z.string(),
    type: z.literal("outflow"),
});

export const Transaction = z.union([InflowTransaction, OutflowTransaction]);

export const BudgetType = z.object({
    categories: z.array(CategoryGroup),
    transactions: z.array(Transaction),
    version: z.literal(1),
});
