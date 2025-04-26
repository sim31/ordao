import { Table } from "@chakra-ui/react"
import { PropFieldCell } from "./PropFieldCell"
import { PropValueCell } from "./PropValueCell"

export interface ProposalContentTableProps {
  fieldName: string,
  value: unknown
  auxValue?: unknown
}

export function PropTableRow({ fieldName, value, auxValue }: ProposalContentTableProps) {
  return (
    <Table.Row>
      <PropFieldCell fieldName={fieldName} />
      <PropValueCell value={value} />
      { auxValue !== undefined && <PropValueCell value={auxValue}/> }
    </Table.Row>
  )
}
