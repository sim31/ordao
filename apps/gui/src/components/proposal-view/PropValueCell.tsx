import { Table } from "@chakra-ui/react"
import { Text } from "../Text"
import { stringify } from "@ordao/ts-utils"
import { Prose } from "../ui/prose"
import Markdown from "react-markdown"
import React from "react"

export function PropValue({ value, markdown }: { value: unknown, markdown?: boolean }) {
  if (typeof value === 'string') {
    return (
      <Prose whiteSpace="pre-line" fontSize="md">
        {markdown ? <Markdown>{value}</Markdown> : value}
      </Prose>
    )
  } else if (React.isValidElement(value)) {
    return value
  } else {
    return (
      <Text fontSize="md">{stringify(value)}</Text>
    )
  }
}

export function PropValueCell({ value, md }: { value: unknown, md?: boolean }) {
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
        <PropValue markdown={md} value={value} />
      </Table.Cell>
    );
  }
}