import { Table } from "@chakra-ui/react";
import { DecodedProposal, propSchemaMap } from "@ordao/ortypes/orclient.js";
import { PropTableRow } from "./PropTableRow";
// import { formatEthAddress } from "eth-address";
import { zRankNumToValue } from "@ordao/ortypes";
import { zodObjectFields } from "@ordao/zod-utils";

export interface ProposalContentTableProps {
  dprop: DecodedProposal
}

export function DecodedPropTable({ dprop }: ProposalContentTableProps) {
  const zPropSchema = propSchemaMap[dprop.propType]; 
  const fields = zodObjectFields(zPropSchema);

  const rows = Object.entries(dprop).filter(([key]) => key !== 'propType' && key !== 'metadata').map(([key, value]) => {
    let val = value;
    if (dprop.propType === 'respectBreakout' && key === 'rankings') {
      val = dprop.rankings.map((addr, i) => {
        return `${addr}    (+${zRankNumToValue.parse(i + 1)} Respect)`;
      })      
    }
    const fieldName = fields[key].title || key;
    return (
      <PropTableRow key={key} fieldName={fieldName} value={val} />
    )
  });
  return (
    <Table.Root size="lg" mb="0.5em">
      <Table.Body>
        {dprop.metadata.propTitle && (
          <PropTableRow fieldName="Proposal Title" value={dprop.metadata.propTitle} />
        )}
        {dprop.metadata.propDescription && (
          <PropTableRow fieldName="Proposal Description" value={dprop.metadata.propDescription} />
        )}
        {rows}
      </Table.Body>
    </Table.Root>
  );
}