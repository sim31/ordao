import { z } from "zod";
import { addCustomIssue } from "./zErrorHandling.js";
import { zMintRespectGroupArgs, zRankNum } from "./respect1155.js";
import { zBigNumberish, zEthAddress } from "./eth.js";

export { zGroupNum, GroupNum, zRankNum } from "./respect1155.js";

export const PropTypeValues = [
  "respectBreakout", "respectAccount", "burnRespect", "tick",
  "customSignal", "customCall", "setPeriods", "setMinWeight"
] as const;
export const zPropType = z.enum(PropTypeValues);
export type PropType = z.infer<typeof zPropType>;

const rankingsDesc = `
Rankings

Contributor rankings in Respect game.

0 - top contributor
1 - 2nd best contributor
...
`
export const zRankings = z.array(zEthAddress).min(3).max(6).describe(rankingsDesc)
export type Rankings = z.infer<typeof zRankings>;

export const zValueToRanking = z.bigint().transform((val, ctx) => {
  switch (val) {
    case 55n: {
      return 6;
    }
    case 34n: {
      return 5;
    }
    case 21n: {
      return 4;
    }
    case 13n: {
      return 3;
    }
    case 8n: {
      return 2;
    }
    case 5n: {
      return 1;
    }
    default: {
      addCustomIssue(val, ctx, "value is not equal to any of possible breakout group rewards");
      return NaN;
    }
  }
});

export const zBreakoutMintRequest = zMintRespectGroupArgs.superRefine((val, ctx) => {
  try {
    for (const [i, req] of val.mintRequests.entries()) {
      const rankFromVal = zValueToRanking.parse(req.value);
      z.literal(rankFromVal).parse(6-i);
    }
  } catch (err) {
    addCustomIssue(val, ctx, err, "Error parsing zBreakoutMintRequest");
  }
});

const _rewards = [
  55n, 34n, 21n, 13n, 8n, 5n
];

export const zRankNumToValue = zRankNum.transform((rankNum, ctx) => {
  try {
    const rankIndex = rankNum - 1;
    return _rewards[rankIndex];
  } catch (err) {
    addCustomIssue(rankNum, ctx, err, "exception in zRankNumToValue");
  }
}).pipe(zBigNumberish.gt(0n));
