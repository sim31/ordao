import { zGetAwardsSpec } from "@ordao/orclient";
import { z } from "zod";

export const zAwardsSearchParams = zGetAwardsSpec.catch({});
export type AwardsSearchParams = z.infer<typeof zAwardsSearchParams>;
