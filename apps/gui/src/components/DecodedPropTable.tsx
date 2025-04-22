import { Table } from "@chakra-ui/react";
import { DecodedProposal } from "@ordao/ortypes/orclient.js";
import { PropTableRow } from "./PropTableRow";

export interface ProposalContentTableProps {
  dprop: DecodedProposal
}

export function DecodedPropTable({ dprop }: ProposalContentTableProps) {
  return (
    <Table.Root>
      <Table.Body>
        {dprop.metadata.propTitle && (
          <PropTableRow fieldName="Proposal Title" value={dprop.metadata.propTitle} />
        )}
        {dprop.metadata.propDescription && (
          <PropTableRow fieldName="Proposal Description" value={dprop.metadata.propDescription} />
        )}
        {Object.entries(dprop).filter(([key]) => key !== 'propType' && key !== 'metadata').map(([key, value]) => (
          <PropTableRow fieldName={key} value={value} />
        ))}
      </Table.Body>
    </Table.Root>
  );
}