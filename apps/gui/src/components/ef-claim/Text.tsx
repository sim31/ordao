import { Text as OrigText, TextProps } from "../Text";
export type { TextProps } from "../Text";


export function Text(props: TextProps) {
  return <OrigText fontSize="lg" {...props} />
}