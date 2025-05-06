import { Button } from "@chakra-ui/react";
import { isORClient, ORClientType, Proposal } from "@ordao/orclient";

export interface ExecuteButtonProps {
  proposal: Proposal;
  onClick: () => void;
  orclient: ORClientType
}

export function ExecuteButton({ proposal, onClick, orclient } : ExecuteButtonProps) {
  if (isORClient(orclient)) {
    if (proposal.stage === 'Execution') {
      return (
        <Button
          variant="outline"
          color="black"
          onClick={onClick}
        >
          Execute
        </Button>
      );
    }
  }
}