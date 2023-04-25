import { z } from "zod";

export const Month = z.custom<`${number}-${number}`>((data) => {
    return (
        Array.isArray(data) &&
        data.length === 2 &&
        typeof data[0] === "number" &&
        typeof data[1] === "number"
    );
});

//#region Target
export const TargetTypes = z.union([
    z.literal("every_x_week"),
    z.literal("every_x_month"),
    z.literal("every_x_year"),
    z.literal("builder"),
    z.literal("saving"),
]);

export const TargetBase = z.object({ amount: z.number().gt(0), type: TargetTypes });

export const EveryXTargetBase = TargetBase.extend({
    every: z.number(),
});

export const EveryXWeekTarget = EveryXTargetBase.extend({
    dayOfWeek: z.number().min(1).max(7),
    type: z.literal("every_x_week"),
});

export const EveryXMonthTarget = EveryXTargetBase.extend({
    dayOfMonth: z.number().min(1).max(31),
    type: z.literal("every_x_month"),
});

export const EveryXYearTarget = TargetBase.extend({
    type: z.literal("every_x_year"),
});

export const EveryXTarget = z.union([EveryXWeekTarget, EveryXMonthTarget, EveryXYearTarget]);

export const MonthlyBuilderTarget = TargetBase.extend({
    type: z.literal("builder"),
});

export const SavingTarget = TargetBase.extend({
    date: z.number(),
    type: z.literal("saving"),
});

export const Target = z.union([EveryXTarget, MonthlyBuilderTarget]);
//#endregion

//#region Category
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
//#endregion

//#region Transaction
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
//#endregion

export const Account = z.object({
    id: z.string().uuid(),
    name: z.string(),
    transactions: z.array(Transaction),
});

export const BudgetType = z.object({
    categoryGroups: z.array(CategoryGroup),
    accounts: z.array(Account),
    version: z.literal(2),
});
