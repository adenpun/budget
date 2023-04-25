import { z } from "zod";
import { Target as Target2 } from "./budget-version-2";

export const TransactOptionsBase = z.object({
    account: z.string().uuid(),
    amount: z.number(),
    description: z.string(),
    type: z.union([z.literal("inflow"), z.literal("outflow"), z.literal("transfer")]),
    date: z.number().optional(),
    id: z.string().optional(),
});

export const TransactOptionsInflow = TransactOptionsBase.extend({
    type: z.literal("inflow"),
});

export const TransactOptionsOutflow = TransactOptionsBase.extend({
    categoryId: z.string().uuid(),
    type: z.literal("outflow"),
});

export const TransactOptionsTransfer = TransactOptionsBase.extend({
    toAccount: z.string().uuid(),
    type: z.literal("transfer"),
});

export const TransactOptions = z.union([
    TransactOptionsInflow,
    TransactOptionsOutflow,
    TransactOptionsTransfer,
]);

export const SetTargetOptions = Target2;
