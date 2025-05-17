import { useContext } from "react";
import { OrclientContext } from "./OrclientProvider";
import { isORClient, ORClient, ORClientType } from "@ordao/orclient";

export class OrclientUndefined extends Error {
  constructor(message?: string) {
    super(message ?? "ORClient is undefined");
  }
}

export class OrclientNotFull extends Error {
  constructor(message?: string) {
    super(message ?? "ORClient is not full");
  }
}

export function useOrclient() {
  const { orclient } = useContext(OrclientContext);

  return orclient;
}

export function useAssertOrclient(): ORClientType {
  const orclient = useOrclient();
  if (orclient === undefined) {
    throw new OrclientUndefined("Orclient is undefined in useOrclientAssert");
  }
  return orclient;
}

export function useAssertFullOrclient(): ORClient {
  const orclient = useOrclient();
  if (!isORClient(orclient)) {
    throw new OrclientNotFull("Orclient is not full in useFullOrclientAssert");
  }
  return orclient;
}

