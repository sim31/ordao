import { ButtonProps, Button as ChakraButton } from "@chakra-ui/react";
export type { ButtonProps } from "@chakra-ui/react";

export const defaultButtonProps: ButtonProps = {
  color: "black",
  backgroundColor: "gray.200",
  fontSize: "md",
}

export function Button(props: ButtonProps) {
  return <ChakraButton {...defaultButtonProps} {...props} />
}