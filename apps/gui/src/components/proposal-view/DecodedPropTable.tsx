import { Table } from "@chakra-ui/react";
import { DecodedProposal, propSchemaMap, RespectBreakout, RespectBreakoutX2 } from "@ordao/ortypes/orclient.js";
import { PropTableRow } from "./PropTableRow";
// import { formatEthAddress } from "eth-address";
import { breakoutSchemas, zBreakoutType } from "@ordao/ortypes";
import { zodObjectFields } from "@ordao/zod-utils";
import { formatEthAddress } from "eth-address";
import { AwardsTable } from "./AwardsTable";

export interface ProposalContentTableProps {
  dprop: DecodedProposal
  shortenAddrs?: boolean
}

export function DecodedPropTable({ dprop, shortenAddrs }: ProposalContentTableProps) {
  const zPropSchema = propSchemaMap[dprop.propType]; 
  const fields = zodObjectFields(zPropSchema);

  function hasRankings(x: DecodedProposal): x is RespectBreakout | RespectBreakoutX2 {
    return 'rankings' in x;
  }

  const rows = Object.entries(dprop).filter(([key]) => key !== 'propType' && key !== 'metadata').map(([key, value]) => {
    let val = value;
    const btypeRes = zBreakoutType.safeParse(dprop.propType);
    if (btypeRes.success && key === 'rankings' && hasRankings(dprop)) {
      const schema = breakoutSchemas[btypeRes.data];
      val = dprop.rankings.map((addr, i) => {
        const addrStr = shortenAddrs ? formatEthAddress(addr, 6) : addr;
        const amount = schema.zRankNumToValue.parse(i + 1);
        return `${addrStr}    (+${amount} Respect)`;
      })
    } else if (dprop.propType === 'respectAccountBatch' && key === 'awards' && Array.isArray(value)) {
      // Render awards with a dedicated table
      val = <AwardsTable awards={value as any} shortenAddrs={shortenAddrs} shortenTokenIds={shortenAddrs} />
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
          <PropTableRow mdForValue fieldName="Proposal Title" value={dprop.metadata.propTitle} />
        )}
        {dprop.metadata.propDescription && (
          <PropTableRow mdForValue fieldName="Proposal Description" value={dprop.metadata.propDescription} />
        )}
        {rows}
      </Table.Body>
    </Table.Root>
  );
}