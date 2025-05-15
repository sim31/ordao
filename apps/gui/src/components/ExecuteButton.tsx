import { isORClient, Proposal } from "@ordao/orclient";
import { Button } from "./Button.js";
import { useAssertOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";

export interface ExecuteButtonProps {
  proposal: Proposal;
  onClick: () => void;
}

export function ExecuteButton({ proposal, onClick } : ExecuteButtonProps) {
  const orclient = useAssertOrclient();

  if (isORClient(orclient)) {
    if (proposal.stage === 'Execution') {
      return (
        <Button
          onClick={onClick}
        >
          Execute
        </Button>
      );
    }
  }
}