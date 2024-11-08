import { TxHash } from "@ordao/ortypes";
import { config } from "../global/config";

export function linkToTx(txHash: TxHash): string {
  return `${config.chainInfo.blockExplorerUrl}/tx/${txHash}`
}