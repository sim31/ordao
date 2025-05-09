import { isORClient, ORClient, ORClientType } from "@ordao/orclient";
import { OrclientNotFull, OrclientUndefined } from "../errors";

export function useOrclientAssert(): ORClientType {
  const orclient = useOrclient();
  if (orclient === undefined) {
    throw new OrclientUndefined("Orclient is undefined in useOrclientAssert");
  }
  return orclient;
}

export function useFullOrclientAssert(): ORClient {
  const orclient = useOrclient();
  if (!isORClient(orclient)) {
    throw new OrclientNotFull("Orclient is not full in useFullOrclientAssert");
  }
  return orclient;
}
