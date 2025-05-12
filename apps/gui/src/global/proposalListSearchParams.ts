import { zGetProposalsSpec } from "@ordao/orclient";
import { z } from "zod";

export const zSearchParams = zGetProposalsSpec.catch({});

export type SearchParams = z.infer<typeof zSearchParams>;