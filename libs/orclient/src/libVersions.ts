import { PACKAGE_VERSION as ORCLIENT_VERSION } from "./version.js";
import { PACKAGE_VERSION as ORTYPES_VERSION } from "@ordao/ortypes/version.js";
import { PACKAGE_VERSION as TS_UTILS_VERSION } from "@ordao/ts-utils";
import { PACKAGE_VERSION as ETHERS_DECODE_ERROR_VERSION } from "@ordao/ethers-decode-error";

// TODO: retrieve version from ornode. That should be an API call.
// And orclient method should be used to do that.
export const ordaoLibVersions = {
  orclient: ORCLIENT_VERSION,
  ortypes: ORTYPES_VERSION,
  tsUtils: TS_UTILS_VERSION,
  ethersDecodeError: ETHERS_DECODE_ERROR_VERSION
} as const;
