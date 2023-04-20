import { z } from "zod";
import { Target as Target2 } from "./budget-version-2";

export const TransactOptionsBase = z.object({
    amount: z.number(),
    description: z.string(),
    type: z.string(),
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

export const TransactOptions = z.union([TransactOptionsInflow, TransactOptionsOutflow]);

export const SetTargetOptions = Target2;
