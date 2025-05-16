import { Table } from "@chakra-ui/react"
import { Text } from "../Text"
import { stringify } from "@ordao/ts-utils"

export function PropValue({ value }: { value: unknown }) {
  if (typeof value === 'string') {
    return (
      <Text fontSize="md">{value}</Text>
    )
  } else {
    return (
      <Text fontSize="md">{stringify(value)}</Text>
    )
  }
}

export function PropValueCell({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    const items = value.map((item, i) => (
      <PropValue key={i} value={item} />
    ))
    return (
      <Table.Cell wordBreak="break-word">
        {items}
      </Table.Cell>
    )
  } else {
    return (
      <Table.Cell wordBreak="break-word">
        <PropValue value={value} />
      </Table.Cell>
    );
  }
}