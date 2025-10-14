import { z } from "zod";
import { addCustomIssue } from "./zErrorHandling.js";
import { zBreakoutMintType, zBreakoutX2MintType, zMintRespectGroupArgs, zRankNum } from "./respect1155.js";
import { zBigNumberish, zEthAddress } from "./eth.js";

export { zGroupNum, GroupNum, zRankNum } from "./respect1155.js";

export const PropTypeValues = [
  "respectBreakout", "respectBreakoutX2", "respectAccount", "burnRespect", "burnRespectBatch", "tick",
  "customSignal", "customCall", "setPeriods", "setMinWeight", "cancelProposal", "respectAccountBatch", "setMaxLiveYesVotes"
] as const;
export const zPropType = z.enum(PropTypeValues);
export type PropType = z.infer<typeof zPropType>;

export const zBreakoutType = z.enum([
  zPropType.Values.respectBreakout,
  zPropType.Values.respectBreakoutX2
]);
export type BreakoutType = z.infer<typeof zBreakoutType>;

const rankingsDesc = `
Rankings

Contributor rankings in Respect game.

0 - top contributor
1 - 2nd best contributor
...
`
export const zRankings = z.array(zEthAddress).min(3).max(6).describe(rankingsDesc)
export type Rankings = z.infer<typeof zRankings>;

export const valueToRankingMap: Record<string, number> = {
  "55": 6,
  "34": 5,
  "21": 4,
  "13": 3,
  "8": 2,
  "5": 1
} as const;

export const zValueToRanking = z.bigint().transform((val, ctx) => {
  const ranking = valueToRankingMap[val.toString()];
  if (ranking === undefined) {
    addCustomIssue(val, ctx, "value is not equal to any of possible breakout group rewards");
    return NaN;
  }
  return ranking;
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

export const valueToRankingX2Map: Record<string, number> = {
  "110": 6,
  "68": 5,
  "42": 4,
  "26": 3,
  "16": 2,
  "10": 1
} as const;

export const zValueToRankingX2 = z.bigint().transform((val, ctx) => {
  const ranking = valueToRankingX2Map[val.toString()];
  if (ranking === undefined) {
    addCustomIssue(val, ctx, "value is not equal to any of possible breakout group rewards");
    return NaN;
  }
  return ranking;
});

export const zBreakoutMintRequestX2 = zMintRespectGroupArgs.superRefine((val, ctx) => {
  try {
    for (const [i, req] of val.mintRequests.entries()) {
      const rankFromVal = zValueToRankingX2.parse(req.value);
      z.literal(rankFromVal).parse(6-i);
    }
  } catch (err) {
    addCustomIssue(val, ctx, err, "Error parsing zBreakoutMintRequest");
  }
});

const _rewardsX2 = [
  110n, 68n, 42n, 26n, 16n, 10n
]

export const zRankNumToValueX2 = zRankNum.transform((rankNum, ctx) => {
  try {
    const rankIndex = rankNum - 1;
    return _rewardsX2[rankIndex];
  } catch (err) {
    addCustomIssue(rankNum, ctx, err, "exception in zRankNumToValue");
  }
}).pipe(zBigNumberish.gt(0n));


export const breakoutSchemas = {
  [zPropType.Values.respectBreakout]: {
    "zValueToRanking": zValueToRanking,
    "zMintRequest": zBreakoutMintRequest,
    "zRankNumToValue": zRankNumToValue,
    "zMintType": zBreakoutMintType
  },
  [zPropType.Values.respectBreakoutX2]: {
    "zValueToRanking": zValueToRankingX2,
    "zMintRequest": zBreakoutMintRequestX2,
    "zRankNumToValue": zRankNumToValueX2,
    "zMintType": zBreakoutX2MintType
  }
} as const;
