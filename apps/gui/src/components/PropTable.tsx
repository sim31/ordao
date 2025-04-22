import { Table } from "@chakra-ui/react";
import { PropTableRow } from "./PropTableRow";
import { Proposal } from "@ordao/ortypes/orclient.js";

export interface ProposalContentTableProps {
  prop: Proposal
}

export function PropTable({ prop }: ProposalContentTableProps) {
  return (
    <Table.Root>
      <Table.Body>
        {prop.decoded?.metadata.propTitle && (
          <PropTableRow fieldName="Proposal Title" value={prop.decoded.metadata.propTitle} />
        )}
        {prop.decoded?.metadata.propDescription && (
          <PropTableRow fieldName="Proposal Description" value={prop.decoded.metadata.propDescription} />
        )}
        <PropTableRow fieldName="address" value={prop.addr} />
        <PropTableRow fieldName="callData" value={prop.cdata} />
      </Table.Body>
    </Table.Root>
  );
  
}