import { TxFailed } from "@ordao/orclient";
import { DecodedError } from "@ordao/ortypes";

export function decodeTxFailed(error: unknown): TxFailed | undefined {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return error as TxFailed;
  } else {
    return undefined;
  }
}

export function decodeError(error: unknown): DecodedError | undefined {
  const txFailed = decodeTxFailed(error);
  return txFailed && txFailed.decodedError;
}