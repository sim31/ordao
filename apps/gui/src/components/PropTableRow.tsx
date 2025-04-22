import { Table } from "@chakra-ui/react"
import { PropFieldCell } from "./PropFieldCell"
import { PropValueCell } from "./PropValueCell"

export interface ProposalContentTableProps {
  fieldName: string,
  value: unknown
}

export function PropTableRow({ fieldName, value}: ProposalContentTableProps) {
  return (
    <Table.Row>
      <PropFieldCell fieldName={fieldName} />
      <PropValueCell value={value} />
    </Table.Row>
  )
}
