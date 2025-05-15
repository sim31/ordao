import { ButtonProps, Button as ChakraButton } from "@chakra-ui/react";

export const defaultButtonProps: ButtonProps = {
  color: "black",
  backgroundColor: "gray.100",
  fontSize: "md",
}

export function Button(props: ButtonProps) {
  return <ChakraButton {...defaultButtonProps} {...props} />
}