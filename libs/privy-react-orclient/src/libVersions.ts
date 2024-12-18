import { ordaoLibVersions as orclientVersions } from "@ordao/orclient/libVersions.js";
import { PACKAGE_VERSION } from "./version";

export const ordaoLibVersions = {
  ...orclientVersions,
  privyReactOrclient: PACKAGE_VERSION
} as const;
