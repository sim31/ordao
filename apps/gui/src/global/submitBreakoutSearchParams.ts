import { zGroupNum } from "@ordao/ortypes";
import { z } from "zod";

export const zSearchParams = z.object({
  groupNumber: zGroupNum.optional().catch(undefined),
  vote1: z.string().optional().catch(''),
  vote2: z.string().optional().catch(''),
  vote3: z.string().optional().catch(''),
  vote4: z.string().optional().catch(''),
  vote5: z.string().optional().catch(''),
  vote6: z.string().optional().catch(''),
});
export type SearchParams = z.infer<typeof zSearchParams>;

export function isSearchParamsKey(key: string): key is keyof SearchParams {
  return key in zSearchParams.shape;
}