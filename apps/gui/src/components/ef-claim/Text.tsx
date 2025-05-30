import { TextProps } from "@chakra-ui/react";
import { Text as OrigText } from "../Text";

export function Text(props: TextProps) {
  return <OrigText fontSize="lg" {...props} />
}