import { useContext } from "react";
import { OrclientBackupContext } from "./OrclientProvider";

export function useOrclientBackup() {
  const { orclient } = useContext(OrclientBackupContext);

  return orclient;
}