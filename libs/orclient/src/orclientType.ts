import { ORClient } from "./orclient";
import { ORClientReader } from "./orclientReader";

export type ORClientType = ORClient | ORClientReader | undefined;

export function isORClient(value: ORClientType): value is ORClient {
  if (value === undefined) {
    return false;
  } else {
    return 'proposeBreakoutResult' in value && 'execute' in value || 'vote' in value;
  }
}