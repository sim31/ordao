import { zGetProposalsSpec } from "@ordao/orclient";
import { z } from "zod";

export const zSearchParams = zGetProposalsSpec.extend({
  before: z.number().gt(0).optional().describe("Before timestamp")
}).catch({});

export type SearchParams = z.infer<typeof zSearchParams>;